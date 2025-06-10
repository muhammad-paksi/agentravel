import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as invoiceService from "@/services/invoiceService";
import * as reservationService from "@/services/reservationService";
import { InvoiceFormValues, Invoice } from "@/types/invoiceType";
import { ReservationFormValues } from "@/types/reservationType";
import { exportBulkPdf } from "@/services/invoiceService";

export interface UseInvoiceFormOptions {
  id?: string;
}

const DEFAULT_FEE = 10000;

export function useInvoiceForm({ id }: UseInvoiceFormOptions = {}) {
  const router = useRouter();
  const isEdit = Boolean(id);

  // --- STATE UNTUK DAFTAR INVOICE & FILTER ---
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // --- STATE UNTUK FORM ---
  const [form, setForm] = useState<InvoiceFormValues>({
    customer_name: "",
    reservation_id: [],
    total_amount: 0,
    fee: DEFAULT_FEE,
    payment_method: "Bank Transfer",
    payment_date: new Date(),
    issued_date: new Date(),
    due_date: new Date(),
    status: "Unpaid",
  });
  
  const [availableReservations, setAvailableReservations] = useState<ReservationFormValues[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<ReservationFormValues[]>([]);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // ==== PENGAMBILAN DATA ====
  useEffect(() => {
    if (isEdit && id) {
      setFetching(true);
      invoiceService.getInvoice(id)
        .then((data) => {
          setForm({
            _id: data._id,
            customer_name: data.customer_name,
            reservation_id: data.reservation_id?.map((r) => r._id) ?? [],
            status: data.status,
            payment_method: data.payment_method,
            fee: data.fee,
            total_amount: data.total_amount,
            payment_date: new Date(data.payment_date),
            issued_date: new Date(data.issued_date),
            due_date: new Date(data.due_date),
          });
          setSelectedReservations((data.reservation_id as any) ?? []);
        })
        .catch((err) => setError(err.message || "Gagal memuat data invoice"))
        .finally(() => {
          setFetching(false);
        });
    }
  }, [id, isEdit]);

  const fetchInvoices = () => {
    setLoading(true);
    invoiceService
      .getAllInvoices({ search: searchQuery, status: statusFilter === "all" ? undefined : statusFilter })
      .then(data => setInvoices(data))
      .catch(err => {
        console.error("Gagal mengambil invoices:", err);
        setError("Gagal mengambil data invoice.");
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchInvoices();
  }, []); 

  useEffect(() => {
    if (isEdit) return;
    setLoadingReservations(true);
    reservationService.listReservations({ invoiced: 'false' } as any)
      .then(res => setAvailableReservations(res.data))
      .catch(err => {
        console.error("Gagal mengambil reservasi:", err);
        setError("Gagal mengambil daftar reservasi.");
      })
      .finally(() => setLoadingReservations(false));
  }, [isEdit]);


  // ==== LOGIKA FORM ====
  useEffect(() => {
    const total = selectedReservations.reduce((acc, current) => acc + (current.total_price || 0), 0);
    setForm(prev => ({ ...prev, total_amount: total }));
  }, [selectedReservations]);

  const handleReservationChange = (selectedIds: string[]) => {
    setForm(prev => ({ ...prev, reservation_id: selectedIds }));
    const newSelectedReservations = availableReservations.filter(r => r._id && selectedIds.includes(r._id));
    setSelectedReservations(newSelectedReservations);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isEdit && id) {
        await invoiceService.updateInvoice(id, form);
      } else {
        await invoiceService.addInvoice(form);
      }
      router.push("/dashboard/invoices");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==== DATA YANG DIKEMBALIKAN ====
  const filteredInvoices = useMemo(() => {
      return invoices
        .filter(inv => {
          const q = searchQuery.trim().toLowerCase();
          const statusMatch = statusFilter === 'all' || inv.status === statusFilter;
          const searchMatch = inv.customer_name?.toLowerCase().includes(q);
          return statusMatch && searchMatch;
        })
        .sort((a, b) => {
          // Urutkan berdasarkan createdAt descending (terbaru pertama)
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });
  }, [invoices, searchQuery, statusFilter]);

  const handleExportSinglePdf = async (invoiceId: string) => {
    setExportingId(invoiceId);
    try {
      await exportBulkPdf([invoiceId]);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setExportingId(null);
    }
  };

  return {
    // Properti untuk Tabel
    loading,
    filteredInvoices,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,

    // Properti untuk Form
    form,
    setForm,
    submit,
    isEdit,
    fetching,
    error,
    availableReservations,
    loadingReservations,
    handleReservationChange,
    selectedReservations,
    exportingId,
    setExportingId,
    handleExportSinglePdf
  };
}
