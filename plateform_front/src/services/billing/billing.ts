export interface CreditBalance {
    balance: number;
    currency: string;
}

export interface PaymentMethod {
    id: string;
    last4: string;
    brand: string;
    expiry: string;
}

export interface CreditPackage {
    id: string;
    credits: number;
    price: number;
    currency: string;
}

export const billingApi = {
    getBalance: async (): Promise<CreditBalance> => {
        return { balance: 250, currency: "EUR" };
    },

    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        return [{ id: "1", last4: "4242", brand: "Visa", expiry: "12/26" }];
    },

    addPaymentMethod: async (): Promise<PaymentMethod> => {
        throw new Error("Non implémenté - connecter Stripe");
    },

    removePaymentMethod: async (id: string): Promise<void> => {
        throw new Error("Non implémenté - connecter Stripe");
    },

    getCreditPackages: async (): Promise<CreditPackage[]> => {
        return [
            { id: "100", credits: 100, price: 9.99, currency: "EUR" },
            { id: "500", credits: 500, price: 39.99, currency: "EUR" },
            { id: "1000", credits: 1000, price: 69.99, currency: "EUR" },
            { id: "5000", credits: 5000, price: 299.99, currency: "EUR" },
        ];
    },

    purchaseCredits: async (packageId: string, paymentMethodId: string): Promise<{ newBalance: number }> => {
        throw new Error("Non implémenté - connecter Stripe");
    },
};
