import * as XLSX from 'xlsx'
import type { Calculation, CalculationItem } from '@/lib/types'
import { computeTotals } from './calc'

export function exportCalculationToExcel(calculation: Calculation) {
  const workbook = XLSX.utils.book_new()
  const totals = computeTotals(calculation)

  // Create Items worksheet
  const itemsData = prepareItemsData(calculation.items)
  const itemsWorksheet = XLSX.utils.json_to_sheet(itemsData)
  
  // Add column widths
  itemsWorksheet['!cols'] = [
    { wch: 15 }, // Code
    { wch: 40 }, // Name
    { wch: 50 }, // Description
    { wch: 15 }, // Category
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit Price
    { wch: 12 }, // Total Price
    { wch: 12 }, // Labor Hours
    { wch: 12 }, // Labor Rate
    { wch: 12 }  // Labor Cost
  ]

  XLSX.utils.book_append_sheet(workbook, itemsWorksheet, 'Items')

  // Create Summary worksheet
  const summaryData = [
    { Field: 'Project Name', Value: calculation.name },
    { Field: 'Project Code', Value: calculation.projectCode || '' },
    { Field: 'Status', Value: calculation.status },
    { Field: 'Created Date', Value: new Date(calculation.createdAt).toLocaleDateString() },
    { Field: 'Updated Date', Value: new Date(calculation.updatedAt).toLocaleDateString() },
    { Field: '', Value: '' }, // Empty row
    { Field: 'Customer Name', Value: calculation.customerInfo.name || '' },
    { Field: 'Customer Company', Value: calculation.customerInfo.company || '' },
    { Field: 'Customer Email', Value: calculation.customerInfo.email || '' },
    { Field: 'Customer Phone', Value: calculation.customerInfo.phone || '' },
    { Field: '', Value: '' }, // Empty row
    { Field: 'Material Subtotal', Value: totals.materialSubtotal },
    { Field: 'Labor Subtotal', Value: totals.laborSubtotal },
    { Field: 'Overhead', Value: totals.overhead },
    { Field: 'Profit', Value: totals.profit },
    { Field: 'Tax', Value: totals.tax },
    { Field: 'GRAND TOTAL', Value: totals.grandTotal }
  ]

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
  
  // Add column widths
  summaryWorksheet['!cols'] = [
    { wch: 20 }, // Field
    { wch: 25 }  // Value
  ]

  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

  // Create Settings worksheet
  const settingsData = [
    { Setting: 'Global Markup', Value: `${(calculation.settings.globalMarkup * 100).toFixed(2)}%` },
    { Setting: 'Tax Rate', Value: `${(calculation.settings.taxRate * 100).toFixed(2)}%` },
    { Setting: 'Labor Rate', Value: `$${calculation.settings.laborRate.toFixed(2)}/hour` },
    { Setting: 'Overhead Rate', Value: `${(calculation.settings.overhead * 100).toFixed(2)}%` }
  ]

  const settingsWorksheet = XLSX.utils.json_to_sheet(settingsData)
  settingsWorksheet['!cols'] = [
    { wch: 20 }, // Setting
    { wch: 15 }  // Value
  ]

  XLSX.utils.book_append_sheet(workbook, settingsWorksheet, 'Settings')

  return workbook
}

function prepareItemsData(items: CalculationItem[], level = 0): any[] {
  const result: any[] = []
  
  for (const item of items) {
    const laborCost = (item.laborHours || 0) * (item.laborRate || 0)
    const totalPrice = item.quantity * item.unitPrice
    
    result.push({
      Code: item.code || '',
      Name: '  '.repeat(level) + item.name, // Indent based on level
      Description: item.description || '',
      Category: item.category,
      Quantity: item.quantity,
      'Unit Price': item.unitPrice,
      'Total Price': totalPrice,
      'Labor Hours': item.laborHours || 0,
      'Labor Rate': item.laborRate || 0,
      'Labor Cost': laborCost
    })
    
    if (item.children && item.children.length > 0) {
      result.push(...prepareItemsData(item.children, level + 1))
    }
  }
  
  return result
}

export function downloadCalculationExcel(calculation: Calculation) {
  const workbook = exportCalculationToExcel(calculation)
  const filename = `${calculation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_calculation.xlsx`
  XLSX.writeFile(workbook, filename)
}
