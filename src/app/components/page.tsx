"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ComponentItem, ItemCategory } from "@/lib/types"

export default function ComponentsRegistry() {
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)

  const categories: ItemCategory[] = [
    'equipment', 'ductwork', 'controls', 'labor', 'materials', 'accessories', 'custom'
  ]

  const loadComponents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
      
      const response = await fetch(`/api/components?${params}`)
      const data = await response.json()
      setComponents(data)
    } catch (error) {
      console.error('Failed to load components:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load components on mount and when search parameters change
  useEffect(() => {
    loadComponents()
  }, [searchQuery, selectedCategory])

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Component Registry</h1>
      <div className="flex gap-2 mb-4">
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search components" 
          className="flex-1"
        />
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
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading components...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {components.map((it) => (
            <div key={it.id} className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-muted-foreground">{it.code}</div>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{it.category}</div>
              <div className="text-sm">Base ${it.basePrice.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && components.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No components found. Try adjusting your search criteria.</p>
        </div>
      )}
    </main>
  )
}
