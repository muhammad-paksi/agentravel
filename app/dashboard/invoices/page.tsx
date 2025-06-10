import InvoiceDataTable from "@/components/views/invoices/InvoiceDataTable"

export default function InvoicesPage() {
  return (
    <><div className="space-y-4">
      <InvoiceDataTable />
    </div>
    <div>
      <p className="text-sm text-gray-500 mt-2">
        Displays invoice data
      </p>
    </div></>
  )
}
