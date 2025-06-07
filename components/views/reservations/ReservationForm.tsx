import React from "react";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { useReservationForm } from "@/hooks/useReservationForm";
import { PaymentMethod, PaymentStatus, ReservationStatus } from "@/types/reservationType";

const paymentMethodOptions: { label: string; value: string }[] = [
  { label: "Prepaid", value: "Prepaid" },
  { label: "Postpaid", value: "Postpaid" },
];
const paymentStatusOptions: { label: string; value: string }[] = [
  { label: "Pending", value: "Pending" },
  { label: "Paid", value: "Paid" },
];

const reservationStatusOptions: { label: string; value: string }[] = [
  { label: "Booked", value: "Booked" },
  { label: "Completed", value: "Completed" },
  { label: "Canceled", value: "Canceled" },
];

export const ReservationForm: React.FC<{ id?: string }> = ({ id }) => {
  const {
    form,
    setForm,
    loading,
    fetching,
    error,
    errors,
    submit,
    isEdit,
  } = useReservationForm({ id });

  if (fetching) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">

      {/* Customer Information */}
      <section>
        <h2 className="text-lg font-bold mb-2">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nomor Induk Kependudukan (NIK)"
            placeholder="Enter NIK"
            type="number"
            value={form.nik}
            error={errors.nik}
            onChange={(v) => setForm(f => ({ ...f, nik: Number(v) }))}
          />
          <FormField
            label="Customer Name"
            placeholder="Enter customer name"
            value={form.name}
            error={errors.name}
            onChange={(v) => setForm(f => ({ ...f, name: v }))}
          />
          <FormField
            label="Contact (Phone/Email)"
            placeholder="Enter contact"
            value={form.contact}
            error={errors.contact}
            onChange={(v) => setForm((f) => ({ ...f, contact: v }))}
          />
          </div>
        </section>
        
        {/* Ticket Information */}
        <section>
        <h2 className="text-lg font-bold mb-2">Ticket Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="No. Ticket"
              placeholder="Enter ticket ID"
              type="number"
              value={form.ticket_id}
              error={errors.ticket_id}
              onChange={(v) => setForm((f) => ({ ...f, ticket_id: Number(v) }))}
            />

            <FormField
              label="Destination"
              placeholder="Enter destination"
              value={form.destination}
              error={errors.destination}
              onChange={(v) => setForm((f) => ({ ...f, destination: v }))}
            />

            <FormField
              label="Date"
              type="date"
              value={form.date.toISOString().substring(0, 10)}
              error={errors.date}
              onChange={(v) => setForm((f) => ({ ...f, date: new Date(v) }))}
              />
          </div>
        </section>
        
        {/* Cost & Payment */}
        <section>
          <h2 className="text-lg font-bold mb-2">Cost & Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Estimated Budget"
              type="number"
              value={form.estimated_budget}
              error={errors.estimated_budget}
              onChange={(v) => setForm((f) => ({ ...f, estimated_budget: Number(v) }))}
            />

            <FormField
              label="Total Price"
              type="number"
              value={form.total_price}
              error={errors.total_price}
              onChange={(v) => setForm((f) => ({ ...f, total_price: Number(v) }))}
            />

            <SelectField
              label="Payment Method"
              value={form.payment_method}
              options={paymentMethodOptions}
              onChange={(v) => setForm((f) => ({ ...f, payment_method: v as PaymentMethod }))}
            />

            <SelectField
              label="Payment Status"
              value={form.payment_status}
              options={paymentStatusOptions}
              onChange={(v) => setForm((f) => ({ ...f, payment_status: v as PaymentStatus} ))}
            />
          </div>
        </section>
        
        {/* Status & Admin */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Booking Status & Admin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Status"
              value={form.status}
              options={reservationStatusOptions}
              onChange={(v) => setForm((f) => ({ ...f, status: v as ReservationStatus }))}
            />

            <FormField
              label="Admin ID"
              placeholder="Enter your Admin ID"
              value={form.admin_id}
              error={errors.admin_id}
              onChange={(v) => setForm((f) => ({ ...f, admin_id: v }))}
            />
          </div>
        </section>

      <div className="flex justify-start space-x-2">
        <Button className="border-b border-gray-400 text-gray-400 bg-white hover:bg-gray-200" variant="outline" onClick={() => history.back()} disabled={loading}>
          Cancel
        </Button>
        <Button className="text-white bg-[#377dec] hover:bg-[#2e61b5]" onClick={submit} disabled={loading}>
          {loading ? (isEdit ? "Updating…" : "Saving…") 
          : (isEdit ? "Update" : "Add Reservation")}
        </Button>
      </div>
    </div>
  );
};
