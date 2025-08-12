import { getDb } from './db'
import type { Calculation, ComponentItem, Package } from '@/lib/types'
import { randomUUID } from 'crypto'

export const repo = {
  listCalculations(): Calculation[] {
    const db = getDb()
    const rows = db.prepare('SELECT data FROM calculations ORDER BY updatedAt DESC').all()
    return rows.map((r: any) => JSON.parse(r.data))
  },
  getCalculation(id: string): Calculation | null {
    const db = getDb()
    const row = db.prepare('SELECT data FROM calculations WHERE id = ?').get(id) as any
    return row ? (JSON.parse(row.data) as Calculation) : null
  },
  saveCalculation(calc: Calculation): Calculation {
    const db = getDb()
    const now = new Date().toISOString()
    calc.updatedAt = now
    const exists = db.prepare('SELECT 1 FROM calculations WHERE id = ?').get(calc.id)
    if (exists) {
      db.prepare('UPDATE calculations SET data = ?, updatedAt = ? WHERE id = ?').run(
        JSON.stringify(calc),
        now,
        calc.id,
      )
    } else {
      calc.createdAt = now
      db.prepare('INSERT INTO calculations (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run(
        calc.id,
        JSON.stringify(calc),
        now,
        now,
      )
    }
    return calc
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
  deleteCalculation(id: string) {
    const db = getDb()
    db.prepare('DELETE FROM calculations WHERE id = ?').run(id)
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
    const db = getDb()
    let sql = 'SELECT * FROM components'
    const params: any[] = []
    const where: string[] = []
    if (query?.q) {
      where.push('(name LIKE ? OR code LIKE ? OR description LIKE ?)')
      params.push(`%${query.q}%`, `%${query.q}%`, `%${query.q}%`)
    }
    if (query?.category) {
      where.push('category = ?')
      params.push(query.category)
    }
    if (where.length) sql += ' WHERE ' + where.join(' AND ')
    sql += ' ORDER BY name ASC LIMIT 200'
    const rows = db.prepare(sql).all(...params)
    return rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      category: r.category,
      manufacturer: r.manufacturer ?? undefined,
      model: r.model ?? undefined,
      specifications: JSON.parse(r.specifications ?? '{}'),
      basePrice: r.basePrice,
      laborTime: r.laborTime ?? undefined,
      vendors: JSON.parse(r.vendors ?? '[]'),
      tags: JSON.parse(r.tags ?? '[]'),
    }))
  },
  listPackages(query?: { q?: string; category?: string; includeFree?: boolean }): Package[] {
    const db = getDb()
    let sql = 'SELECT * FROM packages WHERE isTemplate = 1'
    const params: any[] = []
    
    if (query?.q) {
      sql += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${query.q}%`, `%${query.q}%`)
    }
    if (query?.category) {
      sql += ' AND category = ?'
      params.push(query.category)
    }
    if (query?.includeFree !== undefined) {
      sql += query.includeFree ? ' AND isFree = 1' : ' AND isFree = 0'
    }
    
    sql += ' ORDER BY name ASC LIMIT 50'
    const rows = db.prepare(sql).all(...params)
    
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      items: JSON.parse(r.items),
      defaultMarkup: r.defaultMarkup ?? undefined,
      isTemplate: Boolean(r.isTemplate),
      isFree: Boolean(r.isFree),
      basePrice: r.basePrice ?? undefined,
    }))
  },
  getPackage(id: string): Package | null {
    const db = getDb()
    const row = db.prepare('SELECT * FROM packages WHERE id = ?').get(id) as any
    if (!row) return null
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      items: JSON.parse(row.items),
      defaultMarkup: row.defaultMarkup ?? undefined,
      isTemplate: Boolean(row.isTemplate),
      isFree: Boolean(row.isFree),
      basePrice: row.basePrice ?? undefined,
    }
  },
}
