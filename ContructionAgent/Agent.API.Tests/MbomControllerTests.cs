using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using Xunit;
using Agent.API.Controllers;
using Agent.API.Models;

namespace Agent.API.Tests;

public class MbomControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public MbomControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetMbom_ReturnsCalculatedMaterials()
    {
        // Act
        var response = await _client.GetAsync("/api/Mbom");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var mbomItems = JsonConvert.DeserializeObject<List<MbomItem>>(content);
        
        Assert.NotNull(mbomItems);
        Assert.NotEmpty(mbomItems);
        
        // Verify that we have the expected materials for copper pipes and duct systems
        Assert.Contains(mbomItems, item => item.MaterialType == "Hangers");
        Assert.Contains(mbomItems, item => item.MaterialType == "Screws");
        Assert.Contains(mbomItems, item => item.MaterialType == "Copper pipe 12mm");
        Assert.Contains(mbomItems, item => item.MaterialType == "Fittings");
        Assert.Contains(mbomItems, item => item.MaterialType == "Duct pieces");
        
        // Verify categories are assigned
        Assert.All(mbomItems, item => Assert.NotEmpty(item.Category));
        Assert.All(mbomItems, item => Assert.NotEmpty(item.Unit));
    }

    [Fact]
    public async Task CalculateMbom_WithCustomEbom_ReturnsCorrectMaterials()
    {
        // Arrange
        var customEbom = new List<BomItem>
        {
            new BomItem { Type = "Copper pipe 12mm", Quantity = 20, Location = "Test Hall" }
        };
        
        var json = JsonConvert.SerializeObject(customEbom);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        // Act
        var response = await _client.PostAsync("/api/Mbom/calculate", content);
        
        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var mbomItems = JsonConvert.DeserializeObject<List<MbomItem>>(responseContent);
        
        Assert.NotNull(mbomItems);
        Assert.NotEmpty(mbomItems);
        
        // Should contain materials needed for copper pipe installation
        Assert.Contains(mbomItems, item => item.MaterialType == "Hangers");
        Assert.Contains(mbomItems, item => item.MaterialType == "Screws");
        Assert.Contains(mbomItems, item => item.MaterialType == "Copper pipe 12mm");
    }

    [Fact]
    public async Task GetMbomByCategory_ReturnsFilteredResults()
    {
        // Act
        var response = await _client.GetAsync("/api/Mbom/by-category/Plumbing");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var mbomItems = JsonConvert.DeserializeObject<List<MbomItem>>(content);
        
        Assert.NotNull(mbomItems);
        Assert.All(mbomItems, item => Assert.Equal("Plumbing", item.Category));
    }

    [Fact]
    public async Task GetMbomSummary_ReturnsGroupedData()
    {
        // Act
        var response = await _client.GetAsync("/api/Mbom/summary");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var summary = JsonConvert.DeserializeObject<List<dynamic>>(content);
        
        Assert.NotNull(summary);
        Assert.NotEmpty(summary);
    }

    [Fact]
    public void MbomController_CalculatesCorrectQuantities()
    {
        // Arrange
        var logger = _factory.Services.GetRequiredService<ILogger<MbomController>>();
        var controller = new MbomController(logger);
        
        var ebomItems = new List<BomItem>
        {
            new BomItem { Type = "Copper pipe 12mm", Quantity = 43, Location = "Hall 2" },
            new BomItem { Type = "Duct system", Quantity = 10, Location = "Room 5" }
        };
        
        // Act
        var result = controller.CalculateMbom(ebomItems);
        
        // Assert
        Assert.NotNull(result.Value);
        var mbomItems = result.Value;
        
        // Verify we have materials from both copper pipe and duct system installations
        Assert.Contains(mbomItems, item => item.MaterialType.Contains("Copper"));
        Assert.Contains(mbomItems, item => item.MaterialType.Contains("Duct"));
        Assert.Contains(mbomItems, item => item.MaterialType.Contains("Hanger"));
        
        // Verify quantities are calculated (not hardcoded)
        var copperPipeItem = mbomItems.FirstOrDefault(item => item.MaterialType == "Copper pipe 12mm");
        Assert.NotNull(copperPipeItem);
        Assert.Equal(43, copperPipeItem.TotalQuantity); // Should match the EBOM quantity for raw materials
        
        // Verify all items have proper categorization
        Assert.All(mbomItems, item => 
        {
            Assert.NotEmpty(item.Category);
            Assert.NotEmpty(item.Unit);
            Assert.True(item.TotalQuantity > 0);
        });
    }
}

public class MbomItem
{
    public string MaterialType { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
