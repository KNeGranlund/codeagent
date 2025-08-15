using Microsoft.AspNetCore.Mvc;
using Agent.API.Services.Interfaces;
using Agent.API.Models;

namespace Agent.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToolsController : ControllerBase
{
    private readonly ILogger<ToolsController> _logger;
    private readonly IConstructionSchedulerService _schedulerService;

    public ToolsController(ILogger<ToolsController> logger, IConstructionSchedulerService schedulerService)
    {
        _logger = logger;
        _schedulerService = schedulerService;
    }

    /// <summary>
    /// Get available tools
    /// </summary>
    /// <returns>List of available tools</returns>
    [HttpGet]
    public ActionResult<List<ToolInfo>> GetTools()
    {
        try
        {
            var tools = _schedulerService.GetToolPool();
            return Ok(tools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tools");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get tools grouped by category
    /// </summary>
    /// <returns>Dictionary of tools grouped by category</returns>
    [HttpGet("by-category")]
    public ActionResult<Dictionary<string, List<ToolInfo>>> GetToolsByCategory()
    {
        try
        {
            var tools = _schedulerService.GetToolPool();
            var grouped = tools.GroupBy(t => t.Category)
                               .ToDictionary(g => g.Key, g => g.ToList());
            return Ok(grouped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tools by category");
            return StatusCode(500, "Internal server error");
        }
    }
}
