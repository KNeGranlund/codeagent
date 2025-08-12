import Link from "next/link"
import { redirect } from "next/navigation"
import { repo } from "@/lib/database/repo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calculator, Clock, DollarSign } from "lucide-react"

async function createCalculationAction(_formData: FormData) {
  "use server"
  const calc = repo.createCalculation({})
  redirect(`/calculations/${calc.id}`)
}

export default function CalculationsPage() {
  const calcs = repo.listCalculations()
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calculations</h1>
          <p className="text-gray-600 mt-1">Manage your HVAC project estimates</p>
        </div>
        <form action={createCalculationAction}>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Calculation
          </Button>
        </form>
      </div>

      {calcs.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>No calculations yet</CardTitle>
            <CardDescription>
              Get started by creating your first HVAC calculation
            </CardDescription>
            <form action={createCalculationAction} className="mt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Calculation
              </Button>
            </form>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calcs.map((calc) => (
            <Card key={calc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{calc.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {calc.projectCode || "No project code"}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    calc.status === 'draft' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : calc.status === 'review'
                      ? 'bg-blue-100 text-blue-800'
                      : calc.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {calc.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Updated {new Date(calc.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calculator className="h-4 w-4" />
                    {calc.items.length} items
                  </div>
                  {calc.customerInfo.name && (
                    <div className="text-sm text-gray-600">
                      <strong>Customer:</strong> {calc.customerInfo.name}
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <Link href={`/calculations/${calc.id}`}>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Open Calculation
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
