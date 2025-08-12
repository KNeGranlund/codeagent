"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Download, Upload, Database, AlertTriangle } from "lucide-react"

export default function AdminPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/backup')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `hvac-pro-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportStatus('')

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      
      if (response.ok) {
        setImportStatus(`✅ Import successful! Imported ${result.imported.calculations} calculations, ${result.imported.components} components, and ${result.imported.packages} packages.`)
      } else {
        throw new Error(result.error || 'Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportStatus(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Administration</h1>
        <p className="text-gray-600">Manage data backup and restore operations</p>
      </div>

      <div className="grid gap-6">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download a complete backup of all calculations, components, and packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? 'Exporting...' : 'Download Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore data from a previously exported backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="flex-1"
              />
              {isImporting && (
                <span className="text-sm text-gray-500">Importing...</span>
              )}
            </div>
            {importStatus && (
              <div className="p-3 rounded-md bg-gray-50 text-sm">
                {importStatus}
              </div>
            )}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <strong>Warning:</strong> Importing will replace all existing data. Make sure to export your current data first if you want to keep it.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Database Information
            </CardTitle>
            <CardDescription>
              Current database configuration and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">{process.env.NODE_ENV || 'development'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV === 'development' ? 'In-Memory (Development)' : 'Persistent File (Production)'}
                </span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>Note:</strong> In production, data is stored persistently. In development, data is stored in memory and will be lost when the server restarts.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
