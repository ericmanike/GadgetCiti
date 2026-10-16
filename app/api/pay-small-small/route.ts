import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/pay-small-small - Fetch installment plans (filtered by user_id if provided)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');

    let query = supabase.from('pay_small_small').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[PaySmallSmall API] Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[PaySmallSmall API] Error in GET /api/pay-small-small:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/pay-small-small - Create a new installment plan
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id,
      product_id,
      product_name,
      product_brand,
      product_image,
      total_amount,
      down_payment,
      frequency,
      installments_count,
      payment_reference,
    } = body;

    if (!product_name || total_amount === undefined || total_amount === null) {
      return NextResponse.json(
        { error: 'Missing required fields: product_name and total_amount are required' },
        { status: 400 }
      );
    }

    const totalAmount = Number(total_amount);
    const downPayment = Number(down_payment || 0);
    const count = Number(installments_count || 1);
    const remainingBalance = Number((totalAmount - downPayment).toFixed(2));
    const installmentAmount = count > 0 ? Number((remainingBalance / count).toFixed(2)) : 0;
    const isFullyPaid = remainingBalance <= 0;
    const now = new Date().toISOString();

    const initialPayment = downPayment > 0 ? {
      id: `pay-${Math.random().toString(36).substring(2, 9)}`,
      amount: downPayment,
      date: now,
      reference: payment_reference || `REF-${Date.now()}`,
      status: 'success'
    } : null;

    const planData = {
      user_id: user_id || null,
      product_id: product_id ? String(product_id) : null,
      product_name,
      product_brand: product_brand || '',
      product_image: product_image || '',
      total_amount: totalAmount,
      paid_amount: downPayment,
      balance_amount: Math.max(0, remainingBalance),
      frequency: frequency || 'monthly',
      installments_count: count,
      installment_amount: installmentAmount,
      status: isFullyPaid ? 'completed' : 'active',
      payments: initialPayment ? [initialPayment] : [],
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('pay_small_small')
      .insert(planData)
      .select()
      .single();

    if (error) {
      console.error('[PaySmallSmall API] Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('[PaySmallSmall API] Error in POST /api/pay-small-small:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
