using Agent.API.Models;

namespace Agent.API.Services.Interfaces;

public interface IBomService
{
    List<BomItem> GetEbomItems();
    List<MbomItem> GenerateMbomFromEbom(List<BomItem> ebomItems);
}

public class MbomItem
{
    public string Material { get; set; } = string.Empty;
    public double Quantity { get; set; }
    public string Unit { get; set; } = "units";
    public string Source { get; set; } = string.Empty; // Which EBOM item generated this
}
