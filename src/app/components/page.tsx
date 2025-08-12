import { repo } from "@/lib/database/repo"
import { Input } from "@/components/ui/input"
import { use } from "react"

export default function ComponentsRegistry({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const params = use(searchParams)
  const items = repo.listComponents({ q: params.q, category: params.category })
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Component Registry</h1>
      <form className="flex gap-2 mb-4">
        <Input name="q" placeholder="Search components" defaultValue={params.q ?? ""} />
        <Input name="category" placeholder="Category (optional)" defaultValue={params.category ?? ""} />
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((it) => (
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
    </main>
  )
}
