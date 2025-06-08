import React, { useEffect, useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { PaymentMethod, Status } from "@/types/invoiceType";
import { ReservationFormValues } from "@/types/reservationType";
import * as reservationService from "@/services/reservationService";

const paymentMethodOptions: { label: string; value: string }[] = [
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "Credit Card", value: "Credit Card" },
  { label: "Cash", value: "Cash" },
];
const invoiceStatusOptions: { label: string; value: string }[] = [
  { label: "Unpaid", value: "Unpaid" },
  { label: "Paid", value: "Paid" },
];

export const InvoiceForm: React.FC<{ id?: string }> = ({ id }) => {
  const {
    form,
    setForm,
    loading,
    fetching,
    error,
    submit,
    isEdit,
    selectedReservation,
    handleReservationChange,
  } = useInvoiceForm({ id });

  const [reservations, setReservations] = useState<ReservationFormValues[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [reservationError, setReservationError] = useState<string | null>(null);

  // Fetch reservations for the dropdown
  useEffect(() => {
    setLoadingReservations(true);
    reservationService.listReservations()
      .then(result => {
        setReservations(result.data);
      })
      .catch(err => {
        console.error("Failed to fetch reservations:", err);
        setReservationError("Failed to load reservations");
      })
      .finally(() => setLoadingReservations(false));
  }, []);

  // Convert reservations to options for SelectField
  const reservationOptions = reservations.map(reservation => ({
    label: `#${reservation.ticket_id} - ${reservation.name} (${reservation.destination})`,
    value: reservation._id || "",
  }));

  if (fetching || loadingReservations) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (reservationError) return <p className="text-red-600">{reservationError}</p>;

  // Handle reservation selection
  const onReservationChange = (value: string) => {
    handleReservationChange(value);
  };

  const handleSubmit = async () => {
    try {
      await submit();
      
      // Tambahkan delay kecil sebelum navigasi untuk memastikan state diperbarui
      setTimeout(() => {
        // Force hard navigation untuk memastikan data diambil ulang
        window.location.href = "/dashboard/invoices";
      }, 100);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">

      {/* Reservation Detail */}
      <section>
        <h2 className="text-lg font-bold mb-2">Selected Reservation Detail</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Select Reservation"
            placeholder="Select a reservation"
            value={form.reservation_id}
            options={reservationOptions}
            onChange={onReservationChange}
            disabled={isEdit}
          />
          
          {selectedReservation && (
            <>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Reservation Details</h3>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-bold">Customer:</p>
                      <p>{selectedReservation.name}</p>
                    </div>
                    <div>
                      <p className="font-bold">Ticket ID:</p>
                      <p>#{selectedReservation.ticket_id}</p>
                    </div>
                    <div>
                      <p className="font-bold">Destination:</p>
                      <p>{selectedReservation.destination}</p>
                    </div>
                    <div>
                      <p className="font-bold">Travel Date:</p>
                      <p>{new Date(selectedReservation.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-bold">Total Price:</p>
                      <p>Rp {selectedReservation.total_price.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="font-bold">Status:</p>
                      <p>{selectedReservation.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
        
      {/* Invoice Information */}
      <section>
        <h2 className="text-lg font-bold mb-2">Invoice Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Total Amount"
            placeholder="Enter total amount"
            type="number"
            value={form.total_amount}
            onChange={(v) => setForm((f) => ({ ...f, total_amount: Number(v) }))}
          />

          <FormField
            label="Fee"
            placeholder="Enter fee"
            type="number"
            value={form.fee}
            onChange={(v) => setForm((f) => ({ ...f, fee: Number(v) }))}
          />
        </div>
      </section>
        
      {/* Payment & Invoice Timeline */}
      <section>
        <h2 className="text-lg font-bold mb-2">Cost & Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Issued Date"
            placeholder="Select issued date"
            type="date"
            value={form.issued_date.toISOString().substring(0, 10)}
            onChange={(v) => setForm((f) => ({ ...f, issued_date: new Date(v) }))}
          />
          <FormField
            label="Due Date"
            placeholder="Select due date"
            type="date"
            value={form.due_date.toISOString().substring(0, 10)}
            onChange={(v) => setForm((f) => ({ ...f, due_date: new Date(v) }))}
          />

          <SelectField
            label="Payment Method"
            value={form.payment_method}
            options={paymentMethodOptions}
            onChange={(v) => setForm((f) => ({ ...f, payment_method: v as PaymentMethod }))}
          />

          <FormField
            label="Payment Date"
            placeholder="Select payment date"
            type="date"
            value={form.payment_date.toISOString().substring(0, 10)}
            onChange={(v) => setForm((f) => ({ ...f, payment_date: new Date(v) }))}
          />
        </div>
      </section>
        
      {/* Invoice Status */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Invoice Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Invoice Status"
            value={form.status}
            options={invoiceStatusOptions}
            onChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}
          />
        </div>
      </section>

      <div className="flex justify-start space-x-2">
        <Button 
          className="border-b border-gray-400 text-gray-400 bg-white hover:bg-gray-200" 
          variant="outline" 
          onClick={() => history.back()} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          className="text-white bg-[#377dec] hover:bg-[#2e61b5]" 
          onClick={handleSubmit} 
          disabled={loading || !form.reservation_id}
        >
          {loading ? (isEdit ? "Updating…" : "Saving…") 
          : (isEdit ? "Update Invoice" : "Add Invoice")}
        </Button>
      </div>
    </div>
  );
};

// import React, { useEffect, useState } from "react";
// import { FormField } from "@/components/ui/form-field";
// import { SelectField } from "@/components/ui/select-field";
// import { Button } from "@/components/ui/button";
// import { useInvoiceForm } from "@/hooks/useInvoiceForm";
// import { PaymentMethod, Status } from "@/types/invoiceType";

// const paymentMethodOptions: { label: string; value: string }[] = [
//   { label: "Bank Transfer", value: "Bank Transfer" },
//   { label: "Credit Card", value: "Credit Card" },
//   { label: "Cash", value: "Cash" },
// ];
// const invoiceStatusOptions: { label: string; value: string }[] = [
//   { label: "Unpaid", value: "Unpaid" },
//   { label: "Paid", value: "Paid" },
// ];

// export const InvoiceForm: React.FC<{ id?: string }> = ({ id }) => {
//   const {
//     form,
//     setForm,
//     loading,
//     fetching,
//     error,
//     submit,
//     isEdit,
//   } = useInvoiceForm({ id });

//   if (fetching) return <p>Loading…</p>;
//   if (error) return <p className="text-red-600">{error}</p>;

    
//   return (
//     <div className="bg-white p-6 rounded shadow space-y-6">

//       {/* Reservation Detail */}
//       <section>
//         <h2 className="text-lg font-bold mb-2">Reservation Detail</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <SelectField
//             label="No. Ticket / Reservation"
//             placeholder="Select no.ticket / reservation"
//             value={form.ticket_id}
//             onChange={(v) => setForm(f => ({ ...f, ticket_id: v as ticket_id }))}
//           />
//           </div>
//         </section>
        
//         {/* Invoice Information */}
//         <section>
//         <h2 className="text-lg font-bold mb-2">Invoice Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <FormField
//               label="Total Amount"
//               placeholder="Enter total amount"
//               type="number"
//               value={form.total_amount}
//               onChange={(v) => setForm((f) => ({ ...f, total_amount: Number(v) }))}
//             />

//             <FormField
//               label="Fee"
//               placeholder="Enter fee"
//               value={form.fee}
//               onChange={(v) => setForm((f) => ({ ...f, fee: Number(v) }))}
//             />
//           </div>
//         </section>
        
//         {/* Payment & Invoice Timeline */}
//         <section>
//           <h2 className="text-lg font-bold mb-2">Cost & Payment</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <FormField
//               label="Issued Date"
//               placeholder="Select issued date"
//               type="date"
//               value={form.issued_date.toISOString().substring(0, 10)}
//               onChange={(v) => setForm((f) => ({ ...f, issued_date: new Date(v) }))}
//             />
//             <FormField
//               label="Due Date"
//               placeholder="Select due date"
//               type="date"
//               value={form.due_date.toISOString().substring(0, 10)}
//               onChange={(v) => setForm((f) => ({ ...f, due_date: new Date(v) }))}
//             />

//             <SelectField
//               label="Payment Method"
//               value={form.payment_method}
//               options={paymentMethodOptions}
//               onChange={(v) => setForm((f) => ({ ...f, payment_method: v as PaymentMethod }))}
//             />

//             <FormField
//               label="Payment Date"
//               placeholder="Select payment date"
//               type="date"
//               value={form.payment_date.toISOString().substring(0, 10)}
//               onChange={(v) => setForm((f) => ({ ...f, payment_date: new Date(v) }))}
//             />
//           </div>
//         </section>
        
//         {/* Invoice Status */}
//         <section>
//           <h3 className="text-lg font-semibold mb-2">Invoice Status</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <SelectField
//               label="Invoices Status"
//               value={form.status}
//               options={invoiceStatusOptions}
//               onChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}
//             />
//           </div>
//         </section>

//       <div className="flex justify-start space-x-2">
//         <Button className="border-b border-gray-400 text-gray-400 bg-white hover:bg-gray-200" variant="outline" onClick={() => history.back()} disabled={loading}>
//           Cancel
//         </Button>
//         <Button className="text-white bg-[#377dec] hover:bg-[#2e61b5]" onClick={submit} disabled={loading}>
//           {loading ? (isEdit ? "Updating…" : "Saving…") 
//           : (isEdit ? "Update" : "Add Invoice")}
//         </Button>
//       </div>
//     </div>
//   );
// };