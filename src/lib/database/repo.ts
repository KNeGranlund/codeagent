// Simple demo repository using in-memory storage (perfect for Vercel)
import { memoryRepo } from './memory-repo'

// Export the memory repo as the main repo
import { memoryStore } from './memory-store'
import type { Calculation, ComponentItem, Package } from '@/lib/types'
import { randomUUID } from 'crypto'

export const repo = {
  listCalculations(): Calculation[] {
    return memoryStore.listCalculations()
  },
  
  getCalculation(id: string): Calculation | null {
    return memoryStore.getCalculation(id)
  },
  
  saveCalculation(calc: Calculation): Calculation {
    return memoryStore.saveCalculation(calc)
  },
  
  createCalculation(partial: Partial<Calculation>): Calculation {
    const now = new Date().toISOString()
    const calc: Calculation = {
      id: randomUUID(),
      name: partial.name || 'New Calculation',
      description: partial.description,
      projectCode: partial.projectCode,
      customerInfo: partial.customerInfo || { name: '' },
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      items: partial.items || [],
      settings: partial.settings || {
        globalMarkup: 0.1,
        categoryMarkups: {
          equipment: 0.1,
          ductwork: 0.1,
          controls: 0.1,
          labor: 0,
          materials: 0.1,
          accessories: 0.1,
          custom: 0.1,
        },
        taxRate: 0.075,
        laborRate: 85,
        overhead: 0,
      },
      totals: partial.totals || {
        materialSubtotal: 0,
        laborSubtotal: 0,
        overhead: 0,
        tax: 0,
        profit: 0,
        grandTotal: 0,
      },
    }
    return this.saveCalculation(calc)
  },
  
  deleteCalculation(id: string): void {
    memoryStore.deleteCalculation(id)
  },
  
  duplicateCalculation(id: string): Calculation | null {
    const existing = this.getCalculation(id)
    if (!existing) return null
    const copy: Calculation = {
      ...existing,
      id: randomUUID(),
      name: existing.name + ' (Copy)',
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    return this.saveCalculation(copy)
  },
  
  listComponents(query?: { q?: string; category?: string }): ComponentItem[] {
    return memoryStore.listComponents(query)
  },
  
  listPackages(query?: { q?: string; category?: string; includeFree?: boolean }): Package[] {
    return memoryStore.listPackages(query)
  },
  
  getPackage(id: string): Package | null {
    return memoryStore.getPackage(id)
  },
}
