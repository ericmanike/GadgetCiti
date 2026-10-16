import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ planId: string }> | { planId: string };
}

// GET /api/pay-small-small/[planId] - Get a single plan by ID
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { planId } = await Promise.resolve(params);

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pay_small_small')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      console.error(`[PaySmallSmall API] Fetch error for plan ${planId}:`, error);
      return NextResponse.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[PaySmallSmall API] Error in GET /api/pay-small-small/[planId]:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/pay-small-small/[planId] - Delete an installment plan by ID
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { planId } = await Promise.resolve(params);

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('pay_small_small')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error(`[PaySmallSmall API] Delete error for plan ${planId}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Plan ${planId} deleted successfully` });
  } catch (error: any) {
    console.error('[PaySmallSmall API] Error in DELETE /api/pay-small-small/[planId]:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
