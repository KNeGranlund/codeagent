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
import { Search, Package as PackageIcon, Wrench, Filter, Grid3X3, ChevronRight } from "lucide-react"
import type { ComponentItem, CalculationItem, ItemCategory, Package } from "@/lib/types"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectComponent: (component: ComponentItem) => void
  onSelectPackage: (pkg: Package) => void
}

export function SearchDialog({ open, onOpenChange, onSelectComponent, onSelectPackage }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [searchType, setSearchType] = useState<'all' | 'components' | 'packages'>('all')
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const categories: ItemCategory[] = [
    'equipment', 'ductwork', 'controls', 'labor', 'materials', 'accessories', 'custom'
  ]

  useEffect(() => {
    if (open) {
      performSearch()
    }
  }, [open, searchQuery, selectedCategory, searchType])

  const performSearch = async () => {
    setIsLoading(true)
    try {
      const promises = []
      
      if (searchType === 'all' || searchType === 'components') {
        const componentParams = new URLSearchParams()
        if (searchQuery) componentParams.set('q', searchQuery)
        if (selectedCategory && selectedCategory !== 'all') componentParams.set('category', selectedCategory)
        promises.push(fetch(`/api/components?${componentParams}`).then(r => r.json()))
      } else {
        promises.push(Promise.resolve([]))
      }

      if (searchType === 'all' || searchType === 'packages') {
        const packageParams = new URLSearchParams()
        if (searchQuery) packageParams.set('q', searchQuery)
        if (selectedCategory && selectedCategory !== 'all') packageParams.set('category', selectedCategory)
        packageParams.set('includeFree', 'true')
        promises.push(fetch(`/api/packages?${packageParams}`).then(r => r.json()))
      } else {
        promises.push(Promise.resolve([]))
      }

      const [componentData, packageData] = await Promise.all(promises)
      setComponents(componentData)
      setPackages(packageData)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSearchType('all')
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'equipment': 'bg-blue-100 text-blue-800',
      'ductwork': 'bg-gray-100 text-gray-800',
      'controls': 'bg-purple-100 text-purple-800',
      'labor': 'bg-green-100 text-green-800',
      'materials': 'bg-yellow-100 text-yellow-800',
      'accessories': 'bg-pink-100 text-pink-800',
      'custom': 'bg-orange-100 text-orange-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-green-600" />
            Component & Package Search
          </DialogTitle>
          <DialogDescription>
            Search through components and packages to add to your calculation
          </DialogDescription>
        </DialogHeader>

        {/* Search Controls */}
        <div className="flex flex-col gap-4 border-b pb-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, code, or description..."
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ItemCategory | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={searchType === 'all' ? 'default' : 'outline'}
              onClick={() => setSearchType('all')}
              size="sm"
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              All Results
            </Button>
            <Button
              variant={searchType === 'components' ? 'default' : 'outline'}
              onClick={() => setSearchType('components')}
              size="sm"
              className="flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              Components Only
            </Button>
            <Button
              variant={searchType === 'packages' ? 'default' : 'outline'}
              onClick={() => setSearchType('packages')}
              size="sm"
              className="flex items-center gap-2"
            >
              <PackageIcon className="h-4 w-4" />
              Packages Only
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Searching...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Packages Section */}
              {(searchType === 'all' || searchType === 'packages') && packages.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-green-600" />
                    Packages ({packages.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {packages.map(pkg => (
                      <div 
                        key={pkg.id} 
                        className="border rounded-lg p-4 hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
                        onClick={() => onSelectPackage(pkg)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm">{pkg.name}</div>
                          {pkg.isFree && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                              FREE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mb-3 line-clamp-2">{pkg.description}</div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(pkg.category)}`}>
                            {pkg.category} • {pkg.items.length} items
                          </span>
                          {pkg.basePrice && (
                            <span className="font-medium text-green-700">${pkg.basePrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Components Section */}
              {(searchType === 'all' || searchType === 'components') && components.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    Components ({components.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {components.map(component => (
                      <div 
                        key={component.id} 
                        className="border rounded-lg p-4 hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
                        onClick={() => onSelectComponent(component)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm">{component.name}</div>
                          <div className="text-xs text-gray-500">{component.code}</div>
                        </div>
                        <div className="text-xs text-gray-600 mb-3 line-clamp-2">{component.description}</div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(component.category)}`}>
                            {component.category}
                          </span>
                          <span className="font-medium text-green-700">${component.basePrice.toFixed(2)}</span>
                        </div>
                        {component.laborTime && (
                          <div className="text-xs text-gray-500">
                            Est. {component.laborTime}h labor
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* No Results */}
              {!isLoading && components.length === 0 && packages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
