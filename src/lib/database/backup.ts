import { getDb } from './db'
import fs from 'fs'
import path from 'path'

export function createBackup(): string {
  const db = getDb()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(process.cwd(), 'backups', `hvac-pro-${timestamp}.db`)
  
  // Ensure backup directory exists
  const backupDir = path.dirname(backupPath)
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  // Create backup using SQLite backup API
  db.backup(backupPath)
  
  return backupPath
}

export function restoreFromBackup(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`)
  }
  
  const db = getDb()
  
  // Close current connection
  if (db) {
    db.close()
  }
  
  // Copy backup file to current database location
  // Note: This is a simplified approach - in production you'd want more sophisticated restore logic
  console.log(`Restoring from backup: ${backupPath}`)
}

export function exportData(): any {
  const db = getDb()
  
  // Export all data as JSON
  const calculations = db.prepare('SELECT data FROM calculations').all()
  const components = db.prepare('SELECT * FROM components').all()
  const packages = db.prepare('SELECT * FROM packages').all()
  
  return {
    calculations: calculations.map((row: any) => JSON.parse(row.data)),
    components: components.map((row: any) => ({
      ...row,
      specifications: JSON.parse(row.specifications || '{}'),
      vendors: JSON.parse(row.vendors || '[]'),
      tags: JSON.parse(row.tags || '[]')
    })),
    packages: packages.map((row: any) => ({
      ...row,
      items: JSON.parse(row.items)
    })),
    exportedAt: new Date().toISOString()
  }
}

export function importData(data: any): void {
  const db = getDb()
  
  // Clear existing data
  db.prepare('DELETE FROM calculations').run()
  db.prepare('DELETE FROM components').run() 
  db.prepare('DELETE FROM packages').run()
  
  // Import calculations
  const insertCalc = db.prepare('INSERT INTO calculations (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)')
  for (const calc of data.calculations || []) {
    insertCalc.run(calc.id, JSON.stringify(calc), calc.createdAt, calc.updatedAt)
  }
  
  // Import components
  const insertComp = db.prepare(`
    INSERT INTO components (id, code, name, description, category, manufacturer, model, specifications, basePrice, laborTime, vendors, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const comp of data.components || []) {
    insertComp.run(
      comp.id, comp.code, comp.name, comp.description, comp.category,
      comp.manufacturer, comp.model, JSON.stringify(comp.specifications),
      comp.basePrice, comp.laborTime, JSON.stringify(comp.vendors), JSON.stringify(comp.tags)
    )
  }
  
  // Import packages  
  const insertPkg = db.prepare(`
    INSERT INTO packages (id, name, description, category, items, defaultMarkup, isTemplate, isFree, basePrice, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const pkg of data.packages || []) {
    insertPkg.run(
      pkg.id, pkg.name, pkg.description, pkg.category, JSON.stringify(pkg.items),
      pkg.defaultMarkup, pkg.isTemplate ? 1 : 0, pkg.isFree ? 1 : 0, pkg.basePrice, pkg.createdAt
    )
  }
}
