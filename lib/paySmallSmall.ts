import { supabase } from './supabase';

export interface PaymentRecord {
    id: string;
    amount: number;
    date: string;
    reference: string;
    status: 'success' | 'failed';
}

export interface PaySmallSmallPlan {
    id: string;
    user_id: string;
    product_id: string;
    product_name: string;
    product_brand: string;
    product_image: string;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    frequency: 'weekly' | 'bi-weekly' | 'monthly';
    installments_count: number;
    installment_amount: number;
    status: 'active' | 'completed' | 'delivered';
    created_at: string;
    payments: PaymentRecord[];
}

const LOCAL_STORAGE_PREFIX = 'letronix-pay-small-small-';

// Local storage helpers
function getLocalPlans(userId: string): PaySmallSmallPlan[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to parse local plans:', e);
        return [];
    }
}

function saveLocalPlans(userId: string, plans: PaySmallSmallPlan[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(plans));
    } catch (e) {
        console.error('Failed to save local plans:', e);
    }
}

// Service Methods
export async function fetchUserPlans(userId: string): Promise<PaySmallSmallPlan[]> {
    try {
        const { data, error } = await supabase
            .from('pay_small_small')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            // Relation doesn't exist or permission denied -> fallback to local storage
            console.warn('Supabase fetch failed (probably table missing), falling back to localStorage:', error.message);
            return getLocalPlans(userId);
        }

        return (data || []) as PaySmallSmallPlan[];
    } catch (err) {
        console.warn('Exception during Supabase fetch, using localStorage:', err);
        return getLocalPlans(userId);
    }
}

export async function createSmallSmallPlan(
    userId: string,
    planData: {
        product_id: string;
        product_name: string;
        product_brand: string;
        product_image: string;
        total_amount: number;
        down_payment: number;
        frequency: 'weekly' | 'bi-weekly' | 'monthly';
        installments_count: number;
        payment_reference: string;
    }
): Promise<PaySmallSmallPlan> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const now = new Date().toISOString();
    
    const initialPayment: PaymentRecord = {
        id: `pay-${Math.random().toString(36).substring(2, 9)}`,
        amount: planData.down_payment,
        date: now,
        reference: planData.payment_reference,
        status: 'success'
    };

    const remainingBalance = planData.total_amount - planData.down_payment;
    const isFullyPaid = remainingBalance <= 0;
    
    const newPlan: PaySmallSmallPlan = {
        id,
        user_id: userId,
        product_id: planData.product_id,
        product_name: planData.product_name,
        product_brand: planData.product_brand,
        product_image: planData.product_image,
        total_amount: planData.total_amount,
        paid_amount: planData.down_payment,
        balance_amount: remainingBalance,
        frequency: planData.frequency,
        installments_count: planData.installments_count,
        installment_amount: Number((remainingBalance / planData.installments_count).toFixed(2)),
        status: isFullyPaid ? 'completed' : 'active',
        created_at: now,
        payments: [initialPayment]
    };

    try {
        const { data, error } = await supabase
            .from('pay_small_small')
            .insert(newPlan)
            .select()
            .single();

        if (error) {
            console.warn('Supabase insert failed, using localStorage:', error.message);
            const plans = getLocalPlans(userId);
            plans.unshift(newPlan);
            saveLocalPlans(userId, plans);
            return newPlan;
        }

        return data as PaySmallSmallPlan;
    } catch (err) {
        console.warn('Exception during Supabase insert, using localStorage:', err);
        const plans = getLocalPlans(userId);
        plans.unshift(newPlan);
        saveLocalPlans(userId, plans);
        return newPlan;
    }
}

export async function addInstallmentPayment(
    userId: string,
    planId: string,
    amount: number,
    reference: string
): Promise<PaySmallSmallPlan> {
    const now = new Date().toISOString();
    const paymentId = `pay-${Math.random().toString(36).substring(2, 9)}`;
    const newPayment: PaymentRecord = {
        id: paymentId,
        amount,
        date: now,
        reference,
        status: 'success'
    };

    // First attempt to fetch the existing plan
    let plans = getLocalPlans(userId);
    let plan = plans.find(p => p.id === planId);

    // Fetch from Supabase if we can
    try {
        const { data: dbPlan, error: fetchErr } = await supabase
            .from('pay_small_small')
            .select('*')
            .eq('id', planId)
            .single();

        if (!fetchErr && dbPlan) {
            const currentPlan = dbPlan as PaySmallSmallPlan;
            const updatedPayments = [...(currentPlan.payments || []), newPayment];
            const updatedPaid = Number((currentPlan.paid_amount + amount).toFixed(2));
            const updatedBalance = Number((currentPlan.total_amount - updatedPaid).toFixed(2));
            const newStatus = updatedBalance <= 0 ? 'completed' : currentPlan.status;

            const { data: updatedDbPlan, error: updateErr } = await supabase
                .from('pay_small_small')
                .update({
                    payments: updatedPayments,
                    paid_amount: updatedPaid,
                    balance_amount: updatedBalance,
                    status: newStatus
                })
                .eq('id', planId)
                .select()
                .single();

            if (!updateErr && updatedDbPlan) {
                return updatedDbPlan as PaySmallSmallPlan;
            }
        }
    } catch (err) {
        console.warn('Supabase payment update exception, falling back to local storage:', err);
    }

    // Local Storage Fallback implementation
    if (plan) {
        plan.payments.push(newPayment);
        plan.paid_amount = Number((plan.paid_amount + amount).toFixed(2));
        plan.balance_amount = Number((plan.total_amount - plan.paid_amount).toFixed(2));
        if (plan.balance_amount <= 0) {
            plan.status = 'completed';
        }
        saveLocalPlans(userId, plans);
        return plan;
    }

    throw new Error('Plan not found');
}

export async function updatePlanDeliveryStatus(
    userId: string,
    planId: string,
    status: 'completed' | 'delivered'
): Promise<PaySmallSmallPlan> {
    try {
        const { data, error } = await supabase
            .from('pay_small_small')
            .update({ status })
            .eq('id', planId)
            .select()
            .single();

        if (!error && data) {
            return data as PaySmallSmallPlan;
        }
    } catch (err) {
        console.warn('Supabase delivery update exception:', err);
    }

    const plans = getLocalPlans(userId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
        plan.status = status;
        saveLocalPlans(userId, plans);
        return plan;
    }

    throw new Error('Plan not found');
}
