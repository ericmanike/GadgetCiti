import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ planId: string }> | { planId: string };
}

const VALID_STATUSES = ['active', 'completed', 'delivered', 'cancelled'];

// Helper handler for updating status via PUT or PATCH
async function handleStatusUpdate(req: Request, params: RouteParams['params']) {
  try {
    const { planId } = await Promise.resolve(params);

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid or missing status. Valid values: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('pay_small_small')
      .update({
        status,
        updated_at: now
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error(`[PaySmallSmall API] Status update error for plan ${planId}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[PaySmallSmall API] Error in status update handler:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/pay-small-small/[planId]/status
export async function PUT(req: Request, { params }: RouteParams) {
  return handleStatusUpdate(req, params);
}

// PATCH /api/pay-small-small/[planId]/status
export async function PATCH(req: Request, { params }: RouteParams) {
  return handleStatusUpdate(req, params);
}
