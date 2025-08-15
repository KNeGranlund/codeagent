using Agent.API.Models;
using Agent.API.Services.Interfaces;

namespace Agent.API.Services;

public class BomService : IBomService
{
    public List<BomItem> GetEbomItems()
    {
        return new List<BomItem>
        {
            new BomItem { Type = "Copper pipe 12mm", Quantity = 43, Location = "Hall 2" },
            new BomItem { Type = "Duct system", Quantity = 10, Location = "Room 5" }
        };
    }

    public List<MbomItem> GenerateMbomFromEbom(List<BomItem> ebomItems)
    {
        var mbomItems = new List<MbomItem>();
        var materialInstallations = MaterialInstallation.GetAllMaterialInstallations();

        foreach (var ebomItem in ebomItems)
        {
            if (materialInstallations.TryGetValue(ebomItem.Type, out var installation))
            {
                foreach (var step in installation.InstallationSteps)
                {
                    foreach (var material in step.RequiredMaterials)
                    {
                        double quantity;
                        
                        // Calculate quantity based on whether the step is fixed or scales with EBOM quantity
                        if (step.IsFixed)
                        {
                            quantity = material.Value;
                        }
                        else
                        {
                            quantity = material.Value * ebomItem.Quantity;
                        }

                        // Find existing MBOM item or create new one
                        var existingItem = mbomItems.FirstOrDefault(m => m.Material == material.Key);
                        if (existingItem != null)
                        {
                            existingItem.Quantity += quantity;
                            existingItem.Source += $", {ebomItem.Type}";
                        }
                        else
                        {
                            mbomItems.Add(new MbomItem
                            {
                                Material = material.Key,
                                Quantity = quantity,
                                Unit = GetMaterialUnit(material.Key),
                                Source = ebomItem.Type
                            });
                        }
                    }
                }
            }
        }

        return mbomItems.OrderBy(m => m.Material).ToList();
    }

    private string GetMaterialUnit(string materialName)
    {
        return materialName.ToLower() switch
        {
            var name when name.Contains("pipe") => "meters",
            var name when name.Contains("screws") => "pieces",
            var name when name.Contains("hangers") => "pieces",
            var name when name.Contains("fittings") => "pieces",
            var name when name.Contains("solder") => "kg",
            var name when name.Contains("insulation") => "meters",
            var name when name.Contains("duct pieces") => "pieces",
            var name when name.Contains("brackets") => "pieces",
            var name when name.Contains("fasteners") => "pieces",
            var name when name.Contains("sealant") => "liters",
            var name when name.Contains("tape") => "rolls",
            _ => "units"
        };
    }
}
