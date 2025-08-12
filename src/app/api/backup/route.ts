import { NextRequest, NextResponse } from "next/server"
import { exportData, importData } from "@/lib/database/backup"

export async function GET() {
  try {
    const data = exportData()
    
    // Return as downloadable JSON file
    const response = new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="hvac-pro-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
    
    return response
  } catch (error) {
    console.error('Backup export failed:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Validate backup data structure
    if (!data.calculations && !data.components && !data.packages) {
      return NextResponse.json({ error: 'Invalid backup data format' }, { status: 400 })
    }
    
    importData(data)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data imported successfully',
      imported: {
        calculations: data.calculations?.length || 0,
        components: data.components?.length || 0,
        packages: data.packages?.length || 0
      }
    })
  } catch (error) {
    console.error('Backup import failed:', error)
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 })
  }
}
