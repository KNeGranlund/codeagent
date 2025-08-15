using Microsoft.AspNetCore.Mvc;
using Agent.API.Models;
using Agent.API.Services.Interfaces;

namespace Agent.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchedulingController : ControllerBase
{
    private readonly ILogger<SchedulingController> _logger;
    private readonly IConstructionSchedulerService _schedulerService;

    public SchedulingController(ILogger<SchedulingController> logger, IConstructionSchedulerService schedulerService)
    {
        _logger = logger;
        _schedulerService = schedulerService;
    }

    /// <summary>
    /// Generate complete construction schedule from EBOM
    /// </summary>
    /// <param name="request">Schedule generation request</param>
    /// <returns>Complete schedule with tasks, timeline, and costs</returns>
    [HttpPost("generate")]
    public ActionResult<ScheduleResult> GenerateSchedule([FromBody] ScheduleRequest request)
    {
        try
        {
            if (request.BomItems == null || !request.BomItems.Any())
            {
                return BadRequest("EBOM items list cannot be empty");
            }

            var result = _schedulerService.GenerateCompleteSchedule(
                request.BomItems, 
                request.ProjectStartDate);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating schedule");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Generate schedule using default EBOM
    /// </summary>
    /// <param name="projectStartDate">Project start date (optional, defaults to today)</param>
    /// <returns>Complete schedule</returns>
    [HttpGet("demo")]
    public ActionResult<ScheduleResult> GenerateDemoSchedule([FromQuery] DateTime? projectStartDate = null)
    {
        try
        {
            var defaultEbom = new List<BomItem>
            {
                new BomItem { Type = "Copper pipe 12mm", Quantity = 43, Location = "Hall 2" },
                new BomItem { Type = "Duct system", Quantity = 10, Location = "Room 5" }
            };

            var startDate = projectStartDate ?? DateTime.Today;
            var result = _schedulerService.GenerateCompleteSchedule(defaultEbom, startDate);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating demo schedule");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Download schedule as CSV
    /// </summary>
    /// <param name="type">Type of CSV (schedule, delivery, cost)</param>
    /// <param name="projectStartDate">Project start date</param>
    /// <returns>CSV file</returns>
    [HttpGet("download/{type}")]
    public ActionResult DownloadScheduleCsv(string type, [FromQuery] DateTime? projectStartDate = null)
    {
        try
        {
            var defaultEbom = new List<BomItem>
            {
                new BomItem { Type = "Copper pipe 12mm", Quantity = 43, Location = "Hall 2" },
                new BomItem { Type = "Duct system", Quantity = 10, Location = "Room 5" }
            };

            var startDate = projectStartDate ?? DateTime.Today;
            var result = _schedulerService.GenerateCompleteSchedule(defaultEbom, startDate);

            string csvContent;
            string fileName;

            switch (type.ToLower())
            {
                case "schedule":
                    csvContent = result.ScheduleCsv;
                    fileName = "construction_schedule.csv";
                    break;
                case "delivery":
                    csvContent = result.DeliveryCsv;
                    fileName = "material_delivery_schedule.csv";
                    break;
                case "cost":
                    csvContent = result.CostCsv;
                    fileName = "cost_analysis.csv";
                    break;
                default:
                    return BadRequest("Invalid CSV type. Use 'schedule', 'delivery', or 'cost'");
            }

            var bytes = System.Text.Encoding.UTF8.GetBytes(csvContent);
            return File(bytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading CSV");
            return StatusCode(500, "Internal server error");
        }
    }
}
