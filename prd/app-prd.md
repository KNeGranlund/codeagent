# HVAC Cost Calculation App - Product Requirements Document

## 1. Product Overview

### 1.1 Product Name
HVAC Calculator Pro

### 1.2 Product Vision
A comprehensive web-based HVAC cost calculation application that enables HVAC professionals to create detailed, accurate project estimates with component databases, custom items, and profit margin calculations.

### 1.3 Target Users
- HVAC contractors and installers
- HVAC system designers
- Construction project managers
- Building facility managers

## 2. Technical Architecture

### 2.1 Technology Stack
- **Frontend**: Next.js 14+ with TypeScript
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Database**: In-memory database (initial phase) - SQLite with better-sqlite3
- **State Management**: Zustand or React Context
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Vercel (recommended for Next.js)

### 2.2 Project Structure
```
src/
├── app/
│   ├── calculations/
│   ├── components/
│   ├── registry/
│   └── api/
├── components/
│   ├── ui/ (shadcn components)
│   ├── forms/
│   ├── tables/
│   └── modals/
├── lib/
│   ├── database/
│   ├── utils/
│   └── types/
└── stores/
```

## 3. Core Features

### 3.1 Calculation Management
- **Create New Calculation**: Initialize new HVAC project calculations
- **Save/Load Calculations**: Persist calculations in database
- **Duplicate Calculations**: Copy existing calculations as templates
- **Export Calculations**: PDF/Excel export functionality
- **Calculation History**: Track calculation versions and changes

### 3.2 Item Management System

#### 3.2.1 Component Registry
- **Pre-built Component Database**: 
  - Air handling units (AHUs)
  - Ductwork components
  - Ventilation equipment
  - Control systems
  - Filters and accessories
- **Search and Filter**: Find components by category, manufacturer, model
- **Component Details**: Specifications, pricing, installation time
- **Bulk Import**: CSV/Excel import for component catalogs

#### 3.2.2 Custom Item Creation
- **Manual Item Entry**: Create custom line items
- **Item Categories**: Organize items by type (equipment, labor, materials)
- **Item Codes**: Unique identifiers for inventory tracking
- **Custom Pricing**: Set custom prices per item
- **Labor Time Estimates**: Associated installation time

#### 3.2.3 Package System
- **Predefined Packages**: Bundle commonly used items together
- **Custom Package Creation**: Build project-specific packages
- **Package Templates**: Save and reuse successful configurations
- **Nested Packages**: Packages within packages for complex systems

### 3.3 Tree Structure Calculation

#### 3.3.1 Hierarchical Organization
- **Project Level**: Top-level project container
- **System Level**: HVAC systems (heating, cooling, ventilation)
- **Component Level**: Individual components and assemblies
- **Sub-component Level**: Detailed parts and accessories
- **Drag & Drop**: Reorganize items within tree structure

#### 3.3.2 Calculation Logic
- **Quantity Management**: Set quantities at any level
- **Unit Pricing**: Price per unit for each item
- **Extended Pricing**: Automatic quantity × unit price calculations
- **Labor Calculations**: Separate labor cost calculations
- **Material Markups**: Apply markups to material costs

### 3.4 Financial Management

#### 3.4.1 Profit Margin System
- **Global Profit Margin**: Apply percentage to entire calculation
- **Category-specific Margins**: Different margins for materials vs. labor
- **Item-level Margins**: Override margins for specific items
- **Margin Templates**: Save common margin configurations

#### 3.4.2 External Pricing Integration
- **Vendor Price Lists**: Import and maintain vendor pricing
- **Real-time Price Updates**: API integration for dynamic pricing
- **Price Comparison**: Compare prices across vendors
- **Historical Pricing**: Track price changes over time

#### 3.4.3 Cost Breakdown
- **Material Costs**: Raw material and component costs
- **Labor Costs**: Installation and service labor
- **Overhead Allocation**: General business overhead costs
- **Profit Calculation**: Clear profit display and adjustment
- **Tax Calculations**: Support for various tax rates and types

## 4. User Interface Requirements

### 4.1 Layout and Navigation
- **Responsive Design**: Mobile and desktop compatibility
- **Main Navigation**: Clean, intuitive menu structure
- **Breadcrumb Navigation**: Clear location within calculation hierarchy
- **Quick Actions**: Commonly used actions easily accessible

### 4.2 Calculation Workspace
- **Split-pane Layout**: Tree view on left, details on right
- **Expandable Tree**: Collapsible sections for large calculations
- **Real-time Updates**: Live calculation updates as items change
- **Summary Panel**: Always-visible cost totals and margins

### 4.3 shadcn/ui Components Usage
- **Data Tables**: For component listings and calculation views
- **Forms**: All input forms using shadcn form components
- **Dialogs**: Modal dialogs for item creation and editing
- **Select/Combobox**: Dropdown selections for categories and items
- **Sheets**: Side panels for detailed item information
- **Toast Notifications**: Success/error feedback
- **Tabs**: Organize different calculation views
- **Accordion**: Collapsible sections in forms and lists

## 5. Data Models

### 5.1 Core Entities

#### 5.1.1 Calculation
```typescript
interface Calculation {
  id: string
  name: string
  description?: string
  projectCode?: string
  customerInfo: CustomerInfo
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'review' | 'approved' | 'archived'
  items: CalculationItem[]
  settings: CalculationSettings
  totals: CalculationTotals
}
```

#### 5.1.2 Calculation Item
```typescript
interface CalculationItem {
  id: string
  parentId?: string
  code?: string
  name: string
  description?: string
  category: ItemCategory
  quantity: number
  unitPrice: number
  laborHours?: number
  laborRate?: number
  markup?: number
  customFields?: Record<string, any>
  children?: CalculationItem[]
}
```

#### 5.1.3 Component Registry Item
```typescript
interface ComponentItem {
  id: string
  code: string
  name: string
  description: string
  category: ItemCategory
  manufacturer?: string
  model?: string
  specifications: Record<string, any>
  basePrice: number
  laborTime?: number
  vendors: VendorPricing[]
  tags: string[]
}
```

#### 5.1.4 Package
```typescript
interface Package {
  id: string
  name: string
  description: string
  category: string
  items: PackageItem[]
  defaultMarkup?: number
  isTemplate: boolean
}
```

### 5.2 Supporting Types
```typescript
type ItemCategory = 
  | 'equipment'
  | 'ductwork'
  | 'controls'
  | 'labor'
  | 'materials'
  | 'accessories'
  | 'custom'

interface CalculationSettings {
  globalMarkup: number
  categoryMarkups: Record<ItemCategory, number>
  taxRate: number
  laborRate: number
  overhead: number
}
```

## 6. Feature Specifications

### 6.1 Calculation Builder
- **Add Items**: Multiple ways to add items (search, browse, manual)
- **Quantity Adjustment**: Easy quantity modification with recalculation
- **Price Override**: Ability to override default pricing
- **Notes and Comments**: Add notes to items and calculations
- **Copy/Paste Items**: Duplicate items within or between calculations

### 6.2 Component Database Management
- **Search Functionality**: Full-text search across all component fields
- **Advanced Filtering**: Filter by category, manufacturer, price range
- **Favorites System**: Mark frequently used items as favorites
- **Recently Used**: Quick access to recently added items
- **Custom Fields**: Add project-specific fields to items

### 6.3 Pricing and Margins
- **Margin Calculator**: Visual margin calculation tools
- **What-if Analysis**: Test different margin scenarios
- **Competitive Analysis**: Compare calculated prices with competitors
- **Break-even Analysis**: Calculate minimum margins for profitability

### 6.4 Reporting and Export
- **Detailed Reports**: Comprehensive calculation breakdowns
- **Summary Reports**: High-level cost summaries
- **Client Proposals**: Clean, professional client-facing documents
- **Internal Estimates**: Detailed internal cost breakdowns
- **Excel Export**: Full calculation export to Excel
- **PDF Generation**: Professional PDF reports

## 7. User Workflows

### 7.1 Create New Calculation Workflow
1. User clicks "New Calculation"
2. Enters basic project information
3. Selects calculation template (optional)
4. Begins adding items to calculation tree
5. Adjusts quantities and pricing
6. Applies margins and markups
7. Reviews totals and exports/saves

### 7.2 Add Items Workflow
1. **From Registry**: Browse/search component database → select item → set quantity → add to calculation
2. **From Package**: Select package → customize if needed → add all items to calculation
3. **Manual Entry**: Click "Add Custom Item" → enter details → save to calculation
4. **Bulk Import**: Upload CSV/Excel → map columns → import items

### 7.3 Package Creation Workflow
1. User selects "Create Package"
2. Names and describes package
3. Adds items from registry or creates custom items
4. Sets default quantities and relationships
5. Saves as template for future use

## 8. Non-Functional Requirements

### 8.1 Performance
- **Load Time**: Initial page load under 2 seconds
- **Calculation Speed**: Real-time updates under 100ms
- **Large Calculations**: Support 1000+ line items
- **Responsive**: Smooth interactions on mobile devices

### 8.2 Usability
- **Learning Curve**: New users productive within 30 minutes
- **Keyboard Shortcuts**: Power user keyboard navigation
- **Undo/Redo**: Full undo/redo support for all actions
- **Auto-save**: Automatic calculation saving every 30 seconds

### 8.3 Data Management
- **Data Persistence**: Reliable in-memory storage with backup
- **Import/Export**: Standard file format support
- **Backup**: Automated daily calculation backups
- **Migration Path**: Clear path to external database when needed

## 9. Phase 1 MVP Scope

### 9.1 Core MVP Features
- [x] Basic calculation creation and management
- [x] Simple tree structure for items
- [x] Manual item entry with codes
- [x] Basic component registry (50+ common items)
- [x] Quantity and pricing calculations
- [x] Global profit margin application
- [x] PDF export of calculations
- [x] In-memory data storage

### 9.2 Essential UI Components
- [x] Calculation list view
- [x] Tree-based calculation builder
- [x] Item addition modal
- [x] Basic settings panel
- [x] Summary totals display
- [x] Export functionality

### 9.3 Future Phases
- **Phase 2**: Package system, advanced search, vendor pricing
- **Phase 3**: External database, user authentication, collaboration
- **Phase 4**: API integrations, mobile app, advanced reporting

## 10. Success Metrics

### 10.1 User Adoption
- User registration and activation rates
- Daily/monthly active users
- Calculation creation frequency
- Feature usage analytics

### 10.2 Business Value
- Time saved in estimate creation
- Accuracy of cost calculations
- User satisfaction scores
- Customer retention rates

## 11. Risk Assessment

### 11.1 Technical Risks
- **In-memory Database Limitations**: Data loss risk, scalability concerns
- **Complex UI State**: Managing tree structure state complexity
- **Performance**: Large calculation performance impact

### 11.2 User Adoption Risks
- **Learning Curve**: Users abandoning due to complexity
- **Data Migration**: Resistance to changing existing workflows
- **Accuracy Concerns**: Trust in automated calculations

### 11.3 Mitigation Strategies
- Comprehensive testing of calculation logic
- Progressive feature rollout
- Extensive user documentation and training
- Regular user feedback collection and iteration

---

This PRD provides a comprehensive foundation for building a professional HVAC cost calculation application with modern web technologies and a focus on user experience.