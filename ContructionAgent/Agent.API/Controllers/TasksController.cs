using Microsoft.AspNetCore.Mvc;
using Agent.API.Models;
using Agent.API.Services.Interfaces;

namespace Agent.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ILogger<TasksController> _logger;
    private readonly IConstructionSchedulerService _schedulerService;

    public TasksController(ILogger<TasksController> logger, IConstructionSchedulerService schedulerService)
    {
        _logger = logger;
        _schedulerService = schedulerService;
    }

    /// <summary>
    /// Generate tasks from EBOM items
    /// </summary>
    /// <param name="ebomItems">List of EBOM items</param>
    /// <returns>List of construction tasks</returns>
    [HttpPost("generate")]
    public ActionResult<List<Models.Task>> GenerateTasks([FromBody] List<BomItem> ebomItems)
    {
        try
        {
            if (ebomItems == null || !ebomItems.Any())
            {
                return BadRequest("EBOM items list cannot be empty");
            }

            var tasks = _schedulerService.GenerateTasksFromEbom(ebomItems);
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating tasks from EBOM");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get tasks from default EBOM
    /// </summary>
    /// <returns>List of construction tasks</returns>
    [HttpGet]
    public ActionResult<List<Models.Task>> GetTasks()
    {
        try
        {
            var defaultEbom = new List<BomItem>
            {
                new BomItem { Type = "Copper pipe 12mm", Quantity = 43, Location = "Hall 2" },
                new BomItem { Type = "Duct system", Quantity = 10, Location = "Room 5" }
            };

            var tasks = _schedulerService.GenerateTasksFromEbom(defaultEbom);
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tasks");
            return StatusCode(500, "Internal server error");
        }
    }
}
