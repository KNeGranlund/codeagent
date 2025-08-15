'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/ui/stepper';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, Wrench, Users, Clock, Download, Loader2, TrendingUp, DollarSign, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const API_BASE_URL = 'https://localhost:7276/api';

const steps = [
  { id: 'ebom', title: 'EBOM', description: 'Engineering Bill of Materials' },
  { id: 'mbom', title: 'MBOM', description: 'Manufacturing Bill of Materials' },
  { id: 'tasks', title: 'Tasks', description: 'Construction Tasks' },
  { id: 'resources', title: 'Resources', description: 'Workers & Equipment' },
  { id: 'tools', title: 'Tools', description: 'Required Tools' },
  { id: 'schedule', title: 'Schedule', description: 'Project Timeline' },
  { id: 'summary', title: 'Summary', description: 'Project Overview & Reports' },
];

interface BomItem {
  type: string;
  quantity: number;
  location: string;
}

interface MbomItem {
  material: string;
  quantity: number;
  unit: string;
  source: string;
}

interface Task {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  finishTime: number;
  workingArea: string;
  requiredResources: Record<string, number>;
  requiredTools: string[];
  materials: Record<string, number>;
  leadTime: number;
  dependencies: Task[];
}

interface ResourceInfo {
  name: string;
  availableCount: number;
  dailyCost: number;
  type: string;
}

interface ToolInfo {
  name: string;
  availableCount: number;
  category: string;
}

interface ScheduleResult {
  scheduleCsv: string;
  deliveryCsv: string;
  costCsv: string;
  tasks: Task[];
  projectStartDate: string;
  projectEndDate: string;
  totalProjectCost: number;
}

export default function BomPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepLoading, setStepLoading] = useState(false);
  const [ebomData, setEbomData] = useState<BomItem[]>([]);
  const [mbomData, setMbomData] = useState<MbomItem[]>([]);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [resourcesData, setResourcesData] = useState<ResourceInfo[]>([]);
  const [toolsData, setToolsData] = useState<ToolInfo[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      setError(`Failed to fetch data from ${endpoint}`);
      return null;
    }
  };

  const loadEbomData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchData('/Ebom');
    if (data) setEbomData(data);
    setLoading(false);
  };

  const loadMbomData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchData('/Mbom');
    if (data) setMbomData(data);
    setLoading(false);
  };

  const loadTasksData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchData('/Tasks');
    if (data) setTasksData(data);
    setLoading(false);
  };

  const loadResourcesData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchData('/Resources');
    if (data) setResourcesData(data);
    setLoading(false);
  };

  const loadToolsData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchData('/Tools');
    if (data) setToolsData(data);
    setLoading(false);
  };

  const loadScheduleData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchData('/Scheduling/demo');
    if (data) setScheduleData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEbomData();
  }, []);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setStepLoading(true);
      
      // Add random delay between 1-3 seconds for processing feel
      const delay = Math.random() * 2000 + 1000; // 1000ms to 3000ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Load data for the next step
      switch (steps[nextStep].id) {
        case 'mbom':
          await loadMbomData();
          break;
        case 'tasks':
          await loadTasksData();
          break;
        case 'resources':
          await loadResourcesData();
          break;
        case 'tools':
          await loadToolsData();
          break;
        case 'schedule':
          await loadScheduleData();
          break;
        case 'summary':
          // Summary step uses all already loaded data
          await new Promise(resolve => setTimeout(resolve, 500));
          break;
      }
      
      setStepLoading(false);
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 0) {
      setStepLoading(true);
      
      // Add random delay between 1-3 seconds for processing feel
      const delay = Math.random() * 2000 + 1000; // 1000ms to 3000ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      setCurrentStep(currentStep - 1);
      setStepLoading(false);
    }
  };

  const downloadCsv = async (type: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Scheduling/download/${type}`);
      if (response.ok) {
        const blob = await response.blob();
        let csvContent = await blob.text();
        
        // Replace comma delimiters with semicolons
        csvContent = csvContent.replace(/,/g, ';');
        
        const newBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(newBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`Error downloading ${type} CSV:`, error);
      setError(`Failed to download ${type} CSV`);
    }
  };

  const exportSummaryToPDF = async () => {
    if (!scheduleData) return;

    const doc = new jsPDF();
    
    // Initialize autoTable
    autoTable(doc, { head: [], body: [] });
    
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Construction Project Summary', 20, yPosition);
    yPosition += 15;

    // Project Overview
    doc.setFontSize(14);
    doc.text('Project Overview', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const projectDuration = Math.ceil((new Date(scheduleData.projectEndDate).getTime() - new Date(scheduleData.projectStartDate).getTime()) / (1000 * 60 * 60 * 24));
    
    doc.text(`Project Duration: ${projectDuration} days`, 20, yPosition);
    yPosition += 6;
    doc.text(`Start Date: ${new Date(scheduleData.projectStartDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`End Date: ${new Date(scheduleData.projectEndDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Cost: $${scheduleData.totalProjectCost.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Daily Average: $${Math.round(scheduleData.totalProjectCost / projectDuration).toLocaleString()}`, 20, yPosition);
    yPosition += 15;

    // Capture and add charts
    try {
      // Wait a moment for charts to fully render
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to find chart containers by data attributes first
      let chartContainers = document.querySelectorAll('[data-chart]');
      if (chartContainers.length === 0) {
        // Fallback to other selectors
        chartContainers = document.querySelectorAll('.recharts-responsive-container');
      }
      if (chartContainers.length === 0) {
        chartContainers = document.querySelectorAll('.recharts-wrapper');
      }
      
      console.log(`Found ${chartContainers.length} chart containers`);
      
      let chartIndex = 0;
      const chartTitles = ['Cumulative Cost Over Time', 'Cost Breakdown', 'Resource Utilization', 'Daily Work Hours'];

      for (const chartContainer of Array.from(chartContainers)) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }

        console.log(`Capturing chart ${chartIndex + 1}...`);

        // Add chart title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(chartTitles[chartIndex] || `Chart ${chartIndex + 1}`, 20, yPosition);
        yPosition += 10;

        // Capture chart as image with simplified options
        const canvas = await html2canvas(chartContainer as HTMLElement, {
          backgroundColor: 'white',
          scale: 1,
          logging: false,
          useCORS: false,
          allowTaint: false,
          foreignObjectRendering: false,
          removeContainer: false,
          ignoreElements: (element) => {
            const tagName = element.tagName?.toLowerCase();
            return tagName === 'iframe' || tagName === 'script' || tagName === 'style';
          }
        });
        
        const imgData = canvas.toDataURL('image/png', 0.8);
        const imgWidth = 160;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        console.log(`Adding chart ${chartIndex + 1} to PDF - dimensions: ${imgWidth}x${imgHeight}`);
        doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, Math.min(imgHeight, 100));
        yPosition += Math.min(imgHeight, 100) + 15;
        chartIndex++;
      }
      
      console.log(`Successfully captured ${chartIndex} charts`);
    } catch (error) {
      console.error('Error capturing charts:', error);
      // Add a note in the PDF that charts couldn't be captured
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('Note: Charts could not be captured for this PDF export.', 20, yPosition);
      doc.text('Please check the browser console for details.', 20, yPosition + 6);
      yPosition += 20;
    }

    // Add new page for tables if needed
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Workflow Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Workflow Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`EBOM Items: ${ebomData.length}`, 20, yPosition);
    yPosition += 6;
    doc.text(`MBOM Items: ${mbomData.length}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Construction Tasks: ${tasksData.length}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Resource Types: ${resourcesData.length}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Tool Types: ${toolsData.length}`, 20, yPosition);
    yPosition += 15;

    // Tasks Table
    if (scheduleData.tasks.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Task Schedule', 20, yPosition);
      yPosition += 10;

      const taskData = scheduleData.tasks.slice(0, 20).map(task => [
        task.id,
        task.name,
        task.startTime.toString(),
        task.finishTime.toString(),
        task.duration.toString(),
        task.workingArea
      ]);

      autoTable(doc, {
        head: [['Task ID', 'Task Name', 'Start Day', 'End Day', 'Duration', 'Area']],
        body: taskData,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 20, right: 20 }
      });

      yPosition = (doc as any).lastAutoTable?.finalY + 15 || yPosition + 100;
    }

    // Footer
    doc.setFontSize(10);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      20,
      doc.internal.pageSize.height - 10
    );

    doc.save(`construction_project_summary_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'ebom':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Engineering Bill of Materials</h3>
              <Badge variant="outline">{ebomData.length} items</Badge>
            </div>
            <DataTable
              data={ebomData}
              columns={[
                { key: 'type', label: 'Material Type' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'location', label: 'Location' }
              ]}
            />
          </div>
        );

      case 'mbom':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Manufacturing Bill of Materials</h3>
              <Badge variant="outline">{mbomData.length} items</Badge>
            </div>
            <DataTable
              data={mbomData}
              columns={[
                { key: 'material', label: 'Material' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'unit', label: 'Unit' },
                { key: 'source', label: 'Source' }
              ]}
            />
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Construction Tasks</h3>
              <Badge variant="outline">{tasksData.length} tasks</Badge>
            </div>
            <DataTable
              data={tasksData}
              columns={[
                { key: 'id', label: 'Task ID' },
                { key: 'name', label: 'Task Name' },
                { key: 'duration', label: 'Duration (days)' },
                { key: 'workingArea', label: 'Working Area' },
                { 
                  key: 'requiredResources', 
                  label: 'Required Resources',
                  render: (value: Record<string, number>) => 
                    Object.entries(value || {}).map(([k, v]) => `${k}: ${v}`).join(', ')
                },
                { 
                  key: 'requiredTools', 
                  label: 'Required Tools',
                  render: (value: string[]) => (value || []).join(', ')
                }
              ]}
            />
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Available Resources</h3>
              <Badge variant="outline">{resourcesData.length} resource types</Badge>
            </div>
            <DataTable
              data={resourcesData}
              columns={[
                { key: 'name', label: 'Resource Name' },
                { key: 'availableCount', label: 'Available Count' },
                { key: 'dailyCost', label: 'Daily Cost ($)' },
                { key: 'type', label: 'Type' }
              ]}
            />
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Required Tools</h3>
              <Badge variant="outline">{toolsData.length} tools</Badge>
            </div>
            <DataTable
              data={toolsData}
              columns={[
                { key: 'name', label: 'Tool Name' },
                { key: 'availableCount', label: 'Available Count' },
                { key: 'category', label: 'Category' }
              ]}
            />
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project Schedule</h3>
              {scheduleData && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadCsv('schedule')}>
                    <Download className="w-4 h-4 mr-2" />
                    Schedule CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadCsv('delivery')}>
                    <Download className="w-4 h-4 mr-2" />
                    Delivery CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadCsv('cost')}>
                    <Download className="w-4 h-4 mr-2" />
                    Cost CSV
                  </Button>
                </div>
              )}
            </div>
            
            {scheduleData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Project Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.ceil((new Date(scheduleData.projectEndDate).getTime() - new Date(scheduleData.projectStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scheduleData.projectStartDate).toLocaleDateString()} - {new Date(scheduleData.projectEndDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{scheduleData.tasks.length}</div>
                      <p className="text-xs text-muted-foreground">Construction tasks</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${scheduleData.totalProjectCost.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Estimated project cost</p>
                    </CardContent>
                  </Card>
                </div>

                <DataTable
                  data={scheduleData.tasks}
                  columns={[
                    { key: 'id', label: 'Task ID' },
                    { key: 'name', label: 'Task Name' },
                    { key: 'startTime', label: 'Start Day' },
                    { key: 'finishTime', label: 'Finish Day' },
                    { key: 'duration', label: 'Duration (days)' },
                    { key: 'workingArea', label: 'Working Area' }
                  ]}
                />
              </>
            )}
          </div>
        );

      case 'summary':
        // Prepare data for charts - Fixed cumulative cost calculation
        const cumulativeCostData = scheduleData?.tasks?.map((task, index) => {
          // Use the same cost calculation as the backend
          const allTasksUpToThis = scheduleData.tasks.slice(0, index + 1);
          
          const cumulativeCost = allTasksUpToThis.reduce((sum, t) => {
            // Calculate labor cost using backend worker costs
            const laborCost = Object.entries(t.requiredResources || {}).reduce((lSum, [resource, count]) => {
              const dailyCost = resource === 'Plumber' ? 100.0 : 120.0; // Exact backend costs
              return lSum + (count * t.duration * dailyCost);
            }, 0);
            
            // Calculate material cost using backend material costs
            const materialCost = Object.entries(t.materials || {}).reduce((mSum, [material, quantity]) => {
              const materialCosts: Record<string, number> = {
                "Copper pipe 12mm": 10.0, "Hangers": 2.0, "Screws": 0.5, "Fittings": 3.0,
                "Solder": 1.0, "Pipe insulation": 5.0, "Duct pieces": 20.0, "Sheet metal screws": 0.2,
                "Support brackets": 4.0, "Fasteners": 1.0, "Sealant": 15.0, "Duct tape": 10.0, "Duct insulation": 8.0
              };
              const unitCost = materialCosts[material] || 5.0;
              return mSum + (quantity * unitCost);
            }, 0);
            
            return sum + laborCost + materialCost;
          }, 0);
          
          // Calculate this task's individual cost
          const taskLaborCost = Object.entries(task.requiredResources || {}).reduce((lSum, [resource, count]) => {
            const dailyCost = resource === 'Plumber' ? 100.0 : 120.0;
            return lSum + (count * task.duration * dailyCost);
          }, 0);
          
          const taskMaterialCost = Object.entries(task.materials || {}).reduce((mSum, [material, quantity]) => {
            const materialCosts: Record<string, number> = {
              "Copper pipe 12mm": 10.0, "Hangers": 2.0, "Screws": 0.5, "Fittings": 3.0,
              "Solder": 1.0, "Pipe insulation": 5.0, "Duct pieces": 20.0, "Sheet metal screws": 0.2,
              "Support brackets": 4.0, "Fasteners": 1.0, "Sealant": 15.0, "Duct tape": 10.0, "Duct insulation": 8.0
            };
            const unitCost = materialCosts[material] || 5.0;
            return mSum + (quantity * unitCost);
          }, 0);
          
          return {
            day: task.finishTime,
            taskName: task.name,
            cumulativeCost: cumulativeCost,
            taskCost: taskLaborCost + taskMaterialCost
          };
        }) || [];

        // Calculate cumulative work hours by day matching the cost progression
        const cumulativeWorkHours = scheduleData?.tasks?.map((task, index) => {
          const allTasksUpToThis = scheduleData.tasks.slice(0, index + 1);
          
          const cumulativeHours = allTasksUpToThis.reduce((sum, t) => {
            const taskHours = Object.entries(t.requiredResources || {}).reduce((hSum, [resource, count]) => {
              return hSum + (count * t.duration * 8); // 8 hours per day per worker
            }, 0);
            return sum + taskHours;
          }, 0);
          
          const taskHours = Object.entries(task.requiredResources || {}).reduce((hSum, [resource, count]) => {
            return hSum + (count * task.duration * 8);
          }, 0);

          return {
            day: task.finishTime,
            taskName: task.name,
            cumulativeHours: cumulativeHours,
            taskHours: taskHours
          };
        }) || [];

        const resourceWorkHours = resourcesData.map(resource => {
          const totalHours = scheduleData?.tasks?.reduce((sum, task) => {
            const resourceCount = task.requiredResources?.[resource.name] || 0;
            return sum + (resourceCount * task.duration * 8); // 8 hours per work day
          }, 0) || 0;
          
          return {
            name: resource.name,
            cumulativeHours: totalHours,
            capacity: resource.availableCount * 8 * 30 // Max hours per month
          };
        });

        const costBreakdown = [
          { name: 'Labor', value: scheduleData?.totalProjectCost ? scheduleData.totalProjectCost * 0.6 : 0, color: '#8884d8' },
          { name: 'Materials', value: scheduleData?.totalProjectCost ? scheduleData.totalProjectCost * 0.3 : 0, color: '#82ca9d' },
          { name: 'Equipment', value: scheduleData?.totalProjectCost ? scheduleData.totalProjectCost * 0.1 : 0, color: '#ffc658' }
        ];

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project Summary & Analytics</h3>
              {scheduleData && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportSummaryToPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadCsv('schedule')}>
                    <Download className="w-4 h-4 mr-2" />
                    Schedule CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadCsv('delivery')}>
                    <Download className="w-4 h-4 mr-2" />
                    Delivery CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadCsv('cost')}>
                    <Download className="w-4 h-4 mr-2" />
                    Cost CSV
                  </Button>
                </div>
              )}
            </div>
            
            {scheduleData && (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Project Duration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.ceil((new Date(scheduleData.projectEndDate).getTime() - new Date(scheduleData.projectStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scheduleData.projectStartDate).toLocaleDateString()} - {new Date(scheduleData.projectEndDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Total Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{scheduleData.tasks.length}</div>
                      <p className="text-xs text-muted-foreground">Construction tasks</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Total Cost
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${scheduleData.totalProjectCost.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Estimated project cost</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Daily Average
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${Math.round(scheduleData.totalProjectCost / Math.max(1, Math.ceil((new Date(scheduleData.projectEndDate).getTime() - new Date(scheduleData.projectStartDate).getTime()) / (1000 * 60 * 60 * 24)))).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Cost per day</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cumulative Cost Chart */}
                  <Card data-chart="cumulative-cost">
                    <CardHeader>
                      <CardTitle>Cumulative Cost Over Time</CardTitle>
                      <CardDescription>Project cost accumulation by day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={cumulativeCostData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                            labelFormatter={(day) => `Day ${day}`}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="cumulativeCost" 
                            stroke="#8884d8" 
                            strokeWidth={2}
                            name="Cumulative Cost"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Cost Breakdown Pie Chart */}
                  <Card data-chart="cost-breakdown">
                    <CardHeader>
                      <CardTitle>Cost Breakdown</CardTitle>
                      <CardDescription>Distribution of project costs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={costBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {costBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Cumulative Work Hours Chart */}
                  <Card data-chart="work-hours">
                    <CardHeader>
                      <CardTitle>Cumulative Work Hours by Day</CardTitle>
                      <CardDescription>Progression of total work hours throughout the project</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={cumulativeWorkHours}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => [`${value} hours`, name]} />
                          <Legend />
                          <Line type="monotone" dataKey="cumulativeHours" stroke="#82ca9d" strokeWidth={2} name="Cumulative Hours" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Resource Work Hours Chart */}
                  <Card data-chart="resource-hours">
                    <CardHeader>
                      <CardTitle>Resource Work Hours</CardTitle>
                      <CardDescription>Total work hours by resource type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={resourceWorkHours}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => [`${value} hours`, name]} />
                          <Legend />
                          <Bar dataKey="cumulativeHours" fill="#82ca9d" name="Total Hours" />
                          <Bar dataKey="capacity" fill="#8884d8" name="Monthly Capacity" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Daily Cost Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Costs by Day</CardTitle>
                      <CardDescription>Individual task costs throughout the project</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cumulativeCostData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Task Cost"]}
                            labelFormatter={(day) => `Day ${day}`}
                          />
                          <Legend />
                          <Bar dataKey="taskCost" fill="#ffc658" name="Task Cost" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Statistics</CardTitle>
                    <CardDescription>Detailed breakdown of project data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Materials Summary</h4>
                        <p className="text-sm text-muted-foreground mb-1">EBOM Items: {ebomData.length}</p>
                        <p className="text-sm text-muted-foreground mb-1">MBOM Items: {mbomData.length}</p>
                        <p className="text-sm text-muted-foreground">Total Materials: {ebomData.reduce((sum, item) => sum + item.quantity, 0)}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Resources Summary</h4>
                        <p className="text-sm text-muted-foreground mb-1">Resource Types: {resourcesData.length}</p>
                        <p className="text-sm text-muted-foreground mb-1">Tool Types: {toolsData.length}</p>
                        <p className="text-sm text-muted-foreground">Total Workers: {resourcesData.reduce((sum, r) => sum + r.availableCount, 0)}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Schedule Summary</h4>
                        <p className="text-sm text-muted-foreground mb-1">Critical Path: {scheduleData.tasks.length > 0 ? Math.max(...scheduleData.tasks.map(t => t.finishTime)) : 0} days</p>
                        <p className="text-sm text-muted-foreground mb-1">Avg Task Duration: {scheduleData.tasks.length > 0 ? Math.round(scheduleData.tasks.reduce((sum, t) => sum + t.duration, 0) / scheduleData.tasks.length) : 0} days</p>
                        <p className="text-sm text-muted-foreground">Efficiency: {scheduleData.tasks.length > 0 ? Math.round((scheduleData.tasks.reduce((sum, t) => sum + t.duration, 0) / Math.max(...scheduleData.tasks.map(t => t.finishTime))) * 100) : 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        );

      default:
        return <div>Content for {step.title}</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">BOM Management & Scheduling</h1>
        <p className="text-muted-foreground">
          Complete workflow from EBOM to project scheduling
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Workflow</CardTitle>
          <CardDescription>
            Follow the steps to transform engineering requirements into a complete construction schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Stepper
            steps={steps}
            currentStep={currentStep}
          />

          {error && (
            <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}

          <div className="flex justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0 || stepLoading}
            >
              {stepLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={currentStep === steps.length - 1 || stepLoading}
            >
              {stepLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Next
            </Button>
          </div>

          <div className="min-h-[400px] relative">
            {stepLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Processing step...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Loading {steps[currentStep]?.title} data
                  </p>
                </div>
              </div>
            ) : null}
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              </div>
            ) : (
              renderStepContent()
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
