// Simple in-memory data store for demo purposes
import type { Calculation, ComponentItem, Package } from '@/lib/types'
import { randomUUID } from 'crypto'

// In-memory storage
let calculations: Calculation[] = []
let components: ComponentItem[] = []
let packages: Package[] = []

// Initialize with demo data
function initializeDemoData() {
  if (calculations.length === 0) {
    // Sample calculations
    const now = new Date().toISOString()
    calculations = [
      {
        id: randomUUID(),
        name: 'Office Building HVAC - Demo',
        description: 'Complete HVAC system for 5000 sq ft office building',
        projectCode: 'DEMO-001',
        customerInfo: { 
          name: 'Demo Customer', 
          company: 'Demo Corp',
          email: 'demo@example.com',
          phone: '555-0123'
        },
        createdAt: now,
        updatedAt: now,
        status: 'draft',
        items: [
          {
            id: randomUUID(),
            name: 'Air Handling Unit - Large',
            code: 'AHU-LG',
            category: 'equipment',
            quantity: 1,
            unitPrice: 6800,
            laborHours: 16,
            laborRate: 85,
            children: [
              {
                id: randomUUID(),
                parentId: 'parent',
                name: 'HEPA Filter Set',
                code: 'FILTER-HEPA',
                category: 'accessories',
                quantity: 2,
                unitPrice: 120,
              }
            ]
          },
          {
            id: randomUUID(),
            name: 'Ductwork - Main System',
            code: 'DUCT-MAIN',
            category: 'ductwork',
            quantity: 50,
            unitPrice: 45,
            laborHours: 25,
            laborRate: 75,
          }
        ],
        settings: {
          globalMarkup: 0.15,
          categoryMarkups: {
            equipment: 0.15,
            ductwork: 0.12,
            controls: 0.18,
            labor: 0,
            materials: 0.12,
            accessories: 0.10,
            custom: 0.15,
          },
          taxRate: 0.08,
          laborRate: 85,
          overhead: 500,
        },
        totals: {
          materialSubtotal: 0,
          laborSubtotal: 0,
          overhead: 500,
          tax: 0,
          profit: 0,
          grandTotal: 0,
        }
      }
    ]

    // Sample components
    components = [
      {
        id: randomUUID(),
        code: 'AHU-SM',
        name: 'Air Handling Unit - Small',
        description: 'Compact AHU for small spaces up to 2000 sq ft',
        category: 'equipment',
        manufacturer: 'HVAC Pro Systems',
        model: 'HPS-AHU-SM',
        specifications: { cfm: '2000', efficiency: 'high' },
        basePrice: 2500,
        laborTime: 8,
        vendors: [
          { vendor: 'HVAC Supply Co', price: 2500 },
          { vendor: 'BuildTech Systems', price: 2750 }
        ],
        tags: ['professional', 'hvac', 'small']
      },
      {
        id: randomUUID(),
        code: 'AHU-MD',
        name: 'Air Handling Unit - Medium',
        description: 'Medium capacity AHU for 2000-4000 sq ft spaces',
        category: 'equipment',
        manufacturer: 'HVAC Pro Systems',
        model: 'HPS-AHU-MD',
        specifications: { cfm: '4000', efficiency: 'high' },
        basePrice: 4200,
        laborTime: 12,
        vendors: [
          { vendor: 'HVAC Supply Co', price: 4200 },
          { vendor: 'BuildTech Systems', price: 4620 }
        ],
        tags: ['professional', 'hvac', 'medium']
      },
      {
        id: randomUUID(),
        code: 'VAV-STD',
        name: 'Variable Air Volume Box',
        description: 'Standard VAV box with controls',
        category: 'controls',
        manufacturer: 'Control Systems Inc',
        model: 'CSI-VAV-001',
        specifications: { airflow: '500-2000 CFM', controls: 'pneumatic' },
        basePrice: 850,
        laborTime: 3,
        vendors: [
          { vendor: 'Controls Direct', price: 850 },
          { vendor: 'HVAC Supply Co', price: 935 }
        ],
        tags: ['controls', 'vav', 'standard']
      }
    ]

    // Sample packages
    packages = [
      {
        id: randomUUID(),
        name: 'Small Office HVAC Package',
        description: 'Complete HVAC solution for small office spaces (up to 2000 sq ft)',
        category: 'equipment',
        isFree: false,
        isTemplate: true,
        basePrice: 4500,
        items: [
          {
            customItem: {
              name: 'Air Handling Unit - Small',
              code: 'AHU-SM',
              category: 'equipment',
              quantity: 1,
              unitPrice: 2500,
              laborHours: 8,
              laborRate: 85
            },
            quantity: 1
          },
          {
            customItem: {
              name: 'Basic Ductwork Package',
              code: 'DUCT-BASIC',
              category: 'ductwork',
              quantity: 1,
              unitPrice: 1200,
              laborHours: 12,
              laborRate: 75
            },
            quantity: 1
          }
        ]
      },
      {
        id: randomUUID(),
        name: 'Free Consultation Package',
        description: 'Complimentary initial consultation and assessment',
        category: 'labor',
        isFree: true,
        isTemplate: true,
        items: [
          {
            customItem: {
              name: 'Site Assessment',
              code: 'ASSESS-FREE',
              category: 'labor',
              quantity: 1,
              unitPrice: 0,
              laborHours: 2,
              laborRate: 0
            },
            quantity: 1
          }
        ]
      }
    ]
  }
}

// Simple repository implementation
export const memoryRepo = {
  // Initialize demo data
  init() {
    initializeDemoData()
  },

  // Calculations
  listCalculations(): Calculation[] {
    initializeDemoData()
    return [...calculations]
  },

  getCalculation(id: string): Calculation | null {
    initializeDemoData()
    return calculations.find(c => c.id === id) || null
  },

  saveCalculation(calc: Calculation): Calculation {
    initializeDemoData()
    const now = new Date().toISOString()
    calc.updatedAt = now
    
    const index = calculations.findIndex(c => c.id === calc.id)
    if (index >= 0) {
      calculations[index] = calc
    } else {
      calc.createdAt = now
      calculations.push(calc)
    }
    return calc
  },

  createCalculation(partial: Partial<Calculation>): Calculation {
    initializeDemoData()
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
    calculations.push(calc)
    return calc
  },

  deleteCalculation(id: string) {
    initializeDemoData()
    const index = calculations.findIndex(c => c.id === id)
    if (index >= 0) {
      calculations.splice(index, 1)
    }
  },

  // Components
  listComponents(query?: { q?: string; category?: string }): ComponentItem[] {
    initializeDemoData()
    let filtered = [...components]
    
    if (query?.q) {
      const search = query.q.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      )
    }
    
    if (query?.category) {
      filtered = filtered.filter(c => c.category === query.category)
    }
    
    return filtered
  },

  // Packages
  listPackages(query?: { q?: string; category?: string; includeFree?: boolean }): Package[] {
    initializeDemoData()
    let filtered = [...packages]
    
    if (query?.q) {
      const search = query.q.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      )
    }
    
    if (query?.category) {
      filtered = filtered.filter(p => p.category === query.category)
    }
    
    if (query?.includeFree === false) {
      filtered = filtered.filter(p => !p.isFree)
    }
    
    return filtered
  },

  getPackage(id: string): Package | null {
    initializeDemoData()
    return packages.find(p => p.id === id) || null
  }
}
