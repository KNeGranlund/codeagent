using System.Text;
using Agent.API.Models;

namespace Agent.API.Services;

public class ConstructionScheduler
{
    private Dictionary<string, int> resourcePool; // worker types to available count
    private Dictionary<string, int> toolPool; // tool types to available count
    public Dictionary<string, double> MaterialCosts { get; set; } = new();
    public Dictionary<string, double> WorkerCosts { get; set; } = new();
    private DateTime projectStartDate;
    private Dictionary<int, Dictionary<string, int>> resourceUsage = new Dictionary<int, Dictionary<string, int>>(); // time -> resource -> used count
    private Dictionary<int, HashSet<string>> areaUsage = new Dictionary<int, HashSet<string>>(); // time -> areas in use
    private Dictionary<int, HashSet<string>> toolUsage = new Dictionary<int, HashSet<string>>(); // time -> tools in use

    public ConstructionScheduler(Dictionary<string, int> resourcePool, Dictionary<string, int> toolPool, DateTime projectStartDate)
    {
        this.resourcePool = resourcePool;
        this.toolPool = toolPool;
        this.projectStartDate = projectStartDate;
    }

    public string GenerateCostCsv(List<Models.Task> tasks)
    {
        if (MaterialCosts == null || WorkerCosts == null)
        {
            throw new InvalidOperationException("Material and worker costs must be set.");
        }

        int maxFinish = tasks.Max(t => t.FinishTime);
        double cumulativeCost = 0;
        var sb = new StringBuilder();
        sb.AppendLine("Day;Date;Material Cost;Labor Cost;Total Cost;Cumulative Cost");

        for (int day = 0; day <= maxFinish; day++)
        {
            DateTime currentDate = projectStartDate.AddDays(day);

            // Material cost: sum costs of materials delivered today
            double materialCost = 0;
            foreach (var task in tasks)
            {
                int deliveryDay = task.StartTime - task.LeadTime;
                if (deliveryDay == day)
                {
                    foreach (var mat in task.Materials)
                    {
                        if (MaterialCosts.TryGetValue(mat.Key, out double unitCost))
                        {
                            materialCost += mat.Value * unitCost;
                        }
                        else
                        {
                            Console.WriteLine($"Warning: No cost defined for material {mat.Key}");
                        }
                    }
                }
            }

            // Labor cost: sum costs of workers for active tasks
            double laborCost = 0;
            foreach (var task in tasks)
            {
                if (task.StartTime <= day && day < task.FinishTime)
                {
                    foreach (var res in task.RequiredResources)
                    {
                        if (WorkerCosts.TryGetValue(res.Key, out double workerCost))
                        {
                            laborCost += res.Value * workerCost;
                        }
                        else
                        {
                            Console.WriteLine($"Warning: No cost defined for worker {res.Key}");
                        }
                    }
                }
            }

            double totalCost = materialCost + laborCost;
            cumulativeCost += totalCost;
            sb.AppendLine($"{day};{currentDate:yyyy-MM-dd};{materialCost};{laborCost};{totalCost};{cumulativeCost}");
        }

        return sb.ToString();
    }

    public static List<Models.Task> GenerateTasks(BomItem item, ref int taskIdCounter)
    {
        var materialInstallations = MaterialInstallation.GetAllMaterialInstallations();
        
        if (!materialInstallations.TryGetValue(item.Type, out var materialInstallation))
        {
            throw new ArgumentException($"Unknown material type: {item.Type}");
        }
        
        var tasks = new List<Models.Task>();
        var taskDict = new Dictionary<string, Models.Task>();
        
        // Create tasks for each installation step
        foreach (var step in materialInstallation.InstallationSteps)
        {
            string taskId = $"Task{taskIdCounter++}";
            double hours;
            Dictionary<string, int> materials;
            
            // Calculate hours and materials based on whether the step is fixed or scales with quantity
            if (step.IsFixed)
            {
                hours = step.BaseHours;
                materials = step.RequiredMaterials.ToDictionary(kv => kv.Key, kv => (int)Math.Ceiling(kv.Value));
            }
            else
            {
                hours = step.BaseHours * item.Quantity;
                materials = step.RequiredMaterials.ToDictionary(kv => kv.Key, kv => (int)Math.Ceiling(kv.Value * item.Quantity));
            }
            
            int duration = (int)Math.Ceiling(hours / 8.0); // Convert hours to days (8-hour workday)
            
            var task = new Models.Task
            {
                Id = taskId,
                Name = $"{step.StepName} for {item.Type} in {item.Location}",
                Duration = duration,
                WorkingArea = item.Location,
                RequiredResources = new Dictionary<string, int>(step.RequiredWorkers),
                RequiredTools = new List<string>(step.RequiredTools),
                Materials = materials,
                LeadTime = step.MaterialLeadTime,
                Dependencies = new List<Models.Task>()
            };
            
            tasks.Add(task);
            taskDict[step.StepName] = task;
        }
        
        // Set dependencies between tasks
        foreach (var step in materialInstallation.InstallationSteps)
        {
            var task = taskDict[step.StepName];
            foreach (var depName in step.PrecedingSteps)
            {
                task.Dependencies.Add(taskDict[depName]);
            }
        }
        
        return tasks;
    }

    public void ComputeSchedule(List<Models.Task> tasks)
    {
        // Build successors (tasks that depend on each task)
        var successors = new Dictionary<Models.Task, List<Models.Task>>();
        foreach (var task in tasks)
        {
            successors[task] = new List<Models.Task>();
        }
        foreach (var task in tasks)
        {
            foreach (var dep in task.Dependencies)
            {
                successors[dep].Add(task);
            }
        }

        // Count unscheduled dependencies for each task
        var unscheduledDeps = new Dictionary<Models.Task, int>();
        foreach (var task in tasks)
        {
            unscheduledDeps[task] = task.Dependencies.Count;
        }

        // Initialize ready tasks (those with no dependencies)
        var readyTasks = new List<Models.Task>();
        foreach (var task in tasks)
        {
            if (unscheduledDeps[task] == 0)
            {
                readyTasks.Add(task);
            }
        }

        while (readyTasks.Count > 0)
        {
            Models.Task? bestTask = null;
            int bestStart = int.MaxValue;

            // Find the task that can start earliest
            foreach (var task in readyTasks)
            {
                int minStart = task.Dependencies.Any() ? task.Dependencies.Max(dep => dep.FinishTime) : 0;
                int start = minStart;

                while (true)
                {
                    bool canStart = true;
                    for (int t = start; t < start + task.Duration; t++)
                    {
                        var areas = GetAreaUsage(t);
                        if (areas.Contains(task.WorkingArea))
                        {
                            canStart = false;
                            break;
                        }

                        var resUsage = GetResourceUsage(t);
                        foreach (var res in task.RequiredResources)
                        {
                            int used = resUsage.GetValueOrDefault(res.Key, 0);
                            if (used + res.Value > resourcePool[res.Key])
                            {
                                canStart = false;
                                break;
                            }
                        }

                        var toolsInUse = GetToolUsage(t);
                        foreach (var tool in task.RequiredTools)
                        {
                            if (toolsInUse.Count(tu => tu == tool) >= toolPool[tool])
                            {
                                canStart = false;
                                break;
                            }
                        }
                        if (!canStart) break;
                    }

                    if (canStart)
                    {
                        if (start < bestStart)
                        {
                            bestStart = start;
                            bestTask = task;
                        }
                        break;
                    }
                    start++;
                }
            }

            if (bestTask != null)
            {
                // Schedule the selected task
                int start = bestStart;
                bestTask.StartTime = start;
                bestTask.FinishTime = start + bestTask.Duration;

                // Update resource, area, and tool usage
                for (int t = start; t < start + bestTask.Duration; t++)
                {
                    GetAreaUsage(t).Add(bestTask.WorkingArea);
                    var resUsage = GetResourceUsage(t);
                    foreach (var res in bestTask.RequiredResources)
                    {
                        resUsage[res.Key] = resUsage.GetValueOrDefault(res.Key, 0) + res.Value;
                    }
                    var toolsInUse = GetToolUsage(t);
                    foreach (var tool in bestTask.RequiredTools)
                    {
                        toolsInUse.Add(tool);
                    }
                }

                readyTasks.Remove(bestTask);

                // Update successors
                foreach (var successor in successors[bestTask])
                {
                    unscheduledDeps[successor]--;
                    if (unscheduledDeps[successor] == 0)
                    {
                        readyTasks.Add(successor);
                    }
                }
            }
            else
            {
                throw new Exception("Cannot schedule tasks due to cyclic dependencies or resource constraints.");
            }
        }
    }

    private Dictionary<string, int> GetResourceUsage(int time)
    {
        if (!resourceUsage.TryGetValue(time, out var dict))
        {
            dict = new Dictionary<string, int>();
            resourceUsage[time] = dict;
        }
        return dict;
    }

    private HashSet<string> GetAreaUsage(int time)
    {
        if (!areaUsage.TryGetValue(time, out var set))
        {
            set = new HashSet<string>();
            areaUsage[time] = set;
        }
        return set;
    }

    private HashSet<string> GetToolUsage(int time)
    {
        if (!toolUsage.TryGetValue(time, out var set))
        {
            set = new HashSet<string>();
            toolUsage[time] = set;
        }
        return set;
    }

    public string GenerateScheduleCsv(List<Models.Task> tasks)
    {
        var sb = new StringBuilder();
        // CSV header
        sb.AppendLine("ID;Name;Start;Finish;Duration;Predecessors;Resources");

        foreach (var task in tasks)
        {
            var startDate = projectStartDate.AddDays(task.StartTime).ToString("yyyy-MM-dd");
            var finishDate = projectStartDate.AddDays(task.FinishTime).ToString("yyyy-MM-dd");
            var duration = $"{task.Duration} days";
            var predecessors = string.Join(",", task.Dependencies.Select(d => d.Id));
            var resources = string.Join(",", task.RequiredResources.SelectMany(kv => Enumerable.Repeat(kv.Key, kv.Value)));
            sb.AppendLine($"{task.Id};{task.Name};{startDate};{finishDate};{duration};{predecessors};{resources}");
        }

        return sb.ToString();
    }

    public string GenerateDeliveryCsv(List<Models.Task> tasks)
    {
        var deliveries = new List<(DateTime DeliveryDate, string Material, int Quantity, string TaskName)>();

        foreach (var task in tasks)
        {
            var deliveryDate = projectStartDate.AddDays(task.StartTime - task.LeadTime);
            foreach (var mat in task.Materials)
            {
                deliveries.Add((deliveryDate, mat.Key, mat.Value, task.Name));
            }
        }

        // Sort deliveries by date
        deliveries.Sort((a, b) => a.DeliveryDate.CompareTo(b.DeliveryDate));

        var sb = new StringBuilder();
        sb.AppendLine("Delivery Date;Material;Quantity;Task");
        foreach (var del in deliveries)
        {
            sb.AppendLine($"{del.DeliveryDate:yyyy-MM-dd};{del.Material};{del.Quantity};{del.TaskName}");
        }

        return sb.ToString();
    }
}
