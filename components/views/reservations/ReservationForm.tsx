import React, { useState, useEffect } from "react";
import { FormField } from "@/components/ui/form-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useReservationForm } from "@/hooks/useReservationForm";
import { PaymentMethod, PaymentStatus, ReservationStatus, TransportType, ReservationType } from "@/types/reservationType";

const reservationTypeOptions: { label: string; value: ReservationType }[] = [
  { label: "Flight", value: "flight" },
  { label: "Hotel", value: "hotel" },
  { label: "Activity", value: "activity" },
];

const transportTypeOptions: { label: string; value: TransportType }[] = [
  { label: "Plane", value: "Plane" },
  { label: "Ship", value: "Ship" },
  { label: "Train", value: "Train" },
  { label: "Bus", value: "Bus" },
];

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

  const [showHotelFields, setShowHotelFields] = useState(!!form.hotel_name || !!form.room_price);

  useEffect(() => {
    const ticketPrice = form.ticket_price || 0;
    const roomPrice = form.room_price || 0;
    const calculatedTotal = ticketPrice + roomPrice;
    
    if (calculatedTotal !== form.total_price) {
      setForm(f => ({ ...f, total_price: calculatedTotal }));
    }
  }, [form.ticket_price, form.room_price, form.total_price, setForm]);

  if (fetching) return <p>Loading reservation data…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      {/* Customer Information */}
      <section>
        <h2 className="text-xl font-bold mb-3">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        
        {/* Ticket & Transport Information */}
        <section>
        <h2 className="text-xl font-bold mb-3">Ticket & Transport Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Reservation Type"
              value={form.type}
              options={reservationTypeOptions}
              onChange={(v) => setForm(f => ({ ...f, type: v as ReservationType }))}
            />
            <FormField
              label="Ticket Number"
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
              label="Departure Date"
              type="date"
              value={form.departure_date.toISOString().substring(0, 10)}
              error={errors.departure_date}
              onChange={(v) => setForm((f) => ({ ...f, departure_date: new Date(v) }))}
            />
            <SelectField
              label="Transport Type"
              value={form.transport_type}
              options={transportTypeOptions}
              // error={errors.transport_type}
              onChange={(v) => setForm(f => ({ ...f, transport_type: v as TransportType }))}
            />
            <FormField
              label="Carrier Name (e.g., airline, ship name)"
              placeholder="Enter carrier name"
              value={form.carrier_name}
              error={errors.carrier_name}
              onChange={(v) => setForm(f => ({ ...f, carrier_name: v }))}
            />
          </div>
        </section>

        {/* Conditional Hotel Information Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox id="add-hotel" checked={showHotelFields} onCheckedChange={(checked) => setShowHotelFields(Boolean(checked))} />
            <Label htmlFor="add-hotel" className="font-semibold text-gray-700">Add Hotel Reservation?</Label>
          </div>

          {showHotelFields && (
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Hotel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label="Hotel Name" placeholder="Enter hotel name" value={form.hotel_name || ''} error={errors.hotel_name} onChange={(v) => setForm(f => ({...f, hotel_name: v}))} />
                    <FormField label="Check-in Date" type="date" value={form.checkInDate ? form.checkInDate.toISOString().substring(0, 10) : ''} error={errors.checkInDate} onChange={(v) => setForm(f => ({...f, checkInDate: new Date(v)}))} />
                    <FormField label="Total Persons" type="number" placeholder="Number of guests" value={form.total_persons || ''} error={errors.total_persons} onChange={(v) => setForm(f => ({...f, total_persons: Number(v)}))} />
                    <FormField label="Room Price" type="number" placeholder="Enter room price" value={form.room_price || ''} error={errors.room_price} onChange={(v) => setForm(f => ({...f, room_price: Number(v)}))} />
                </div>
            </div>
          )}
        </section>
        
        {/* Cost & Payment */}
        <section>
          <h2 className="text-xl font-bold mb-3">Cost Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              label="Ticket Price"
              type="number"
              placeholder="Enter ticket price"
              value={form.ticket_price}
              error={errors.ticket_price}
              onChange={(v) => setForm((f) => ({ ...f, ticket_price: Number(v) }))}
            />
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
              readonly={true}
              onChange={() => {}}
            />
          </div>
        </section>
        
        {/* Status & Admin */}
        <section>
          <h3 className="text-xl font-bold mb-3">Payment & Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Reservation Status"
              value={form.status}
              options={reservationStatusOptions}
              onChange={(v) => setForm((f) => ({ ...f, status: v as ReservationStatus }))}
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
        <Button className="text-white bg-gray-500 hover:bg-gray-700" variant="outline" onClick={() => history.back()} disabled={loading}>
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
