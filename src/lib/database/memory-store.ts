import type { Calculation, ComponentItem, Package } from '@/lib/types'

// Simple in-memory data store for demo purposes
class MemoryDataStore {
  private calculations: Map<string, Calculation> = new Map()
  private components: ComponentItem[] = []
  private packages: Package[] = []

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    // Initialize with sample data
    this.loadSampleComponents()
    this.loadSamplePackages()
    this.loadSampleCalculation()
  }

  private loadSampleComponents() {
    const sampleComponents: ComponentItem[] = [
      {
        id: 'comp-1',
        code: 'AHU-SM',
        name: 'Air Handling Unit - Small',
        description: 'Professional grade air handling unit for small spaces',
        category: 'equipment',
        manufacturer: 'HVAC Pro Systems',
        model: 'HPS-AHU-SM',
        specifications: { type: 'standard', efficiency: 'high' },
        basePrice: 2500,
        laborTime: 8,
        vendors: [
          { vendor: 'HVAC Supply Co', price: 2500 },
          { vendor: 'BuildTech Systems', price: 2750 }
        ],
        tags: ['professional', 'hvac', 'small']
      },
      {
        id: 'comp-2',
        code: 'AHU-MD',
        name: 'Air Handling Unit - Medium',
        description: 'Professional grade air handling unit for medium spaces',
        category: 'equipment',
        manufacturer: 'HVAC Pro Systems',
        model: 'HPS-AHU-MD',
        specifications: { type: 'standard', efficiency: 'high' },
        basePrice: 4200,
        laborTime: 12,
        vendors: [
          { vendor: 'HVAC Supply Co', price: 4200 },
          { vendor: 'BuildTech Systems', price: 4620 }
        ],
        tags: ['professional', 'hvac', 'medium']
      },
      {
        id: 'comp-3',
        code: 'DUCT-24',
        name: 'Ductwork - Main Trunk 24"',
        description: 'Main trunk ductwork 24 inch diameter',
        category: 'ductwork',
        manufacturer: 'HVAC Pro Systems',
        model: 'HPS-DUCT-24',
        specifications: { size: '24"', material: 'galvanized steel' },
        basePrice: 45,
        laborTime: 2,
        vendors: [
          { vendor: 'HVAC Supply Co', price: 45 },
          { vendor: 'BuildTech Systems', price: 49.50 }
        ],
        tags: ['ductwork', 'trunk', '24inch']
      },
      {
        id: 'comp-4',
        code: 'VAV-STD',
        name: 'Variable Air Volume Box',
        description: 'Standard VAV box for zone control',
        category: 'controls',
        manufacturer: 'HVAC Pro Systems',
        model: 'HPS-VAV-STD',
        specifications: { type: 'pneumatic', control: 'zone' },
        basePrice: 850,
        laborTime: 3,
        vendors: [
          { vendor: 'HVAC Supply Co', price: 850 },
          { vendor: 'BuildTech Systems', price: 935 }
        ],
        tags: ['controls', 'vav', 'pneumatic']
      },
      {
        id: 'comp-5',
        code: 'FILTER-HEPA',
        name: 'HEPA Filter - 24x24',
        description: 'High efficiency particulate air filter',
        category: 'accessories',
        manufacturer: 'HVAC Pro Systems',
        model: 'HPS-FILTER-HEPA',
        specifications: { size: '24x24', efficiency: 'HEPA' },
        basePrice: 120,
        laborTime: 0.5,
        vendors: [
          { vendor: 'HVAC Supply Co', price: 120 },
          { vendor: 'BuildTech Systems', price: 132 }
        ],
        tags: ['filter', 'hepa', 'air quality']
      }
    ]
    
    this.components = sampleComponents
  }

  private loadSamplePackages() {
    const samplePackages: Package[] = [
      {
        id: 'pkg-1',
        name: 'Basic Office HVAC Package',
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
              name: 'Ductwork Package - Small Office',
              code: 'DUCT-PKG-SM',
              category: 'ductwork',
              quantity: 1,
              unitPrice: 1200,
              laborHours: 12,
              laborRate: 75
            },
            quantity: 1
          },
          {
            customItem: {
              name: 'Control System - Basic',
              code: 'CTRL-BASIC',
              category: 'controls',
              quantity: 1,
              unitPrice: 800,
              laborHours: 4,
              laborRate: 95
            },
            quantity: 1
          }
        ]
      },
      {
        id: 'pkg-2',
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
          },
          {
            customItem: {
              name: 'Initial Consultation',
              code: 'CONSULT-FREE',
              category: 'labor',
              quantity: 1,
              unitPrice: 0,
              laborHours: 1,
              laborRate: 0
            },
            quantity: 1
          }
        ]
      }
    ]
    
    this.packages = samplePackages
  }

  private loadSampleCalculation() {
    const now = new Date().toISOString()
    const sampleCalculation: Calculation = {
      id: 'calc-sample-1',
      name: 'Sample Office HVAC Project',
      description: 'Demo calculation for office building HVAC system',
      projectCode: 'DEMO-001',
      customerInfo: { 
        name: 'Demo Customer', 
        company: 'Demo Corp',
        email: 'demo@example.com',
        phone: '(555) 123-4567'
      },
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      items: [
        {
          id: 'item-1',
          name: 'Air Handling Unit - Small',
          code: 'AHU-SM',
          category: 'equipment',
          quantity: 1,
          unitPrice: 2500,
          laborHours: 8,
          laborRate: 85
        },
        {
          id: 'item-2',
          name: 'HEPA Filter - 24x24',
          code: 'FILTER-HEPA',
          category: 'accessories',
          quantity: 2,
          unitPrice: 120
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
        taxRate: 0.075,
        laborRate: 85,
        overhead: 250,
      },
      totals: {
        materialSubtotal: 2740,
        laborSubtotal: 680,
        overhead: 250,
        tax: 0,
        profit: 0,
        grandTotal: 3670,
      },
    }
    
    this.calculations.set(sampleCalculation.id, sampleCalculation)
  }

  // Calculation methods
  listCalculations(): Calculation[] {
    return Array.from(this.calculations.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  getCalculation(id: string): Calculation | null {
    return this.calculations.get(id) || null
  }

  saveCalculation(calc: Calculation): Calculation {
    calc.updatedAt = new Date().toISOString()
    if (!calc.createdAt) {
      calc.createdAt = calc.updatedAt
    }
    this.calculations.set(calc.id, calc)
    return calc
  }

  deleteCalculation(id: string): void {
    this.calculations.delete(id)
  }

  // Component methods
  listComponents(query?: { q?: string; category?: string }): ComponentItem[] {
    let filtered = [...this.components]
    
    if (query?.q) {
      const searchTerm = query.q.toLowerCase()
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(searchTerm) ||
        comp.code.toLowerCase().includes(searchTerm) ||
        comp.description.toLowerCase().includes(searchTerm)
      )
    }
    
    if (query?.category) {
      filtered = filtered.filter(comp => comp.category === query.category)
    }
    
    return filtered.slice(0, 200) // Limit results
  }

  // Package methods
  listPackages(query?: { q?: string; category?: string; includeFree?: boolean }): Package[] {
    let filtered = [...this.packages]
    
    if (query?.q) {
      const searchTerm = query.q.toLowerCase()
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm) ||
        pkg.description.toLowerCase().includes(searchTerm)
      )
    }
    
    if (query?.category) {
      filtered = filtered.filter(pkg => pkg.category === query.category)
    }
    
    if (query?.includeFree === false) {
      filtered = filtered.filter(pkg => !pkg.isFree)
    }
    
    return filtered.slice(0, 50) // Limit results
  }

  getPackage(id: string): Package | null {
    return this.packages.find(pkg => pkg.id === id) || null
  }
}

// Singleton instance
const memoryStore = new MemoryDataStore()

export { memoryStore }
