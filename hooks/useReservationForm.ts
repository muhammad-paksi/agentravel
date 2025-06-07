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
  const [reservations, setReservations] = useState<ReservationFormValues[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Fetch all reservations
  useEffect(() => {
    setLoading(true);
    service
      .listReservations()
      .then((res) => setReservations(res.data))
      .catch((err) => {
        console.error(err);
        setReservations([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter and search
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reservations.filter((r) => {
      const ticketStr = String(r.ticket_id).toLowerCase();
      const matchesSearch =
        ticketStr.includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchQuery, statusFilter]);

  // Default form values
  const defaultForm: ReservationFormValues = {
    nik: 0,
    name: "",
    contact: "",
    ticket_id: 0,
    destination: "",
    date: new Date(),
    estimated_budget: 0,
    total_price: 0,
    payment_method: "Prepaid",
    payment_status: "Pending",
    status: "Booked",
    admin_id: "",
  };

  // Initialize form state
  const [form, setForm] = useState<ReservationFormValues>(() => {
    if (initialValues) {
      return {
        ...defaultForm,
        ...initialValues,
        date: initialValues.date ? new Date(initialValues.date) : new Date(),
      };
    }
    return defaultForm;
  });

  const [fetching, setFetching] = useState(isEdit);

  // Fetch single reservation if editing
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetching(true);
    service
      .getReservation(id)
      .then((data) => {
        setForm({
          ...defaultForm,
          ...data,
          date: new Date(data.date),
        });
      })
      .catch((err) => setError(err.message || "Failed to load reservation"))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  // Submit handler with Zod validation
  const submit = async () => {
    setErrors({});
    setError(null);
    setLoading(true);

    try {
      // Parse and coerce types
      const parsed = reservationSchema.parse({
        ...form,
        // ensure date is Date
        date: form.date instanceof Date ? form.date : new Date(form.date),
      });

      const payload: ReservationFormValues = parsed as ReservationFormValues;

      if (isEdit && id) {
        await service.updateReservation(id, payload);
      } else {
        await service.addReservation(payload);
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
        setError(
          (err as Error).message || (isEdit ? "Gagal memperbarui reservasi" : "Gagal membuat reservasi")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    filtered,
    form,
    setForm,
    errors,
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
    rawList: reservations,
    isMobile,
  };
}
