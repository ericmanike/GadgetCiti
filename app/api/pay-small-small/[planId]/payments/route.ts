import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ planId: string }> | { planId: string };
}

// POST /api/pay-small-small/[planId]/payments - Add an installment payment to a plan
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { planId } = await Promise.resolve(params);

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { amount, reference } = body;

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return NextResponse.json({ error: 'A valid payment amount is required' }, { status: 400 });
    }

    const payAmount = Number(amount);

    // 1. Fetch current plan
    const { data: currentPlan, error: fetchErr } = await supabase
      .from('pay_small_small')
      .select('*')
      .eq('id', planId)
      .single();

    if (fetchErr || !currentPlan) {
      console.error(`[PaySmallSmall API] Plan not found for ID ${planId}:`, fetchErr);
      return NextResponse.json({ error: 'Installment plan not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const newPayment = {
      id: `pay-${Math.random().toString(36).substring(2, 9)}`,
      amount: payAmount,
      date: now,
      reference: reference || `REF-${Date.now()}`,
      status: 'success'
    };

    const existingPayments = Array.isArray(currentPlan.payments) ? currentPlan.payments : [];
    const updatedPayments = [...existingPayments, newPayment];
    const updatedPaid = Number((Number(currentPlan.paid_amount || 0) + payAmount).toFixed(2));
    const updatedBalance = Number((Number(currentPlan.total_amount) - updatedPaid).toFixed(2));
    const newStatus = updatedBalance <= 0 ? 'completed' : currentPlan.status;

    // 2. Update plan in database
    const { data: updatedPlan, error: updateErr } = await supabase
      .from('pay_small_small')
      .update({
        payments: updatedPayments,
        paid_amount: updatedPaid,
        balance_amount: Math.max(0, updatedBalance),
        status: newStatus,
        updated_at: now
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateErr) {
      console.error(`[PaySmallSmall API] Update error for plan payment ${planId}:`, updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json(updatedPlan);
  } catch (error: any) {
    console.error('[PaySmallSmall API] Error in POST /api/pay-small-small/[planId]/payments:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
