using Agent.API.Models;
using Agent.API.Services.Interfaces;

namespace Agent.API.Services;

public class ConstructionSchedulerService : IConstructionSchedulerService
{
    public List<Models.Task> GenerateTasksFromEbom(List<BomItem> ebomItems)
    {
        int taskIdCounter = 1;
        var allTasks = new List<Models.Task>();
        
        foreach (var item in ebomItems)
        {
            var tasks = ConstructionScheduler.GenerateTasks(item, ref taskIdCounter);
            allTasks.AddRange(tasks);
        }
        
        return allTasks;
    }

    public ScheduleResult GenerateCompleteSchedule(List<BomItem> ebomItems, DateTime projectStartDate)
    {
        var resourcePool = GetDefaultResourcePool();
        var toolPool = GetDefaultToolPool();
        var materialCosts = GetMaterialCosts();
        var workerCosts = GetWorkerCosts();

        var scheduler = new ConstructionScheduler(resourcePool, toolPool, projectStartDate)
        {
            MaterialCosts = materialCosts,
            WorkerCosts = workerCosts
        };

        var tasks = GenerateTasksFromEbom(ebomItems);
        scheduler.ComputeSchedule(tasks);

        var scheduleCsv = scheduler.GenerateScheduleCsv(tasks);
        var deliveryCsv = scheduler.GenerateDeliveryCsv(tasks);
        var costCsv = scheduler.GenerateCostCsv(tasks);

        var projectEndDate = tasks.Any() 
            ? projectStartDate.AddDays(tasks.Max(t => t.FinishTime))
            : projectStartDate;

        // Calculate total project cost
        var totalCost = tasks.Sum(t => 
        {
            double materialCost = t.Materials.Sum(m => 
                materialCosts.TryGetValue(m.Key, out double cost) ? cost * m.Value : 0);
            double laborCost = t.RequiredResources.Sum(r => 
                workerCosts.TryGetValue(r.Key, out double cost) ? cost * r.Value * t.Duration : 0);
            return materialCost + laborCost;
        });

        return new ScheduleResult
        {
            ScheduleCsv = scheduleCsv,
            DeliveryCsv = deliveryCsv,
            CostCsv = costCsv,
            Tasks = tasks,
            ProjectStartDate = projectStartDate,
            ProjectEndDate = projectEndDate,
            TotalProjectCost = totalCost
        };
    }

    public List<ResourceInfo> GetResourcePool()
    {
        var workerCosts = GetWorkerCosts();
        return GetDefaultResourcePool().Select(kv => new ResourceInfo
        {
            Name = kv.Key,
            AvailableCount = kv.Value,
            DailyCost = workerCosts.TryGetValue(kv.Key, out double cost) ? cost : 0,
            Type = "Worker"
        }).ToList();
    }

    public List<ToolInfo> GetToolPool()
    {
        return GetDefaultToolPool().Select(kv => new ToolInfo
        {
            Name = kv.Key,
            AvailableCount = kv.Value,
            Category = GetToolCategory(kv.Key)
        }).ToList();
    }

    public Dictionary<string, double> GetMaterialCosts()
    {
        return new Dictionary<string, double>
        {
            {"Copper pipe 12mm", 10.0},
            {"Hangers", 2.0},
            {"Screws", 0.5},
            {"Fittings", 3.0},
            {"Solder", 1.0},
            {"Pipe insulation", 5.0},
            {"Duct pieces", 20.0},
            {"Sheet metal screws", 0.2},
            {"Support brackets", 4.0},
            {"Fasteners", 1.0},
            {"Sealant", 15.0},
            {"Duct tape", 10.0},
            {"Duct insulation", 8.0}
        };
    }

    public Dictionary<string, double> GetWorkerCosts()
    {
        return new Dictionary<string, double>
        {
            {"Plumber", 100.0},
            {"HVAC technician", 120.0}
        };
    }

    private Dictionary<string, int> GetDefaultResourcePool()
    {
        return new Dictionary<string, int>
        {
            { "Plumber", 2 },
            { "HVAC technician", 3 }
        };
    }

    private Dictionary<string, int> GetDefaultToolPool()
    {
        return new Dictionary<string, int>
        {
            { "Drill", 2 },
            { "Wrench", 1 },
            { "Pressure tester", 1 },
            { "Screwdriver", 2 },
            { "Ladder", 2 },
            { "Sealant gun", 1 },
            { "Airflow meter", 1 },
            { "Pipe cutter", 1 },
            { "Pipe wrench", 1 },
            { "Level", 2 },
            { "Measuring tape", 3 },
            { "Marker", 5 },
            { "Utility knife", 2 },
            { "Tin snips", 1 },
            { "Brush", 2 },
            { "Tape measure", 3 }
        };
    }

    private string GetToolCategory(string toolName)
    {
        return toolName.ToLower() switch
        {
            var name when name.Contains("drill") => "Power Tools",
            var name when name.Contains("wrench") => "Hand Tools",
            var name when name.Contains("screwdriver") => "Hand Tools",
            var name when name.Contains("cutter") => "Cutting Tools",
            var name when name.Contains("tester") => "Testing Equipment",
            var name when name.Contains("meter") => "Measuring Equipment",
            var name when name.Contains("tape") || name.Contains("measure") => "Measuring Tools",
            var name when name.Contains("level") => "Measuring Tools",
            var name when name.Contains("ladder") => "Access Equipment",
            var name when name.Contains("gun") => "Application Tools",
            var name when name.Contains("knife") => "Cutting Tools",
            var name when name.Contains("snips") => "Cutting Tools",
            var name when name.Contains("brush") => "Application Tools",
            var name when name.Contains("marker") => "Marking Tools",
            _ => "General Tools"
        };
    }
}
