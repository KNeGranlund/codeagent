import { repo } from "@/lib/database/repo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { use } from "react"

export default function ComponentsRegistry({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const params = use(searchParams)
  const items = repo.listComponents({ q: params.q, category: params.category })
  
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Component Registry</h1>
        <p className="text-gray-600">Browse and search available HVAC components</p>
      </div>
      
      <form className="flex gap-2 mb-6">
        <Input 
          name="q" 
          placeholder="Search components..." 
          defaultValue={params.q ?? ""} 
          className="flex-1"
        />
        <Input 
          name="category" 
          placeholder="Category filter..." 
          defaultValue={params.category ?? ""} 
          className="w-48"
        />
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Search
        </Button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-lg">{it.name}</div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {it.code}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">{it.description}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {it.category}
              </span>
              <span className="font-semibold text-green-600">
                ${it.basePrice.toFixed(2)}
              </span>
            </div>
            {it.laborTime && (
              <div className="text-xs text-gray-500 mt-2">
                Est. {it.laborTime}h labor
              </div>
            )}
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No components found matching your criteria.</p>
          <p className="text-sm mt-1">Try adjusting your search terms.</p>
        </div>
      )}
    </main>
  )
}
