"use client"

import React, { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Percent, DollarSign } from "lucide-react"
import type { CalculationSettings } from "@/lib/types"

interface CalculationSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: CalculationSettings
  onUpdateSettings: (settings: CalculationSettings) => void
}

export function CalculationSettingsDialog({ 
  open, 
  onOpenChange, 
  settings, 
  onUpdateSettings 
}: CalculationSettingsDialogProps) {
  const [formData, setFormData] = useState<CalculationSettings>(settings)
  
  // Separate state for input display values to allow proper editing
  const [inputValues, setInputValues] = useState({
    globalMarkup: '',
    taxRate: '',
    overhead: '',
    laborRate: ''
  })

  // Update form data when settings prop changes
  useEffect(() => {
    setFormData(settings)
    setInputValues({
      globalMarkup: (settings.globalMarkup * 100).toString(),
      taxRate: (settings.taxRate * 100).toString(),
      overhead: settings.overhead.toString(),
      laborRate: settings.laborRate.toString()
    })
  }, [settings])

  const handleSubmit = () => {
    onUpdateSettings(formData)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData(settings) // Reset to original values
    setInputValues({
      globalMarkup: (settings.globalMarkup * 100).toString(),
      taxRate: (settings.taxRate * 100).toString(),
      overhead: settings.overhead.toString(),
      laborRate: settings.laborRate.toString()
    })
    onOpenChange(false)
  }

  const updateField = (field: keyof CalculationSettings, inputValue: string, divisor: number = 1) => {
    // Update display value immediately
    const inputKey = field as keyof typeof inputValues
    setInputValues(prev => ({
      ...prev,
      [inputKey]: inputValue
    }))
    
    // Update actual data only if valid number
    const numericValue = parseFloat(inputValue)
    if (!isNaN(numericValue) && numericValue >= 0) {
      setFormData(prev => ({
        ...prev,
        [field]: numericValue / divisor
      }))
    } else if (inputValue === '' || inputValue === '.') {
      // Allow empty or partial decimal input, but keep previous valid value in formData
      // This allows users to clear the field or type decimals without losing data
      return
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Calculation Settings
          </DialogTitle>
          <DialogDescription>
            Configure profit margins, tax rates, overhead, and other calculation parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profit Margin */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Percent className="h-4 w-4 text-green-600" />
              Profit Margin (%)
            </label>
            <Input
              type="number"
              value={inputValues.globalMarkup}
              onChange={(e) => updateField('globalMarkup', e.target.value, 100)}
              min="0"
              max="100"
              step="0.1"
              placeholder="10.0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Applied to material and labor subtotals
            </p>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              Tax Rate (%)
            </label>
            <Input
              type="number"
              value={inputValues.taxRate}
              onChange={(e) => updateField('taxRate', e.target.value, 100)}
              min="0"
              max="50"
              step="0.01"
              placeholder="7.50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Applied to material subtotal plus profit
            </p>
          </div>

          {/* Overhead */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              Overhead ($)
            </label>
            <Input
              type="number"
              value={inputValues.overhead}
              onChange={(e) => updateField('overhead', e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fixed overhead amount added to total
            </p>
          </div>

          {/* Labor Rate */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              Default Labor Rate ($/hour)
            </label>
            <Input
              type="number"
              value={inputValues.laborRate}
              onChange={(e) => updateField('laborRate', e.target.value)}
              min="0"
              step="0.01"
              placeholder="85.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default hourly rate for labor calculations
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            Update Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}