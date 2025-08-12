"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Save, FileText, Search, Download } from "lucide-react"
import { CalculationTree } from "@/components/CalculationTree"
import { AddItemDialog } from "@/components/AddItemDialog"
import { SearchDialog } from "@/components/SearchDialog"
import type { Calculation, CalculationItem, ComponentItem, Package } from "@/lib/types"
import { computeTotals } from "@/lib/utils/calc"
import { downloadCalculationPDF } from "@/lib/utils/pdf-export"
import { downloadCalculationExcel } from "@/lib/utils/excel-export"

// Browser-compatible UUID generation
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

interface CalculationDetailClientProps {
  initialCalc: Calculation
}

export default function CalculationDetailClient({ initialCalc }: CalculationDetailClientProps) {
  const [calc, setCalc] = useState<Calculation>(initialCalc)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [addDialogParentId, setAddDialogParentId] = useState<string | undefined>()
  const [selectedItemId, setSelectedItemId] = useState<string>()
  const [selectedPosition, setSelectedPosition] = useState<number[]>()
  const [isSaving, setIsSaving] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const totals = computeTotals(calc)

  const saveCalculation = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/calculations/${calc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calc)
      })
      if (!response.ok) throw new Error('Failed to save')
    } catch (error) {
      console.error('Failed to save calculation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addItem = (itemData: Omit<CalculationItem, 'id'>) => {
    const newItem: CalculationItem = {
      ...itemData,
      id: generateId()
    }

    setCalc(prev => {
      const updated = { ...prev }
      
      if (!itemData.parentId) {
        // Add to root level
        updated.items = [...updated.items, newItem]
      } else {
        // Add as child - find parent and add to children
        const addToParent = (items: CalculationItem[]): CalculationItem[] => {
          return items.map(item => {
            if (item.id === itemData.parentId) {
              return {
                ...item,
                children: [...(item.children || []), newItem]
              }
            }
            if (item.children) {
              return {
                ...item,
                children: addToParent(item.children)
              }
            }
            return item
          })
        }
        updated.items = addToParent(updated.items)
      }
      
      return updated
    })
  }

  const addItemFromSearch = (itemData: Omit<CalculationItem, 'id'>) => {
    // If an item is selected, add as child to that item
    if (selectedItemId) {
      addItem({ ...itemData, parentId: selectedItemId })
    } else {
      // Add to root level
      addItem(itemData)
    }
  }

  const handleSearchComponentSelect = (component: ComponentItem) => {
    const item: Omit<CalculationItem, 'id'> = {
      parentId: selectedItemId,
      name: component.name,
      code: component.code,
      description: component.description,
      category: component.category,
      quantity: 1,
      unitPrice: component.basePrice,
      laborHours: component.laborTime,
      laborRate: 85,
    }
    addItemFromSearch(item)
    setShowSearchDialog(false)
  }

  const handleSearchPackageSelect = (pkg: Package) => {
    // Create a parent item for the package
    const packageItem: Omit<CalculationItem, 'id'> = {
      parentId: selectedItemId,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category as any,
      quantity: 1,
      unitPrice: pkg.basePrice || 0,
      children: []
    }
    
    // Convert package items to calculation items
    const children: Omit<CalculationItem, 'id' | 'parentId'>[] = pkg.items.map(pkgItem => {
      if (pkgItem.customItem) {
        return {
          ...pkgItem.customItem,
          quantity: pkgItem.quantity * pkgItem.customItem.quantity,
          unitPrice: pkgItem.overridePrice || pkgItem.customItem.unitPrice
        }
      } else {
        return {
          name: `Package Item ${pkgItem.quantity}`,
          category: 'custom' as any,
          quantity: pkgItem.quantity,
          unitPrice: pkgItem.overridePrice || 0
        }
      }
    })
    
    packageItem.children = children as CalculationItem[]
    addItemFromSearch(packageItem)
    setShowSearchDialog(false)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setCalc(prev => {
      const updateInTree = (items: CalculationItem[]): CalculationItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, quantity }
          }
          if (item.children) {
            return { ...item, children: updateInTree(item.children) }
          }
          return item
        })
      }
      return { ...prev, items: updateInTree(prev.items) }
    })
  }

  const updatePrice = (itemId: string, unitPrice: number) => {
    setCalc(prev => {
      const updateInTree = (items: CalculationItem[]): CalculationItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            return { ...item, unitPrice }
          }
          if (item.children) {
            return { ...item, children: updateInTree(item.children) }
          }
          return item
        })
      }
      return { ...prev, items: updateInTree(prev.items) }
    })
  }

  const deleteItem = (itemId: string) => {
    setCalc(prev => {
      const removeFromTree = (items: CalculationItem[]): CalculationItem[] => {
        return items
          .filter(item => item.id !== itemId)
          .map(item => ({
            ...item,
            children: item.children ? removeFromTree(item.children) : undefined
          }))
      }
      return { ...prev, items: removeFromTree(prev.items) }
    })
    
    // Clear selection if deleted item was selected
    if (selectedItemId === itemId) {
      setSelectedItemId(undefined)
      setSelectedPosition(undefined)
    }
  }

  const handleAddChild = (parentId: string, position: number[]) => {
    setAddDialogParentId(parentId)
    setShowAddDialog(true)
  }

  const handleAddPackage = (parentId: string, position: number[]) => {
    setAddDialogParentId(parentId)
    setShowAddDialog(true)
  }

  const handleAddRootItem = () => {
    setAddDialogParentId(undefined)
    setShowAddDialog(true)
  }

  const handleSelectItem = (itemId: string, position: number[]) => {
    setSelectedItemId(itemId)
    setSelectedPosition(position)
  }

  const handleExportPDF = () => {
    downloadCalculationPDF(calc)
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    downloadCalculationExcel(calc)
    setShowExportMenu(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{calc.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>{calc.projectCode || "No project code"}</span>
            <span>•</span>
            <span className="capitalize">{calc.status}</span>
            <span>•</span>
            <span>Updated {new Date(calc.updatedAt).toLocaleDateString()}</span>
            {selectedPosition && (
              <>
                <span>•</span>
                <span className="text-green-600 font-medium">
                  Position: {selectedPosition.join('.')}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSearchDialog(true)} 
            variant="outline"
            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <Search className="h-4 w-4" />
            Quick Search
          </Button>
          <Button 
            onClick={handleAddRootItem} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <Button 
            onClick={saveCalculation} 
            disabled={isSaving}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                <div className="py-1">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selection Info */}
      {selectedItemId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900">Selected Position: {selectedPosition?.join('.')}</h3>
              <p className="text-sm text-green-700">
                New items will be added as children to this position
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedItemId(undefined)
                setSelectedPosition(undefined)
              }}
              variant="outline"
              size="sm"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Customer Info */}
      {calc.customerInfo.name && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Customer Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span> {calc.customerInfo.name}
            </div>
            {calc.customerInfo.company && (
              <div>
                <span className="text-gray-600">Company:</span> {calc.customerInfo.company}
              </div>
            )}
            {calc.customerInfo.email && (
              <div>
                <span className="text-gray-600">Email:</span> {calc.customerInfo.email}
              </div>
            )}
            {calc.customerInfo.phone && (
              <div>
                <span className="text-gray-600">Phone:</span> {calc.customerInfo.phone}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calculation Tree */}
      <div className="bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Items & Components</h2>
        <CalculationTree
          items={calc.items}
          selectedItemId={selectedItemId}
          onAddChild={handleAddChild}
          onAddPackage={handleAddPackage}
          onDelete={deleteItem}
          onUpdateQuantity={updateQuantity}
          onUpdatePrice={updatePrice}
          onSelectItem={handleSelectItem}
        />
      </div>

      {/* Totals Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-900">Cost Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-green-700">Material Subtotal:</span>
            <span className="font-medium text-green-900">${totals.materialSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Labor Subtotal:</span>
            <span className="font-medium text-green-900">${totals.laborSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Overhead:</span>
            <span className="font-medium text-green-900">${totals.overhead.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Profit ({(calc.settings.globalMarkup * 100).toFixed(1)}%):</span>
            <span className="font-medium text-green-900">${totals.profit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Tax ({(calc.settings.taxRate * 100).toFixed(2)}%):</span>
            <span className="font-medium text-green-900">${totals.tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-green-300 pt-3 flex justify-between text-lg">
            <span className="font-semibold text-green-900">Grand Total:</span>
            <span className="font-bold text-green-900">${totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddItem={addItem}
        parentId={addDialogParentId}
      />

      {/* Search Dialog */}
      <SearchDialog
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        onSelectComponent={handleSearchComponentSelect}
        onSelectPackage={handleSearchPackageSelect}
      />
    </div>
  )
}
