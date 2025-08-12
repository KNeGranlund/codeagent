// better-sqlite3 in-memory DB with seed data for MVP
import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Calculation, ComponentItem, Package } from '@/lib/types'

// Singleton connection (in-memory exists per process)
let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    db = new Database(':memory:')
    db.pragma('journal_mode = WAL')
    migrate(db)
    seed(db)
  }
  return db
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS calculations (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS components (
      id TEXT PRIMARY KEY,
      code TEXT,
      name TEXT,
      description TEXT,
      category TEXT,
      manufacturer TEXT,
      model TEXT,
      specifications TEXT,
      basePrice REAL,
      laborTime REAL,
      vendors TEXT,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      items TEXT NOT NULL,
      defaultMarkup REAL,
      isTemplate INTEGER DEFAULT 0,
      isFree INTEGER DEFAULT 0,
      basePrice REAL,
      createdAt TEXT NOT NULL
    );
  `)
}

function seed(db: Database.Database) {
  // Seed 50+ common items
  const baseComponents: Omit<ComponentItem, 'id'>[] = []
  const categories: ComponentItem['category'][] = [
    'equipment',
    'ductwork',
    'controls',
    'materials',
    'accessories',
  ]
  
  // Create specific HVAC components
  const hvacComponents = [
    { name: 'Air Handling Unit - Small', code: 'AHU-SM', category: 'equipment', basePrice: 2500, laborTime: 8 },
    { name: 'Air Handling Unit - Medium', code: 'AHU-MD', category: 'equipment', basePrice: 4200, laborTime: 12 },
    { name: 'Air Handling Unit - Large', code: 'AHU-LG', category: 'equipment', basePrice: 6800, laborTime: 16 },
    { name: 'Ductwork - Main Trunk 24"', code: 'DUCT-24', category: 'ductwork', basePrice: 45, laborTime: 2 },
    { name: 'Ductwork - Branch 12"', code: 'DUCT-12', category: 'ductwork', basePrice: 25, laborTime: 1.5 },
    { name: 'Ductwork - Branch 8"', code: 'DUCT-8', category: 'ductwork', basePrice: 18, laborTime: 1 },
    { name: 'Variable Air Volume Box', code: 'VAV-STD', category: 'controls', basePrice: 850, laborTime: 3 },
    { name: 'Thermostat - Programmable', code: 'TSTAT-PROG', category: 'controls', basePrice: 180, laborTime: 1 },
    { name: 'HEPA Filter - 24x24', code: 'FILTER-HEPA', category: 'accessories', basePrice: 120, laborTime: 0.5 },
    { name: 'Pleated Filter - 20x25', code: 'FILTER-PLT', category: 'accessories', basePrice: 25, laborTime: 0.25 },
    { name: 'Grille - Supply 24x12', code: 'GRILLE-SUP', category: 'accessories', basePrice: 35, laborTime: 0.5 },
    { name: 'Grille - Return 30x20', code: 'GRILLE-RET', category: 'accessories', basePrice: 42, laborTime: 0.5 },
    { name: 'Insulation - Duct Wrap', code: 'INSUL-WRAP', category: 'materials', basePrice: 8, laborTime: 0.3 },
    { name: 'Sealant - Duct Mastic', code: 'SEAL-MASTIC', category: 'materials', basePrice: 12, laborTime: 0.2 },
  ]

  // Add the specific components
  hvacComponents.forEach((comp, i) => {
    baseComponents.push({
      code: comp.code,
      name: comp.name,
      description: `Professional grade ${comp.name.toLowerCase()}`,
      category: comp.category as ComponentItem['category'],
      manufacturer: 'HVAC Pro Systems',
      model: `HPS-${comp.code}`,
      specifications: { type: 'standard', efficiency: 'high' },
      basePrice: comp.basePrice,
      laborTime: comp.laborTime,
      vendors: [
        { vendor: 'HVAC Supply Co', price: comp.basePrice },
        { vendor: 'BuildTech Systems', price: comp.basePrice * 1.1 },
      ],
      tags: ['professional', 'hvac'],
    })
  })

  // Fill remaining slots with generic components
  for (let i = hvacComponents.length; i < 55; i++) {
    baseComponents.push({
      code: `CMP-${i.toString().padStart(3, '0')}`,
      name: `Component ${i}`,
      description: `Sample HVAC component #${i}`,
      category: categories[i % categories.length],
      manufacturer: 'GenericCo',
      model: `GC-${1000 + i}`,
      specifications: { size: `${i}\"`, power: `${i * 10}W` },
      basePrice: Math.round(50 + Math.random() * 950),
      laborTime: Math.round(Math.random() * 8 * 10) / 10,
      vendors: [
        { vendor: 'VendorA', price: Math.round(50 + Math.random() * 950) },
        { vendor: 'VendorB', price: Math.round(50 + Math.random() * 950) },
      ],
      tags: ['common', 'seed'],
    })
  }

  const insertComp = db.prepare(`
    INSERT INTO components (id, code, name, description, category, manufacturer, model, specifications, basePrice, laborTime, vendors, tags)
    VALUES (@id, @code, @name, @description, @category, @manufacturer, @model, @specifications, @basePrice, @laborTime, @vendors, @tags)
  `)
  const compTx = db.transaction((rows: typeof baseComponents) => {
    for (const r of rows) {
      insertComp.run({
        id: randomUUID(),
        code: r.code,
        name: r.name,
        description: r.description,
        category: r.category,
        manufacturer: r.manufacturer,
        model: r.model,
        specifications: JSON.stringify(r.specifications),
        basePrice: r.basePrice,
        laborTime: r.laborTime ?? null,
        vendors: JSON.stringify(r.vendors),
        tags: JSON.stringify(r.tags),
      })
    }
  })
  compTx(baseComponents)

  // Seed some sample packages
  const samplePackages: Omit<Package, 'id'>[] = [
    {
      name: 'Basic Office HVAC Package',
      description: 'Complete HVAC solution for small office spaces (up to 2000 sq ft)',
      category: 'equipment',
      isFree: false,
      isTemplate: true,
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
      name: 'Maintenance Package - Annual',
      description: 'Annual maintenance package including filters, inspection, and tune-up',
      category: 'materials',
      isFree: false,
      isTemplate: true,
      items: [
        {
          customItem: {
            name: 'Filter Replacement Set',
            code: 'FILTER-SET',
            category: 'accessories',
            quantity: 4,
            unitPrice: 45,
            laborHours: 1,
            laborRate: 85
          },
          quantity: 1
        },
        {
          customItem: {
            name: 'System Inspection & Tune-up',
            code: 'INSPECT-ANNUAL',
            category: 'labor',
            quantity: 1,
            unitPrice: 0,
            laborHours: 3,
            laborRate: 125
          },
          quantity: 1
        }
      ]
    },
    {
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

  const insertPackage = db.prepare(`
    INSERT INTO packages (id, name, description, category, items, defaultMarkup, isTemplate, isFree, basePrice, createdAt)
    VALUES (@id, @name, @description, @category, @items, @defaultMarkup, @isTemplate, @isFree, @basePrice, @createdAt)
  `)
  const packageTx = db.transaction((packages: typeof samplePackages) => {
    for (const pkg of packages) {
      insertPackage.run({
        id: randomUUID(),
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        items: JSON.stringify(pkg.items),
        defaultMarkup: pkg.defaultMarkup ?? null,
        isTemplate: pkg.isTemplate ? 1 : 0,
        isFree: pkg.isFree ? 1 : 0,
        basePrice: pkg.basePrice ?? null,
        createdAt: new Date().toISOString(),
      })
    }
  })
  packageTx(samplePackages)

  // Seed a sample calculation
  const now = new Date().toISOString()
  const calc: Calculation = {
    id: randomUUID(),
    name: 'Sample Project',
    description: 'Initial example calculation',
    projectCode: 'PRJ-001',
    customerInfo: { name: 'Acme Corp', email: 'ops@acme.com' },
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    items: [
      {
        id: randomUUID(),
        name: 'Air Handling Unit',
        code: 'AHU-001',
        category: 'equipment',
        quantity: 1,
        unitPrice: 2500,
        laborHours: 8,
        laborRate: 85,
        markup: 0.15,
        children: [
          {
            id: randomUUID(),
            parentId: 'root',
            name: 'Filter Set',
            code: 'FLT-001',
            category: 'accessories',
            quantity: 2,
            unitPrice: 45,
          },
        ],
      },
    ],
    settings: {
      globalMarkup: 0.1,
      categoryMarkups: {
        equipment: 0.1,
        ductwork: 0.12,
        controls: 0.15,
        labor: 0,
        materials: 0.12,
        accessories: 0.08,
        custom: 0.1,
      },
      taxRate: 0.075,
      laborRate: 85,
      overhead: 250,
    },
    totals: {
      materialSubtotal: 0,
      laborSubtotal: 0,
      overhead: 250,
      tax: 0,
      profit: 0,
      grandTotal: 0,
    },
  }
  const insertCalc = db.prepare(
    `INSERT INTO calculations (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)`
  )
  insertCalc.run(calc.id, JSON.stringify(calc), now, now)
}

export type { Database }
