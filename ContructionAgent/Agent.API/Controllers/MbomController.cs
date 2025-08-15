using Microsoft.AspNetCore.Mvc;
using Agent.API.Models;
using Agent.API.Services.Interfaces;

namespace Agent.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MbomController : ControllerBase
{
    private readonly ILogger<MbomController> _logger;
    private readonly IBomService _bomService;

    public MbomController(ILogger<MbomController> logger, IBomService bomService)
    {
        _logger = logger;
        _bomService = bomService;
    }

    /// <summary>
    /// Get the Manufacturing Bill of Materials (MBOM) - detailed materials needed for installation
    /// </summary>
    /// <returns>List of MBOM items calculated from EBOM</returns>
    [HttpGet]
    public ActionResult<List<MbomItem>> GetMbom()
    {
        try
        {
            var ebomItems = _bomService.GetEbomItems();
            var mbomItems = _bomService.GenerateMbomFromEbom(ebomItems);
            return Ok(mbomItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating MBOM from EBOM");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Generate MBOM from provided EBOM items
    /// </summary>
    /// <param name="ebomItems">List of EBOM items to generate MBOM from</param>
    /// <returns>List of MBOM items</returns>
    [HttpPost("generate")]
    public ActionResult<List<MbomItem>> GenerateMbomFromEbom([FromBody] List<BomItem> ebomItems)
    {
        try
        {
            if (ebomItems == null || !ebomItems.Any())
            {
                return BadRequest("EBOM items list cannot be empty");
            }

            var mbomItems = _bomService.GenerateMbomFromEbom(ebomItems);
            return Ok(mbomItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating MBOM from provided EBOM items");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get MBOM items grouped by material type
    /// </summary>
    /// <returns>Dictionary with material types as keys and quantities as values</returns>
    [HttpGet("grouped")]
    public ActionResult<Dictionary<string, double>> GetMbomGrouped()
    {
        try
        {
            var ebomItems = _bomService.GetEbomItems();
            var mbomItems = _bomService.GenerateMbomFromEbom(ebomItems);
            
            var grouped = mbomItems
                .GroupBy(m => m.Material)
                .ToDictionary(g => g.Key, g => g.Sum(m => m.Quantity));

            return Ok(grouped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating grouped MBOM");
            return StatusCode(500, "Internal server error");
        }
    }
}
