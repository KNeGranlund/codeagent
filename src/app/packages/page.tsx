import { repo } from "@/lib/database/repo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { use } from "react"

export default function PackagesRegistry({ searchParams }: { searchParams: Promise<{ q?: string, category?: string, includeFree?: string }> }) {
  const params = use(searchParams)
  const includeFree = params.includeFree !== 'false' // Default to true
  const packages = repo.listPackages({ 
    q: params.q, 
    category: params.category,
    includeFree 
  })
  
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Package Registry</h1>
        <p className="text-gray-600">Pre-configured packages and solution bundles</p>
      </div>
      
      <form className="flex gap-2 mb-6">
        <Input 
          name="q" 
          placeholder="Search packages..." 
          defaultValue={params.q ?? ""} 
          className="flex-1"
        />
        <Input 
          name="category" 
          placeholder="Category filter..." 
          defaultValue={params.category ?? ""} 
          className="w-48"
        />
        <select 
          name="includeFree" 
          defaultValue={params.includeFree ?? 'true'}
          className="px-3 py-2 border border-gray-300 bg-white text-sm rounded-md"
        >
          <option value="true">All Packages</option>
          <option value="false">Paid Only</option>
        </select>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Search
        </Button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                {pkg.isFree && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    FREE
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {pkg.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="outline">
                    {pkg.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span>{pkg.items.length} component(s)</span>
                </div>
                {pkg.basePrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium text-green-600">${pkg.basePrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600 mb-1">Package contents:</div>
                  <div className="space-y-1">
                    {pkg.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-xs flex justify-between">
                        <span>{item.customItem?.name || 'Package Item'}</span>
                        <span className="text-gray-500">×{item.quantity}</span>
                      </div>
                    ))}
                    {pkg.items.length > 3 && (
                      <div className="text-xs text-gray-500">
                        ... and {pkg.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {packages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No packages found matching your criteria.</p>
          <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </main>
  )
}
