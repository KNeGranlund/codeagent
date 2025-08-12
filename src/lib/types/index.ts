// Core types for HVAC Calculator Pro

export type ItemCategory =
  | 'equipment'
  | 'ductwork'
  | 'controls'
  | 'labor'
  | 'materials'
  | 'accessories'
  | 'custom'

export interface CustomerInfo {
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
}

export interface CalculationSettings {
  globalMarkup: number
  categoryMarkups: Record<ItemCategory, number>
  taxRate: number
  laborRate: number
  overhead: number
}

export interface CalculationTotals {
  materialSubtotal: number
  laborSubtotal: number
  overhead: number
  tax: number
  profit: number
  grandTotal: number
}

export interface CalculationItem {
  id: string
  parentId?: string
  code?: string
  name: string
  description?: string
  category: ItemCategory
  quantity: number
  unitPrice: number
  laborHours?: number
  laborRate?: number
  markup?: number
  customFields?: Record<string, any>
  children?: CalculationItem[]
}

export interface VendorPricing {
  vendor: string
  price: number
  lastUpdated?: string
}

export interface ComponentItem {
  id: string
  code: string
  name: string
  description: string
  category: ItemCategory
  manufacturer?: string
  model?: string
  specifications: Record<string, any>
  basePrice: number
  laborTime?: number
  vendors: VendorPricing[]
  tags: string[]
}

export interface PackageItem {
  componentId?: string  // Reference to component registry
  customItem?: Omit<CalculationItem, 'id' | 'parentId'>  // Custom item definition
  quantity: number
  overridePrice?: number  // Override the default price
}

export interface Package {
  id: string
  name: string
  description: string
  category: string
  items: PackageItem[]
  defaultMarkup?: number
  isTemplate: boolean
  isFree: boolean  // For free packages
  basePrice?: number  // Total package price override
}

export interface Calculation {
  id: string
  name: string
  description?: string
  projectCode?: string
  customerInfo: CustomerInfo
  createdAt: string
  updatedAt: string
  status: 'draft' | 'review' | 'approved' | 'archived'
  items: CalculationItem[]
  settings: CalculationSettings
  totals: CalculationTotals
}
