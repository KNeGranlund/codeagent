"use client"

import React, { useState } from "react"
import { ChevronRight, ChevronDown, Plus, Package as PackageIcon, Wrench, Trash2, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CalculationItem } from "@/lib/types"

interface TreeNodeProps {
  item: CalculationItem
  level: number
  isSelected: boolean
  position: number[]
  onAddChild: (parentId: string, position: number[]) => void
  onAddPackage: (parentId: string, position: number[]) => void
  onDelete: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onUpdatePrice: (itemId: string, price: number) => void
  onSelect: (itemId: string, position: number[]) => void
}

function TreeNode({ 
  item, 
  level, 
  isSelected,
  position,
  onAddChild, 
  onAddPackage, 
  onDelete, 
  onUpdateQuantity, 
  onUpdatePrice,
  onSelect
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editQty, setEditQty] = useState(item.quantity)
  const [editPrice, setEditPrice] = useState(item.unitPrice)
  
  const hasChildren = item.children && item.children.length > 0
  const materialCost = item.quantity * item.unitPrice
  const laborCost = (item.laborHours || 0) * (item.laborRate || 0) * item.quantity
  const totalPrice = materialCost + laborCost
  const indentWidth = level * 20

  const handleSave = () => {
    onUpdateQuantity(item.id, editQty)
    onUpdatePrice(item.id, editPrice)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditQty(item.quantity)
    setEditPrice(item.unitPrice)
    setIsEditing(false)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'equipment': 'bg-blue-50 border-blue-200',
      'ductwork': 'bg-gray-50 border-gray-200',
      'controls': 'bg-purple-50 border-purple-200',
      'labor': 'bg-green-50 border-green-200',
      'materials': 'bg-yellow-50 border-yellow-200',
      'accessories': 'bg-pink-50 border-pink-200',
      'custom': 'bg-orange-50 border-orange-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-50 border-gray-200'
  }

  const positionString = position.join('.')

  return (
    <div className={`border-b border-gray-100 ${isSelected ? 'bg-green-50 border-green-300' : ''}`}>
      <div 
        className={`flex items-center py-3 px-3 hover:bg-gray-50 cursor-pointer transition-colors ${
          isSelected ? 'bg-green-100 hover:bg-green-100' : ''
        }`}
        style={{ paddingLeft: `${indentWidth + 12}px` }}
        onClick={() => onSelect(item.id, position)}
      >
        {/* Position Indicator */}
        <div className="flex items-center gap-2 mr-3">
          <span className="text-xs text-gray-500 min-w-[40px] font-mono">
            {positionString}
          </span>
          {isSelected && (
            <Target className="h-4 w-4 text-green-600" />
          )}
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 mr-2"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </Button>

        {/* Item Info */}
        <div className="flex-1 grid grid-cols-12 gap-2 items-center">
          <div className="col-span-4">
            <div className="font-medium text-sm">{item.name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              {item.code && `${item.code} • `}
              <span className={`px-2 py-0.5 rounded text-xs border ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              {item.laborHours && ` • ${item.laborHours}h labor`}
            </div>
          </div>
          
          <div className="col-span-2">
            {isEditing ? (
              <input
                type="number"
                value={editQty}
                onChange={(e) => setEditQty(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                step="0.1"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm">{item.quantity}</span>
            )}
          </div>
          
          <div className="col-span-2">
            {isEditing ? (
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                step="0.01"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm">${item.unitPrice.toFixed(2)}</span>
            )}
          </div>
          
          <div className="col-span-2">
            <div className="text-sm font-medium text-green-700">${totalPrice.toFixed(2)}</div>
            {(materialCost !== totalPrice) && (
              <div className="text-xs text-gray-500">
                ${materialCost.toFixed(2)} + ${laborCost.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="col-span-2 flex items-center gap-1">
            {isEditing ? (
              <>
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleSave() }} 
                  size="sm" 
                  className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
                >
                  Save
                </Button>
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleCancel() }} 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-green-100"
                >
                  Edit
                </Button>
                <Button
                  onClick={(e) => { e.stopPropagation(); onAddChild(item.id, position) }}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-green-100"
                  title="Add Item"
                >
                  <Plus className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  onClick={(e) => { e.stopPropagation(); onAddPackage(item.id, position) }}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-green-100"
                  title="Add Package"
                >
                  <PackageIcon className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {item.children!.map((child, index) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              isSelected={false} // Will be managed by parent
              position={[...position, index + 1]}
              onAddChild={onAddChild}
              onAddPackage={onAddPackage}
              onDelete={onDelete}
              onUpdateQuantity={onUpdateQuantity}
              onUpdatePrice={onUpdatePrice}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CalculationTreeProps {
  items: CalculationItem[]
  selectedItemId?: string
  onAddChild: (parentId: string, position: number[]) => void
  onAddPackage: (parentId: string, position: number[]) => void
  onDelete: (itemId: string) => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onUpdatePrice: (itemId: string, price: number) => void
  onSelectItem?: (itemId: string, position: number[]) => void
}

export function CalculationTree({ 
  items, 
  selectedItemId,
  onAddChild, 
  onAddPackage, 
  onDelete, 
  onUpdateQuantity, 
  onUpdatePrice,
  onSelectItem
}: CalculationTreeProps) {
  const handleSelect = (itemId: string, position: number[]) => {
    if (onSelectItem) {
      onSelectItem(itemId, position)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-green-50 px-3 py-3 border-b border-green-200">
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-green-800">
          <div className="col-span-4 pl-16">Item</div>
          <div className="col-span-2">Quantity</div>
          <div className="col-span-2">Unit Price</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>
      
      {/* Tree Content */}
      <div className="max-h-96 overflow-y-auto bg-white">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <Target className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No items yet</h3>
            <p className="text-sm">Add your first item or package to get started</p>
          </div>
        ) : (
          items.map((item, index) => (
            <TreeNode
              key={item.id}
              item={item}
              level={0}
              isSelected={selectedItemId === item.id}
              position={[index + 1]}
              onAddChild={onAddChild}
              onAddPackage={onAddPackage}
              onDelete={onDelete}
              onUpdateQuantity={onUpdateQuantity}
              onUpdatePrice={onUpdatePrice}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}
