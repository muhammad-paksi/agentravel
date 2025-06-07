import { History } from "@/types/historyTypes"

export async function fetchHistories(): Promise<History[]> {
  const res = await fetch("/api/log-transaksi")
  const json = await res.json()

  if (json.status !== "berhasil") {
    throw new Error("Gagal mengambil data history")
  }

  return json.data
}
