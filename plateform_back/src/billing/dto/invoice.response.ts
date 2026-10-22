import Stripe from 'stripe';

export interface InvoiceResponse {
    id: string;
    number: string | null;
    createdAt: Date;
    label: string;
    /** Tax included, in the smallest unit of `currency`. */
    totalCents: number;
    currency: string;
    status: Stripe.Invoice.Status | null;
    pdfUrl: string | null;
}
