using Microsoft.AspNetCore.Mvc;
using Agent.API.Services.Interfaces;
using Agent.API.Models;

namespace Agent.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
    private readonly ILogger<ResourcesController> _logger;
    private readonly IConstructionSchedulerService _schedulerService;

    public ResourcesController(ILogger<ResourcesController> logger, IConstructionSchedulerService schedulerService)
    {
        _logger = logger;
        _schedulerService = schedulerService;
    }

    /// <summary>
    /// Get available resources (workers)
    /// </summary>
    /// <returns>List of available resources</returns>
    [HttpGet]
    public ActionResult<List<ResourceInfo>> GetResources()
    {
        try
        {
            var resources = _schedulerService.GetResourcePool();
            return Ok(resources);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resources");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get resource costs
    /// </summary>
    /// <returns>Dictionary of resource costs</returns>
    [HttpGet("costs")]
    public ActionResult<Dictionary<string, double>> GetResourceCosts()
    {
        try
        {
            var costs = _schedulerService.GetWorkerCosts();
            return Ok(costs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting resource costs");
            return StatusCode(500, "Internal server error");
        }
    }
}
