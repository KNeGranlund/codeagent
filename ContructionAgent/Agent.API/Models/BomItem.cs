namespace Agent.API.Models;

public class BomItem
{
    public string Type { get; set; } = string.Empty;           // e.g., "Copper pipe 12mm"
    public double Quantity { get; set; }       // e.g., 43 (meters), 10 (units)
    public string Location { get; set; } = string.Empty;       // e.g., "Hall 2"
}
