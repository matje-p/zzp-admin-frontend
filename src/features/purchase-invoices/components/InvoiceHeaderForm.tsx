import React from "react";
import type { PurchaseInvoice, Contact } from "@/types";
import type { Subscription } from "@/types/subscription";
import { Input, Select, Badge } from "@/components/common";

interface InvoiceHeaderFormProps {
  invoice: PurchaseInvoice;
  contacts: Contact[] | undefined;
  subscriptions: Subscription[] | undefined;
  onInvoiceChange: (updates: Partial<PurchaseInvoice>) => void;
}

export const InvoiceHeaderForm: React.FC<InvoiceHeaderFormProps> = ({
  invoice,
  contacts,
  subscriptions,
  onInvoiceChange,
}) => {
  const isSubscriptionInvoice = !!invoice.subscriptionUuid;

  return (
    <div className="invoice-detail-top">
      <div className="detail-field">
        <span className="field-label">Contact</span>
        <Select
          className="form-select field-input"
          value={invoice.contactUuid || ""}
          onChange={(e) => {
            const contactUuid = e.target.value;
            const contact = contacts?.find((c) => c.uuid === contactUuid);
            onInvoiceChange({
              contactUuid: contactUuid || null,
              contactName: contact?.name || null,
              contact: contact,
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.stopPropagation();
          }}
        >
          {contacts?.map((contact) => (
            <option key={contact.uuid} value={contact.uuid}>
              {contact.name}
            </option>
          ))}
        </Select>
      </div>

      {isSubscriptionInvoice ? (
        <div className="detail-field">
          <span className="field-label">Subscription</span>
          <Select
            className="form-select field-input"
            value={invoice.subscriptionUuid || ""}
            onChange={(e) => {
              const subscriptionUuid = e.target.value;
              const subscription = subscriptions?.find(
                (s) => s.uuid === subscriptionUuid
              );
              onInvoiceChange({
                subscriptionUuid: subscriptionUuid || null,
                subscription: subscription,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.stopPropagation();
            }}
          >
            {subscriptions?.map((subscription) => (
              <option key={subscription.uuid} value={subscription.uuid}>
                {subscription.name}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <div className="detail-field">
          <span className="field-label">Description</span>
          <Input
            type="text"
            className="form-input field-input"
            value={invoice.description || ""}
            onChange={(e) => onInvoiceChange({ description: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            placeholder="Description"
          />
        </div>
      )}

      <div className="detail-field">
        <span className="field-label">Invoice Date</span>
        <Input
          type="date"
          className="form-input field-input"
          value={
            invoice.invoiceSentDate ? invoice.invoiceSentDate.split("T")[0] : ""
          }
          onChange={(e) =>
            onInvoiceChange({
              invoiceSentDate: new Date(e.target.value).toISOString(),
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
      </div>

      {isSubscriptionInvoice && (
        <>
          <div className="detail-field">
            <span className="field-label">Period Start</span>
            <Input
              type="date"
              className="form-input field-input"
              value={
                invoice.periodStartDate
                  ? invoice.periodStartDate.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                onInvoiceChange({
                  periodStartDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </div>
          <div className="detail-field">
            <span className="field-label">Period End</span>
            <Input
              type="date"
              className="form-input field-input"
              value={
                invoice.periodEndDate ? invoice.periodEndDate.split("T")[0] : ""
              }
              onChange={(e) =>
                onInvoiceChange({
                  periodEndDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </div>
        </>
      )}

      <div className="detail-field">
        <span className="field-label">Type</span>
        <span className="field-value">
          <Badge variant="default">
            {invoice.subscriptionUuid ? "Subscription" : "One-off"}
          </Badge>
        </span>
      </div>
    </div>
  );
};
