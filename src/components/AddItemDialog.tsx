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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Package as PackageIcon, Wrench } from "lucide-react"
import type { ComponentItem, CalculationItem, ItemCategory, Package } from "@/lib/types"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddItem: (item: Omit<CalculationItem, 'id'>) => void
  parentId?: string
}

export function AddItemDialog({ open, onOpenChange, onAddItem, parentId }: AddItemDialogProps) {
  const [mode, setMode] = useState<'custom' | 'component' | 'package'>('custom')
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Custom item form
  const [customItem, setCustomItem] = useState({
    name: '',
    code: '',
    description: '',
    category: 'custom' as ItemCategory,
    quantity: 1,
    unitPrice: 0,
    laborHours: 0,
    laborRate: 85,
    isFree: false
  })

  const categories: ItemCategory[] = [
    'equipment', 'ductwork', 'controls', 'labor', 'materials', 'accessories', 'custom'
  ]

  // Load components when switching to component mode
  useEffect(() => {
    if (mode === 'component' && open) {
      loadComponents()
    } else if (mode === 'package' && open) {
      loadPackages()
    }
  }, [mode, open, searchQuery, selectedCategory])

  const loadComponents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCategory) params.set('category', selectedCategory)
      
      const response = await fetch(`/api/components?${params}`)
      const data = await response.json()
      setComponents(data)
    } catch (error) {
      console.error('Failed to load components:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPackages = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCategory) params.set('category', selectedCategory)
      params.set('includeFree', 'true') // Include both free and paid packages
      
      const response = await fetch(`/api/packages?${params}`)
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Failed to load packages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomItem = () => {
    const item: Omit<CalculationItem, 'id'> = {
      parentId,
      name: customItem.name,
      code: customItem.code || undefined,
      description: customItem.description || undefined,
      category: customItem.category,
      quantity: customItem.quantity,
      unitPrice: customItem.isFree ? 0 : customItem.unitPrice,
      laborHours: customItem.laborHours || undefined,
      laborRate: customItem.laborRate || undefined,
    }
    
    onAddItem(item)
    resetForm()
    onOpenChange(false)
  }

  const handleAddComponent = (component: ComponentItem) => {
    const item: Omit<CalculationItem, 'id'> = {
      parentId,
      name: component.name,
      code: component.code,
      description: component.description,
      category: component.category,
      quantity: 1,
      unitPrice: component.basePrice,
      laborHours: component.laborTime,
      laborRate: 85,
    }
    
    onAddItem(item)
    onOpenChange(false)
  }

  const handleAddPackage = (pkg: Package) => {
    // Create a parent item for the package
    const packageItem: Omit<CalculationItem, 'id'> = {
      parentId,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category as ItemCategory,
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
        // This would need to resolve component by ID - simplified for now
        return {
          name: `Package Item ${pkgItem.quantity}`,
          category: 'custom' as ItemCategory,
          quantity: pkgItem.quantity,
          unitPrice: pkgItem.overridePrice || 0
        }
      }
    })
    
    packageItem.children = children as CalculationItem[]
    onAddItem(packageItem)
    onOpenChange(false)
  }

  const resetForm = () => {
    setCustomItem({
      name: '',
      code: '',
      description: '',
      category: 'custom',
      quantity: 1,
      unitPrice: 0,
      laborHours: 0,
      laborRate: 85,
      isFree: false
    })
    setSearchQuery('')
    setSelectedCategory('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            Add a custom item, select from component registry, or add a package
          </DialogDescription>
        </DialogHeader>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'custom' ? 'default' : 'outline'}
            onClick={() => setMode('custom')}
            className={`flex items-center gap-2 ${mode === 'custom' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
          >
            <Wrench className="h-4 w-4" />
            Custom Item
          </Button>
          <Button
            variant={mode === 'component' ? 'default' : 'outline'}
            onClick={() => setMode('component')}
            className={`flex items-center gap-2 ${mode === 'component' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
          >
            <Search className="h-4 w-4" />
            From Registry
          </Button>
          <Button
            variant={mode === 'package' ? 'default' : 'outline'}
            onClick={() => setMode('package')}
            className={`flex items-center gap-2 ${mode === 'package' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
          >
            <PackageIcon className="h-4 w-4" />
            Package
          </Button>
        </div>

        {/* Custom Item Form */}
        {mode === 'custom' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Item Name *</label>
                <Input
                  value={customItem.name}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Item Code</label>
                <Input
                  value={customItem.code}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Optional item code"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                value={customItem.description}
                onChange={(e) => setCustomItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select 
                  value={customItem.category} 
                  onValueChange={(value: ItemCategory) => setCustomItem(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Input
                  type="number"
                  value={customItem.quantity}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Unit Price</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={customItem.unitPrice}
                    onChange={(e) => setCustomItem(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    min="0"
                    step="0.01"
                    disabled={customItem.isFree}
                  />
                  <label className="flex items-center mt-1 text-sm">
                    <input
                      type="checkbox"
                      checked={customItem.isFree}
                      onChange={(e) => setCustomItem(prev => ({ 
                        ...prev, 
                        isFree: e.target.checked,
                        unitPrice: e.target.checked ? 0 : prev.unitPrice
                      }))}
                      className="mr-1"
                    />
                    Free item
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Labor Hours</label>
                <Input
                  type="number"
                  value={customItem.laborHours}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, laborHours: Number(e.target.value) }))}
                  min="0"
                  step="0.1"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Labor Rate ($/hour)</label>
                <Input
                  type="number"
                  value={customItem.laborRate}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, laborRate: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddCustomItem}
                disabled={!customItem.name.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Item
              </Button>
            </div>
          </div>
        )}

        {/* Component Registry */}
        {mode === 'component' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components..."
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ItemCategory | '')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadComponents} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {components.map(component => (
                <div 
                  key={component.id} 
                  className="border rounded-lg p-4 hover:bg-green-50 cursor-pointer border-green-200"
                  onClick={() => handleAddComponent(component)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{component.name}</div>
                    <div className="text-sm text-gray-500">{component.code}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{component.description}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {component.category}
                    </span>
                    <span className="font-medium">${component.basePrice.toFixed(2)}</span>
                  </div>
                  {component.laborTime && (
                    <div className="text-xs text-gray-500 mt-1">
                      Est. {component.laborTime}h labor
                    </div>
                  )}
                </div>
              ))}
            </div>

            {components.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No components found. Try adjusting your search criteria.
              </div>
            )}
          </div>
        )}

        {/* Package Mode */}
        {mode === 'package' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search packages..."
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ItemCategory | '')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadPackages} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {packages.map(pkg => (
                <div 
                  key={pkg.id} 
                  className="border rounded-lg p-4 hover:bg-green-50 cursor-pointer border-green-200"
                  onClick={() => handleAddPackage(pkg)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{pkg.name}</div>
                    {pkg.isFree && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        FREE
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{pkg.description}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {pkg.category} • {pkg.items.length} items
                    </span>
                    {pkg.basePrice && (
                      <span className="font-medium">${pkg.basePrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {pkg.items.length} component(s) included
                  </div>
                </div>
              ))}
            </div>

            {packages.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No packages found. Try adjusting your search criteria.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
