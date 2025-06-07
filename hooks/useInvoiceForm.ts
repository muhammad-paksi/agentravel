import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as invoiceService from "@/services/invoiceService";
import * as reservationService from "@/services/reservationService";
import { InvoiceFormValues, Options, Invoice, ReservationReference } from "@/types/invoiceType";
import { useIsMobile } from "@/components/ui/use-mobile";
import { ReservationFormValues } from "@/types/reservationType";

export function useInvoiceForm({ id, initialValues }: Options = {}) {
  const router = useRouter();
  const isEdit = Boolean(id);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reservations, setReservations] = useState<ReservationFormValues[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerNameSearch, setCustomerNameSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [searchType, setSearchType] = useState<"basic" | "advanced">("basic");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [loading, setLoading] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const isMobile = useIsMobile();

  // State to store reservation details for search in InvoiceDataTable
  const [reservationDetails, setReservationDetails] = useState<{[key: string]: ReservationFormValues}>({});

  // ==== FETCH INVOICE LIST ====
  useEffect(() => {
    setLoading(true);
    invoiceService
      .listInvoices()
      .then((res) => setInvoices(res.data))
      .catch((err) => {
        console.error("Error fetching invoices:", err);
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  }, []); 

  // ==== FETCH RESERVATIONS ====
  useEffect(() => {
    setLoadingReservations(true);
    reservationService
      .listReservations()
      .then((res) => setReservations(res.data))
      .catch((err) => {
        console.error("Error fetching reservations:", err);
        setReservations([]);
      })
      .finally(() => setLoadingReservations(false));
  }, []);

  // ==== FILTER & SEARCH MEMOIZED ====
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invoices.filter((inv) => {
      // Check if reservation exists
      const reservationTicketId = inv.reservation?.ticket_id 
        ? String(inv.reservation.ticket_id).toLowerCase() 
        : '';
      
      const reservationName = inv.reservation?.name 
        ? inv.reservation.name.toLowerCase() 
        : '';
        
      const matchesSearch =
        reservationTicketId.includes(q) ||
        reservationName.includes(q) ||
        (inv.payment_date && String(inv.payment_date).toLowerCase().includes(q)) ||
        inv.status.toLowerCase().includes(q);
      
      // If we have the populated reservation data, also search in that
      if (inv.reservation) {
        const reservationMatches = 
          inv.reservation?.name.toLowerCase().includes(q) ||
          inv.reservation?.destination.toLowerCase().includes(q) ||
          String(inv.reservation.ticket_id).toLowerCase().includes(q);
        
        if (reservationMatches) return true;
      }
      
      // Also check if reservation name in reservationDetails state matches search query
      // This is to cover populated reservation from the InvoiceDataTable fetch
      if (inv.reservation_id && reservationDetails[inv.reservation_id]) {
        const resName = reservationDetails[inv.reservation_id].name.toLowerCase();
        if (resName.includes(q)) return true;
      }
      
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter, reservationDetails]);

  // ==== FORM HANDLING ====
  const defaultForm: InvoiceFormValues = {
    reservation_id: "",
    reservation_ref: undefined,
    total_amount: 0,
    fee: 0,
    payment_method: "Bank Transfer",
    payment_date: new Date(),
    issued_date: new Date(),
    due_date: new Date(),
    status: "Unpaid",
  };

  const [form, setForm] = useState<InvoiceFormValues>(() => {
    if (initialValues) {
      return {
        ...defaultForm,
        ...initialValues,
        payment_date: initialValues.payment_date ? new Date(initialValues.payment_date) : new Date(),
        issued_date: initialValues.issued_date ? new Date(initialValues.issued_date) : new Date(),
        due_date: initialValues.due_date ? new Date(initialValues.due_date) : new Date(),
      };
    }
    return defaultForm;
  });

  const [selectedReservation, setSelectedReservation] = useState<ReservationFormValues | null>(null);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoice details when editing
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetching(true);
    invoiceService
      .getInvoice(id)
      .then((data) => {
        setForm({
          ...defaultForm,
          ...data,
          payment_date: new Date(data.payment_date),
          issued_date: new Date(data.issued_date),
          due_date: new Date(data.due_date),
        });
        
        // If we have the populated reservation data, set it
        if (data?.reservation) {
          setSelectedReservation(data.reservation);
          // Also set the reservation_ref for the form
          setForm(prev => ({
            ...prev,
            reservation_ref: {
              _id: data.reservation_id,
              ticket_id: data.reservation!.ticket_id?.toString() ?? '',
              name: data.reservation!.name || '',
              destination: data.reservation!.destination,
              contact: data.reservation!.contact,
              }
            }));
        } 
        // Otherwise fetch the reservation data
        else if (data.reservation_id) {
          fetchReservationDetails(data.reservation_id);
        }
      })
      .catch((err) => setError(err.message || "Failed to load invoice"))
      .finally(() => setFetching(false));
  }, [id, isEdit]);
  // Fetch reservation details when reservation_id changes
  const fetchReservationDetails = async (reservationId: string) => {
    if (!reservationId) return;
    
    try {
      const reservation = await reservationService.getReservation(reservationId);
      setSelectedReservation(reservation);
      
      // Update form with reservation data
      setForm(prev => ({
        ...prev,
        total_amount: reservation.total_price,
        reservation_id: reservationId,
        reservation_ref: {
          _id: reservationId,
          ticket_id: reservation.ticket_id?.toString() ?? '',
          name: reservation.name,
          destination: reservation.destination,
          contact: reservation.contact,
        }
      }));
    } catch (error: any) {
      console.error("Error fetching reservation details:", error);
      setError("Failed to load reservation details");
    }
  };

  // Handle reservation selection
  const handleReservationChange = (reservationId: string) => {
    setForm(prev => ({
      ...prev,
      reservation_id: reservationId
    }));
    
    fetchReservationDetails(reservationId);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    
    console.log("Submitting form:", isEdit ? "UPDATE" : "CREATE", form);
    
    try {
      // Prepare payload - ensure dates are properly formatted
      const payload = {
        ...form,
        // Ensure dates are properly formatted for API
        payment_date: form.payment_date,
        issued_date: form.issued_date,
        due_date: form.due_date,
      };

      // Remove reservation_ref before sending to API
      const { reservation_ref, ...apiPayload } = payload;
      
      let result;
      if (isEdit && id) {
        console.log("Updating invoice with ID:", id);
        result = await invoiceService.updateInvoice(id, apiPayload);
        console.log("Update successful:", result);
      } else {
        console.log("Creating new invoice");
        result = await invoiceService.addInvoice(apiPayload);
        console.log("Creation successful:", result);
      }

      // Force a refresh of the page after successful update
      if (typeof window !== 'undefined') {
        router.refresh(); // Refresh current route
      }
      
      return result;
    } catch (error: any) {
      console.error("Submission error:", error);
      setError(error.message || (isEdit ? "Gagal memperbarui invoice" : "Gagal membuat invoice"));
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const refreshData = () => {
    setLoading(true);
    invoiceService
      .listInvoices()
      .then((res) => setInvoices(res.data))
      .catch((err) => {
        console.error("Error fetching invoices:", err);
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  };

  return {
    filtered,
    form,
    setForm,
    submit,
    isEdit,
    fetching,
    error,
    loading,
    data: filtered,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    rawList: invoices,
    isMobile,
    reservations,
    loadingReservations,
    selectedReservation,
    handleReservationChange,
    fetchReservationDetails,
    refreshData,
    reservationDetails, // added to expose reservationDetails state for search in useMemo
    setReservationDetails // added setter to update reservationDetails from component
  };
}