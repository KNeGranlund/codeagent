using Microsoft.AspNetCore.Mvc;
using Agent.API.Models;
using Agent.API.Services.Interfaces;

namespace Agent.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EbomController : ControllerBase
{
    private readonly ILogger<EbomController> _logger;
    private readonly IBomService _bomService;

    public EbomController(ILogger<EbomController> logger, IBomService bomService)
    {
        _logger = logger;
        _bomService = bomService;
    }

    /// <summary>
    /// Get the Engineering Bill of Materials (EBOM) - high-level components
    /// </summary>
    /// <returns>List of EBOM items</returns>
    [HttpGet]
    public ActionResult<List<BomItem>> GetEbom()
    {
        try
        {
            var bomItems = _bomService.GetEbomItems();
            return Ok(bomItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving EBOM items");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get EBOM items for a specific location
    /// </summary>
    /// <param name="location">The location to filter by</param>
    /// <returns>List of EBOM items for the specified location</returns>
    [HttpGet("by-location/{location}")]
    public ActionResult<List<BomItem>> GetEbomByLocation(string location)
    {
        try
        {
            var allItems = _bomService.GetEbomItems();
            var filteredItems = allItems.Where(item => 
                item.Location.Equals(location, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (!filteredItems.Any())
            {
                return NotFound($"No EBOM items found for location: {location}");
            }

            return Ok(filteredItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving EBOM items for location: {location}", location);
            return StatusCode(500, "Internal server error");
        }
    }
}
