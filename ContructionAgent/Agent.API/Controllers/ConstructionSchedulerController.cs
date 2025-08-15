using Microsoft.AspNetCore.Mvc;
using Agent.API.Models;
using Agent.API.Services;
using System.Text;

namespace Agent.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConstructionSchedulerController : ControllerBase
{
    private readonly ILogger<ConstructionSchedulerController> _logger;

    public ConstructionSchedulerController(ILogger<ConstructionSchedulerController> logger)
    {
        _logger = logger;
    }

    [HttpPost("generate-schedule")]
    public IActionResult GenerateSchedule([FromBody] ScheduleRequest request)
    {
        try
        {
            var resourcePool = GetDefaultResourcePool();
            var toolPool = GetDefaultToolPool();
            var materialCosts = GetDefaultMaterialCosts();
            var workerCosts = GetDefaultWorkerCosts();

            var scheduler = new ConstructionScheduler(resourcePool, toolPool, request.ProjectStartDate)
            {
                MaterialCosts = materialCosts,
                WorkerCosts = workerCosts
            };

            int taskIdCounter = 1;
            var allTasks = new List<Models.Task>();
            
            foreach (var item in request.BomItems)
            {
                var tasks = ConstructionScheduler.GenerateTasks(item, ref taskIdCounter);
                allTasks.AddRange(tasks);
            }

            scheduler.ComputeSchedule(allTasks);

            var result = new ScheduleResult
            {
                ScheduleCsv = scheduler.GenerateScheduleCsv(allTasks),
                DeliveryCsv = scheduler.GenerateDeliveryCsv(allTasks),
                CostCsv = scheduler.GenerateCostCsv(allTasks),
                Tasks = allTasks
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating construction schedule");
            return BadRequest($"Error generating schedule: {ex.Message}");
        }
    }

    [HttpGet("schedule-csv/{fileName}")]
    public IActionResult DownloadCsv(string fileName, [FromQuery] string csvContent)
    {
        if (string.IsNullOrEmpty(csvContent))
        {
            return BadRequest("CSV content is required");
        }

        var bytes = Encoding.UTF8.GetBytes(csvContent);
        return File(bytes, "text/csv", $"{fileName}.csv");
    }

    [HttpGet("material-installations")]
    public IActionResult GetMaterialInstallations()
    {
        var installations = MaterialInstallation.GetAllMaterialInstallations();
        return Ok(installations);
    }

    [HttpPost("demo")]
    public IActionResult GenerateDemoSchedule()
    {
        var bomItems = new List<BomItem>
        {
            new BomItem { Type = "Copper pipe 12mm", Quantity = 43, Location = "Hall 2" },
            new BomItem { Type = "Duct system", Quantity = 10, Location = "Room 5" }
        };

        var request = new ScheduleRequest
        {
            BomItems = bomItems,
            ProjectStartDate = new DateTime(2023, 10, 1)
        };

        return GenerateSchedule(request);
    }

    private static Dictionary<string, int> GetDefaultResourcePool()
    {
        return new Dictionary<string, int>
        {
            { "Plumber", 2 },
            { "HVAC technician", 3 }
        };
    }

    private static Dictionary<string, int> GetDefaultToolPool()
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

    private static Dictionary<string, double> GetDefaultMaterialCosts()
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

    private static Dictionary<string, double> GetDefaultWorkerCosts()
    {
        return new Dictionary<string, double>
        {
            {"Plumber", 100.0},
            {"HVAC technician", 120.0}
        };
    }
}
