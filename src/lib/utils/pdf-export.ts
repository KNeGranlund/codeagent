import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Calculation, CalculationItem } from '@/lib/types'
import { computeTotals } from './calc'

interface PDFOptions {
  includeCustomerInfo?: boolean
  includeItemDetails?: boolean
  includeBreakdown?: boolean
}

export function exportCalculationToPDF(
  calculation: Calculation,
  options: PDFOptions = {}
) {
  const {
    includeCustomerInfo = true,
    includeItemDetails = true,
    includeBreakdown = true
  } = options

  const doc = new jsPDF()
  const totals = computeTotals(calculation)
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('HVAC Cost Calculation', 20, yPosition)
  yPosition += 10

  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text(calculation.name, 20, yPosition)
  yPosition += 15

  // Project Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Project Information', 20, yPosition)
  yPosition += 8

  doc.setFont('helvetica', 'normal')
  if (calculation.projectCode) {
    doc.text(`Project Code: ${calculation.projectCode}`, 20, yPosition)
    yPosition += 6
  }
  doc.text(`Status: ${calculation.status.charAt(0).toUpperCase() + calculation.status.slice(1)}`, 20, yPosition)
  yPosition += 6
  doc.text(`Created: ${new Date(calculation.createdAt).toLocaleDateString()}`, 20, yPosition)
  yPosition += 6
  doc.text(`Updated: ${new Date(calculation.updatedAt).toLocaleDateString()}`, 20, yPosition)
  yPosition += 15

  // Customer Information
  if (includeCustomerInfo && calculation.customerInfo.name) {
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Information', 20, yPosition)
    yPosition += 8

    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${calculation.customerInfo.name}`, 20, yPosition)
    yPosition += 6
    
    if (calculation.customerInfo.company) {
      doc.text(`Company: ${calculation.customerInfo.company}`, 20, yPosition)
      yPosition += 6
    }
    
    if (calculation.customerInfo.email) {
      doc.text(`Email: ${calculation.customerInfo.email}`, 20, yPosition)
      yPosition += 6
    }
    
    if (calculation.customerInfo.phone) {
      doc.text(`Phone: ${calculation.customerInfo.phone}`, 20, yPosition)
      yPosition += 6
    }
    yPosition += 10
  }

  // Items Table
  if (includeItemDetails) {
    const tableData = flattenItems(calculation.items).map(item => [
      item.code || '',
      item.name,
      item.category,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${(item.quantity * item.unitPrice).toFixed(2)}`
    ])

    autoTable(doc, {
      head: [['Code', 'Item Name', 'Category', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [34, 197, 94] }, // Green header
      margin: { left: 20, right: 20 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Cost Breakdown
  if (includeBreakdown) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Cost Summary', 20, yPosition)
    yPosition += 10

    const summaryData = [
      ['Material Subtotal', `$${totals.materialSubtotal.toFixed(2)}`],
      ['Labor Subtotal', `$${totals.laborSubtotal.toFixed(2)}`],
      ['Overhead', `$${totals.overhead.toFixed(2)}`],
      [`Profit (${(calculation.settings.globalMarkup * 100).toFixed(1)}%)`, `$${totals.profit.toFixed(2)}`],
      [`Tax (${(calculation.settings.taxRate * 100).toFixed(2)}%)`, `$${totals.tax.toFixed(2)}`],
      ['', ''], // Empty row for spacing
      ['GRAND TOTAL', `$${totals.grandTotal.toFixed(2)}`]
    ]

    autoTable(doc, {
      body: summaryData,
      startY: yPosition,
      styles: { fontSize: 12 },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'right', fontStyle: 'bold' }
      },
      theme: 'plain',
      margin: { left: 20, right: 20 }
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
      20,
      doc.internal.pageSize.height - 10
    )
  }

  return doc
}

function flattenItems(items: CalculationItem[], depth = 0): CalculationItem[] {
  const result: CalculationItem[] = []
  
  for (const item of items) {
    result.push(item)
    if (item.children && item.children.length > 0) {
      result.push(...flattenItems(item.children, depth + 1))
    }
  }
  
  return result
}

export function downloadCalculationPDF(calculation: Calculation, options?: PDFOptions) {
  const doc = exportCalculationToPDF(calculation, options)
  const filename = `${calculation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_calculation.pdf`
  doc.save(filename)
}
