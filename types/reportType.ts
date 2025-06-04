export type Report = {
    _id: string
    amount: number
    type: "Income" | "Expense"
    description: string
    invoice_ref?: {
        _id: string
        reservation_id?: {
            _id: string
            name: string
            ticket_id: string
            destination: string
        }
    }
    createdAt?: string
}