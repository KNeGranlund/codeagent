import type { Calculation, CalculationItem } from "@/lib/types"

function calculateItemTotals(items: CalculationItem[]): { materialTotal: number; laborTotal: number } {
  let materialTotal = 0
  let laborTotal = 0

  const processItem = (item: CalculationItem) => {
    // Add material cost
    materialTotal += item.quantity * item.unitPrice

    // Add labor cost
    if (item.laborHours && item.laborRate) {
      laborTotal += item.laborHours * item.laborRate * item.quantity
    }

    // Process children recursively
    if (item.children) {
      item.children.forEach(processItem)
    }
  }

  items.forEach(processItem)
  return { materialTotal, laborTotal }
}

export function computeTotals(calc: Calculation) {
  const { materialTotal, laborTotal } = calculateItemTotals(calc.items)
  
  const materialSubtotal = materialTotal
  const laborSubtotal = laborTotal
  const overhead = calc.settings.overhead
  const profit = (materialSubtotal + laborSubtotal) * calc.settings.globalMarkup
  const tax = (materialSubtotal + profit) * calc.settings.taxRate
  const grandTotal = materialSubtotal + laborSubtotal + overhead + profit + tax
  
  const totals = { 
    materialSubtotal, 
    laborSubtotal, 
    overhead, 
    tax, 
    profit, 
    grandTotal 
  }
  
  calc.totals = totals
  return totals
}

export function calculateItemTotal(item: CalculationItem): number {
  let total = item.quantity * item.unitPrice
  
  // Add labor costs
  if (item.laborHours && item.laborRate) {
    total += item.laborHours * item.laborRate * item.quantity
  }
  
  // Add children totals
  if (item.children) {
    total += item.children.reduce((sum, child) => sum + calculateItemTotal(child), 0)
  }
  
  return total
}
