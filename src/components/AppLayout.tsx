"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Calculator, 
  Settings, 
  User, 
  Menu, 
  X,
  FileText,
  Database,
  Package,
  ChevronDown,
  ChevronRight
} from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [calculationsExpanded, setCalculationsExpanded] = useState(true)
  const [componentsExpanded, setComponentsExpanded] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { 
      name: 'Calculations', 
      href: '/calculations', 
      icon: Calculator,
      children: [
        { name: 'All Calculations', href: '/calculations' },
        { name: 'New Calculation', href: '/calculations/new' },
        { name: 'Templates', href: '/calculations/templates' }
      ]
    },
    { 
      name: 'Components', 
      href: '/components', 
      icon: Database,
      children: [
        { name: 'Component Registry', href: '/components' },
        { name: 'Packages', href: '/packages' },
        { name: 'Import Components', href: '/components/import' }
      ]
    },
    { name: 'BOM Management', href: '/bom', icon: Package },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Admin', href: '/admin', icon: Database },
  ]

  const userNavigation = [
    { name: 'Profile', href: '/profile' },
    { name: 'Account Settings', href: '/account' },
    { name: 'Sign Out', href: '/auth/signout' }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:h-full flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">HVAC Pro</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <Button
                    variant="ghost"
                    className={`w-full justify-between ${
                      isActive(item.href) 
                        ? 'bg-green-50 text-green-700 border-r-2 border-green-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      if (item.name === 'Calculations') {
                        setCalculationsExpanded(!calculationsExpanded)
                      } else if (item.name === 'Components') {
                        setComponentsExpanded(!componentsExpanded)
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.name === 'Calculations' ? (
                      calculationsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : (
                      componentsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  {((item.name === 'Calculations' && calculationsExpanded) || 
                    (item.name === 'Components' && componentsExpanded)) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === child.href
                              ? 'bg-green-100 text-green-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User menu at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                John Doe
              </p>
              <p className="text-xs text-gray-500 truncate">
                john@hvacpro.com
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0 h-full overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 flex justify-center lg:justify-start">
              <h1 className="text-lg font-semibold text-gray-900">
                {pathname === '/' && 'Dashboard'}
                {pathname.startsWith('/calculations') && 'Calculations'}
                {pathname.startsWith('/components') && 'Components'}
                {pathname.startsWith('/packages') && 'Packages'}
                {pathname.startsWith('/bom') && 'BOM Management'}
                {pathname.startsWith('/reports') && 'Reports'}
                {pathname.startsWith('/settings') && 'Settings'}
                {pathname.startsWith('/admin') && 'Administration'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Package className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Calculator className="h-4 w-4 mr-2" />
                New Calculation
              </Button>
            </div>
          </div>
        </div>

        {/* Page content - scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
