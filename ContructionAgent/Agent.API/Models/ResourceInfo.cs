namespace Agent.API.Models;

public class ResourceInfo
{
    public string Name { get; set; } = string.Empty;
    public int AvailableCount { get; set; }
    public double DailyCost { get; set; }
    public string Type { get; set; } = string.Empty; // Worker, Equipment, etc.
}
