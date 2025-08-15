using Microsoft.AspNetCore.Mvc.Testing;
using System.Text.Json;
using Agent.API.Models;

namespace Agent.API.Tests;

public class BomControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public BomControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetEbom_ReturnsExpectedItems()
    {
        // Act
        var response = await _client.GetAsync("/api/Ebom");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var jsonContent = await response.Content.ReadAsStringAsync();
        var items = JsonSerializer.Deserialize<List<BomItem>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        Assert.NotNull(items);
        Assert.Equal(2, items.Count);
        Assert.Contains(items, item => item.Type == "Copper pipe 12mm" && item.Quantity == 43);
        Assert.Contains(items, item => item.Type == "Duct system" && item.Quantity == 10);
    }

    [Fact]
    public async Task GetMbom_ReturnsExpectedItems()
    {
        // Act
        var response = await _client.GetAsync("/api/Mbom");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var jsonContent = await response.Content.ReadAsStringAsync();
        var items = JsonSerializer.Deserialize<List<BomItem>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        Assert.NotNull(items);
        Assert.Equal(14, items.Count);
        Assert.Contains(items, item => item.Type == "Duct pieces" && item.Quantity == 10);
        Assert.Contains(items, item => item.Type == "Copper pipe 12mm" && item.Quantity == 43);
    }

    [Fact]
    public async Task GetEbomByLocation_ReturnsCorrectItems()
    {
        // Act
        var response = await _client.GetAsync("/api/Ebom/by-location/Hall 2");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var jsonContent = await response.Content.ReadAsStringAsync();
        var items = JsonSerializer.Deserialize<List<BomItem>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        Assert.NotNull(items);
        Assert.Single(items);
        Assert.Equal("Copper pipe 12mm", items[0].Type);
        Assert.Equal("Hall 2", items[0].Location);
    }

    [Fact]
    public async Task GetMbomByLocation_ReturnsCorrectItems()
    {
        // Act
        var response = await _client.GetAsync("/api/Mbom/by-location/Room 5");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var jsonContent = await response.Content.ReadAsStringAsync();
        var items = JsonSerializer.Deserialize<List<BomItem>>(jsonContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        
        Assert.NotNull(items);
        Assert.True(items.Count > 0);
        Assert.All(items, item => Assert.Equal("Room 5", item.Location));
    }

    [Fact]
    public async Task GetMbomSummary_ReturnsCorrectSummary()
    {
        // Act
        var response = await _client.GetAsync("/api/Mbom/summary");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var jsonContent = await response.Content.ReadAsStringAsync();
        
        Assert.NotNull(jsonContent);
        Assert.Contains("MaterialType", jsonContent);
        Assert.Contains("TotalQuantity", jsonContent);
        Assert.Contains("Locations", jsonContent);
    }

    [Fact]
    public async Task GetEbomByLocation_NonExistentLocation_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/Ebom/by-location/NonExistentLocation");
        
        // Assert
        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
    }
}
