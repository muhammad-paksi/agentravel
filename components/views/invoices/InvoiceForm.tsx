"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Status } from "@/types/invoiceType";

// Helper component untuk menampilkan field read-only
const ReadOnlyField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm">
      {value}
    </div>
  </div>
);

// [BARU] Komponen MultiSelectField dengan Checkbox
const MultiSelectField: React.FC<{
  label: string;
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ label, options, selectedValues, onChange, placeholder = "Pilih item...", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Menutup dropdown saat klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const handleSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };
  
  const displayValue = selectedValues.length > 0
    ? `${selectedValues.length} reservation selected`
    : placeholder;

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left flex justify-between items-center sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span>{displayValue}</span>
        <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {options.length > 0 ? options.map(option => (
              <li key={option.value} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(option.value)}>
                <label className="flex items-center space-x-3 w-full cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={selectedValues.includes(option.value)}
                    readOnly
                  />
                  <span className="text-sm text-gray-800">{option.label}</span>
                </label>
              </li>
            )) : (
                <li className="px-3 py-2 text-sm text-gray-500">Tidak ada pilihan tersedia.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};


const invoiceStatusOptions: { label: string; value: Status }[] = [
  { label: "Unpaid", value: "Unpaid" },
  { label: "Paid", value: "Paid" },
];

export const InvoiceForm: React.FC<{ id?: string }> = ({ id }) => {
  const router = useRouter();
  
  const {
    form,
    setForm,
    loading,
    fetching,
    error,
    submit,
    isEdit,
    availableReservations,
    handleReservationChange,
  } = useInvoiceForm({ id });

  if (fetching) return <p className="text-center p-4">Loading invoice data...</p>;
  if (error) return <p className="text-center p-4 text-red-600">{error}</p>;

  const grandTotal = (form.total_amount || 0) + (form.fee || 0);

  // Menyiapkan options untuk MultiSelectField dari data reservasi
  const reservationOptions = availableReservations.map(res => ({
    label: `#${res.ticket_id} - ${res.name}`,
    value: res._id!,
  }));

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{isEdit ? "Update Invoice" : "Create New Invoice"}</h1>
      </header>
      <section>
        <h2 className="text-lg font-bold mb-2">Selected Reservation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Customer Name"
            placeholder="Enter the customer name"
            value={form.customer_name}
            onChange={(v) => setForm(f => ({ ...f, customer_name: v }))}
          />
          
          <MultiSelectField
            label="Select Reservation"
            options={reservationOptions}
            selectedValues={form.reservation_id || []}
            onChange={handleReservationChange}
            placeholder="Select reservation..."
            disabled={reservationOptions.length === 0}
          />
        </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Cost Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyField label="Total Amount" value={`Rp ${form.total_amount.toLocaleString('id-ID')}`} />
            <FormField label="Additional Cost (Fee)" type="number" value={form.fee} onChange={(v) => setForm(f => ({ ...f, fee: Number(v) }))} />
            <div className="pt-4 mt-4">
              <ReadOnlyField label="Grand Total" value={`Rp ${grandTotal.toLocaleString('id-ID')}`} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">Status & Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Due Date" type="date" value={form.due_date.toISOString().substring(0, 10)} onChange={(v) => setForm(f => ({ ...f, due_date: new Date(v) }))} />
          <SelectField
            label="Invoice Status"
            value={form.status}
            options={invoiceStatusOptions}
            onChange={(v) => setForm(f => ({ ...f, status: v as Status }))}
          />
          {form.status === 'Paid' && (
            <FormField label="Payment Date" type="date" value={form.payment_date?.toISOString().substring(0, 10) || ''} onChange={(v) => setForm(f => ({ ...f, payment_date: new Date(v) }))} />
          )}
        </div>
      </section>

      <footer className="flex justify-start space-x-4 pt-4">
        <Button className="border-b border-gray-500 text-gray-500 bg-white hover:bg-gray-200" variant="outline" onClick={() => router.back()} disabled={loading}>Batal</Button>
        <Button className="text-white bg-[#377dec] hover:bg-[#2e61b5]" onClick={submit} disabled={loading || !form.customer_name || (form.reservation_id || []).length === 0}>
          {loading ? "Saving..." : (isEdit ? "Save Changes" : "Create Invoice")}
        </Button>
      </footer>
    </div>
  );
};
