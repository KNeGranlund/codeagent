import { getDb } from './db'

export function initializeDatabase() {
  const db = getDb()
  
  // Check if database is properly initialized
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('calculations', 'components', 'packages')
    `).all()
    
    if (tables.length !== 3) {
      console.log('Database tables missing, running migration...')
      // The migration will run automatically in getDb() if tables don't exist
    }
    
    console.log('✅ Database initialized successfully')
    
    // Log current data counts
    const calcCount = db.prepare('SELECT COUNT(*) as count FROM calculations').get() as { count: number }
    const compCount = db.prepare('SELECT COUNT(*) as count FROM components').get() as { count: number }  
    const pkgCount = db.prepare('SELECT COUNT(*) as count FROM packages').get() as { count: number }
    
    console.log(`📊 Current data: ${calcCount.count} calculations, ${compCount.count} components, ${pkgCount.count} packages`)
    
    return {
      success: true,
      counts: {
        calculations: calcCount.count,
        components: compCount.count,
        packages: pkgCount.count
      }
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Environment-specific database health check
export function checkDatabaseHealth() {
  try {
    const db = getDb()
    
    // Test basic operations
    db.prepare('SELECT 1').get()
    
    // Check if we can read from all tables
    db.prepare('SELECT COUNT(*) FROM calculations').get()
    db.prepare('SELECT COUNT(*) FROM components').get()
    db.prepare('SELECT COUNT(*) FROM packages').get()
    
    return { healthy: true }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
