import React from "react";
import { Card, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Download, ReceiptText } from "lucide-react";
import { CardEmptyState } from "components/Dashboard/CardEmptyState";
import Button from "components/ui/Button";
import RowContainer from "components/ui/RowContainer";
import { useGetInvoicesQuery } from "services/billing/billing";
import type { Invoice } from "types/billing/billing";

const STATUS_LABELS: Record<NonNullable<Invoice["status"]>, { label: string; color: string }> = {
    paid: { label: "Payée", color: "iconAccent" },
    open: { label: "À payer", color: "textLabel" },
    uncollectible: { label: "Impayée", color: "textLabel" },
    void: { label: "Annulée", color: "textFaint" },
    draft: { label: "Brouillon", color: "textFaint" },
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const fmtAmount = ({ totalCents, currency }: Invoice) =>
    (totalCents / 100).toLocaleString("fr-FR", { style: "currency", currency: currency.toUpperCase() });

const InvoiceRow = ({ invoice }: { invoice: Invoice }) => {
    const status = invoice.status ? STATUS_LABELS[invoice.status] : null;
    const link = invoice.pdfUrl;

    return (
        <RowContainer px={{ base: 3, md: 4 }} py={3} spacing={4}>
            <VStack align="start" spacing={0} flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="semibold" color="textPrimary" noOfLines={1}>
                    {invoice.label}
                </Text>
                <Text variant="body-xs-muted" noOfLines={1}>
                    {fmtDate(invoice.createdAt)}
                    {invoice.number && ` · ${invoice.number}`}
                </Text>
            </VStack>
            {status && (
                <Text fontSize="xs" fontWeight="semibold" color={status.color} display={{ base: "none", sm: "block" }}>
                    {status.label}
                </Text>
            )}
            <Text fontSize="sm" fontWeight="semibold" color="textPrimary" minW="80px" textAlign="right">
                {fmtAmount(invoice)}
            </Text>
            <Button
                // Stripe serves the PDF as an attachment: the page stays where it is.
                onClick={() => link && window.location.assign(link)}
                btnType="icon"
                size="sm"
                variant="ghost"
                icon={Download}
                aria-label={`Télécharger la facture ${invoice.number ?? ""}`}
                isDisabled={!link}
            />
        </RowContainer>
    );
};

const InvoicesCard: React.FC<{ workspaceId: string }> = ({ workspaceId }) => {
    const { data: invoices, isLoading, isError } = useGetInvoicesQuery(workspaceId);

    const renderBody = () => {
        if (isLoading) return <Skeleton h="120px" />;
        if (isError) {
            return (
                <Text variant="body-sm-muted" p={4}>
                    Impossible de charger vos factures.
                </Text>
            );
        }
        if (!invoices?.length) {
            return (
                <CardEmptyState
                    icon={ReceiptText}
                    title="Aucune facture"
                    description="Vos factures d'abonnement et de recharge apparaîtront ici."
                />
            );
        }
        return invoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} />);
    };

    return (
        <VStack w="100%" align="stretch" spacing={3}>
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="textPrimary">
                Factures
            </Text>
            <Card size="none" overflow="hidden">
                {renderBody()}
            </Card>
        </VStack>
    );
};

export default InvoicesCard;
