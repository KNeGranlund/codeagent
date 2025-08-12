import { notFound } from "next/navigation"
import { repo } from "@/lib/database/repo"
import CalculationDetailClient from "./CalculationDetailClient"
import type { Calculation } from "@/lib/types"
import { use } from "react"

function getCalculation(id: string): Calculation | null {
  return repo.getCalculation(id)
}

export default function CalculationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const calc = getCalculation(id)
  
  if (!calc) {
    return notFound()
  }

  return <CalculationDetailClient initialCalc={calc} />
}
