export type History = {
  _id: string
  reference_id: string
  reference_type: "Reservation" | "Invoice"
  date: Date
  description: string
  actor: "Finance Admin" | "Travel Admin"
}
