import { useEffect, useState } from "react"
import { History } from "@/types/historyTypes"
import { fetchHistories } from "@/services/historyService"

export function useHistoryForm() {
  const [histories, setHistories] = useState<History[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const data = await fetchHistories()
        setHistories(data)
      } catch (error) {
        console.error("Error fetching history data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return { histories, loading }
}
