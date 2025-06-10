import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as service from "@/services/reservationService";
import { ReservationFormValues, Options } from "@/types/reservationType";
import { useIsMobile } from "@/components/ui/use-mobile";
import { reservationSchema } from "@/app/lib/zod";
import { ZodError } from "zod";

type FieldErrors = Partial<Record<keyof ReservationFormValues, string>>;

export function useReservationForm({ id, initialValues }: Options = {}) {
  const router = useRouter();
  const isEdit = Boolean(id);
  const isMobile = useIsMobile();

  const [reservations, setReservations] = useState<ReservationFormValues[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const defaultForm: ReservationFormValues = useMemo(() => ({
    nik: 0,
    name: "",
    contact: "",
    type: "flight",
    ticket_id: 0,
    destination: "",
    departure_date: new Date(),
    transport_type: "Plane",
    carrier_name: "",
    ticket_price: 0,
    total_persons: undefined,
    checkInDate: undefined,
    hotel_name: undefined,
    room_price: undefined,
    estimated_budget: undefined,
    total_price: 0,
    payment_method: "Prepaid",
    payment_status: "Pending",
    status: "Booked",
    admin_id: "",
  }), []);

  const [form, setForm] = useState<ReservationFormValues>(() => {
    if (initialValues) {
      return {
        ...defaultForm,
        ...initialValues,
        departure_date: initialValues.departure_date ? new Date(initialValues.departure_date) : new Date(),
        checkInDate: initialValues.checkInDate ? new Date(initialValues.checkInDate) : undefined,
      };
    }
    return defaultForm;
  });

  useEffect(() => {
    setLoading(true);
    service.listReservations()
      .then((res) => setReservations(res.data))
      .catch((err) => {
        console.error("Failed to list reservations:", err);
        setReservations([]);
        setError("Gagal memuat daftar reservasi.");
      })
      .finally(() => setLoading(false));
  }, []);
  
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetching(true);
    service.getReservation(id)
      .then((data) => {
        setForm({
          ...defaultForm,
          ...data,
          departure_date: new Date(data.departure_date),
          checkInDate: data.checkInDate ? new Date(data.checkInDate) : undefined,
        });
      })
      .catch((err) => setError(err.message || "Gagal memuat data reservasi."))
      .finally(() => setFetching(false));
  }, [id, isEdit, defaultForm]);

  useEffect(() => {
    const ticketPrice = Number(form.ticket_price) || 0;
    const roomPrice = Number(form.room_price) || 0;
    setForm(currentForm => ({
      ...currentForm,
      total_price: ticketPrice + roomPrice,
    }));
  }, [form.ticket_price, form.room_price]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reservations
      .filter((r) => {
        const matchesSearch =
          String(r.ticket_id).toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          r.carrier_name.toLowerCase().includes(q) || // Added carrier_name to search
          r.status.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Sort by creation date, newest first
        const dateA = new Date((a as any)?.createdAt ?? 0).getTime();
        const dateB = new Date((b as any)?.createdAt ?? 0).getTime();
        return dateB - dateA;
      });
  }, [reservations, searchQuery, statusFilter]);

  const submit = async () => {
    setErrors({});
    setError(null);
    setLoading(true);

    try {
      const validatedData = reservationSchema.parse({
        ...form,
        departure_date: form.departure_date instanceof Date ? form.departure_date : new Date(form.departure_date),
        checkInDate: form.checkInDate ? (form.checkInDate instanceof Date ? form.checkInDate : new Date(form.checkInDate)) : undefined,
      });
      const payload: Partial<ReservationFormValues> = validatedData;

      if (isEdit && id) {
        await service.updateReservation(id, payload);
      } else {
        await service.addReservation(payload as ReservationFormValues);
      }

      router.push("/dashboard/reservations");
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: FieldErrors = {};
        err.errors.forEach((e) => {
          const key = e.path[0] as keyof ReservationFormValues;
          if (!fieldErrors[key]) fieldErrors[key] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error("Submission error:", err);
        setError((err as Error).message || (isEdit ? "Gagal memperbarui reservasi" : "Gagal membuat reservasi"));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    errors,
    submit,
    isEdit,
    fetching,
    error,
    loading,
    data: filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    rawList: reservations,
    isMobile,
  };
}
