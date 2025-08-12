import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Database, FileText, TrendingUp, Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome to HVAC Calculator Pro</h1>
        <p className="text-gray-600 mb-6 max-w-2xl">
          Create professional HVAC estimates with our comprehensive component database, 
          custom item builder, and intelligent margin calculations.
        </p>
        <div className="flex gap-4">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Calculation
          </Button>
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Browse Components
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calculations</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">In registry</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,230</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-xs text-muted-foreground">Target: 20%</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
          <CardDescription>Your latest project estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <h3 className="font-medium">Office Building HVAC - Phase 1</h3>
                <p className="text-sm text-gray-600">Project #2024-001 • Updated 2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$28,450.00</p>
                <p className="text-sm text-green-600">Draft</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <h3 className="font-medium">Warehouse Ventilation System</h3>
                <p className="text-sm text-gray-600">Project #2024-002 • Updated 1 day ago</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$15,200.00</p>
                <p className="text-sm text-blue-600">Review</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <h3 className="font-medium">Restaurant Kitchen Exhaust</h3>
                <p className="text-sm text-gray-600">Project #2024-003 • Updated 3 days ago</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$12,750.00</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href="/calculations">
              <Button variant="outline" className="w-full">
                View All Calculations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              Create Calculation
            </CardTitle>
            <CardDescription>
              Start a new HVAC project estimate with our guided builder
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Browse Components
            </CardTitle>
            <CardDescription>
              Explore our database of HVAC components and packages
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Generate Report
            </CardTitle>
            <CardDescription>
              Create professional reports and client proposals
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
