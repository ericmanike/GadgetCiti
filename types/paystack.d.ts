declare module '@paystack/inline-js' {
    interface CustomField {
        display_name: string;
        variable_name: string;
        value: string;
    }

    interface TransactionOptions {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        channels?: string[];
        metadata?: {
            custom_fields?: CustomField[];
            [key: string]: unknown;
        };
        onSuccess?: (transaction: { reference: string;[key: string]: unknown }) => void;
        onCancel?: () => void;
        onError?: (error: Error) => void;
    }

    class PaystackPop {
        newTransaction(options: TransactionOptions): void;
    }

    export default PaystackPop;
}
