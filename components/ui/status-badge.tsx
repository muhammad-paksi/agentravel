export function getStatusClasses(status: string) {
    switch (status) {
      case "Booked":
        return "bg-[#fff886] text-[#a66a02]";
      case "Canceled":
        return "bg-[#FFC8C5] text-[#c8170d]";
      case "Completed":
        return "bg-[#c0f2cc] text-[#1e7735]";
      case "Paid":
        return "bg-[#c0f2cc] text-[#1e7735]";
      case "Unpaid":
        return "bg-[#FFC8C5] text-[#c8170d]";
      default:
        return "bg-gray-100 text-gray-600";
    }
}

export const STATUS_BASE_CLASSES =
  "inline-block w-24 text-center px-2 py-1 rounded-full text-sm";

export function getTypeClasses(type: string) {
    switch (type) {
      case "Reservation":
        return "bg-[#d6e8ff] text-[#377dec]"; // Warna biru muda untuk Reservation
      case "Invoice":
        return "bg-[#fff886] text-[#a66a02]"; // Warna ungu muda untuk Invoice
      default:
        return "bg-gray-100 text-gray-600";
    }
}

export const TYPE_BASE_CLASSES = 
  "inline-block w-27 text-center px-2 py-1 rounded-full text-sm";