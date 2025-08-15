namespace Agent.API.Models;

public class MaterialInstallation
{
    public string MaterialType { get; set; } = string.Empty;
    public List<InstallationStep> InstallationSteps { get; set; } = new List<InstallationStep>();

    public static Dictionary<string, MaterialInstallation> GetAllMaterialInstallations()
    {
        var installations = new Dictionary<string, MaterialInstallation>();
        
        // Copper pipe installation
        var copperPipeInstallation = new MaterialInstallation
        {
            MaterialType = "Copper pipe 12mm",
            InstallationSteps = new List<InstallationStep>
            {
                new InstallationStep
                {
                    StepName = "Mark locations",
                    IsFixed = false,
                    BaseHours = 0.5,
                    RequiredWorkers = new Dictionary<string, int> { { "Plumber", 1 } },
                    RequiredTools = new List<string> { "Measuring tape", "Marker" },
                    RequiredMaterials = new Dictionary<string, double>(),
                    MaterialLeadTime = 0,
                    PrecedingSteps = new List<string>()
                },
                new InstallationStep
                {
                    StepName = "Drill hangers",
                    IsFixed = false,
                    BaseHours = 1.5,
                    RequiredWorkers = new Dictionary<string, int> { { "Plumber", 1 } },
                    RequiredTools = new List<string> { "Drill", "Level" },
                    RequiredMaterials = new Dictionary<string, double> { { "Hangers", 1 }, { "Screws", 2 } },
                    MaterialLeadTime = 5,
                    PrecedingSteps = new List<string> { "Mark locations" }
                },
                new InstallationStep
                {
                    StepName = "Cut pipes",
                    IsFixed = false,
                    BaseHours = 0.5,
                    RequiredWorkers = new Dictionary<string, int> { { "Plumber", 1 } },
                    RequiredTools = new List<string> { "Pipe cutter", "Measuring tape" },
                    RequiredMaterials = new Dictionary<string, double> { { "Copper pipe 12mm", 1 } },
                    MaterialLeadTime = 5,
                    PrecedingSteps = new List<string> { "Drill hangers" }
                },
                new InstallationStep
                {
                    StepName = "Install pipe",
                    IsFixed = false,
                    BaseHours = 0.8,
                    RequiredWorkers = new Dictionary<string, int> { { "Plumber", 1 } },
                    RequiredTools = new List<string> { "Wrench", "Pipe wrench" },
                    RequiredMaterials = new Dictionary<string, double> { { "Fittings", 0.2 }, { "Solder", 0.1 } },
                    MaterialLeadTime = 5,
                    PrecedingSteps = new List<string> { "Cut pipes" }
                },
                new InstallationStep
                {
                    StepName = "Pressure test",
                    IsFixed = true,
                    BaseHours = 3,
                    RequiredWorkers = new Dictionary<string, int> { { "Plumber", 1 } },
                    RequiredTools = new List<string> { "Pressure tester" },
                    RequiredMaterials = new Dictionary<string, double>(),
                    MaterialLeadTime = 0,
                    PrecedingSteps = new List<string> { "Install pipe" }
                },
                new InstallationStep
                {
                    StepName = "Flush pipes",
                    IsFixed = true,
                    BaseHours = 2,
                    RequiredWorkers = new Dictionary<string, int> { { "Plumber", 1 } },
                    RequiredTools = new List<string> { "Wrench" },
                    RequiredMaterials = new Dictionary<string, double>(),
                    MaterialLeadTime = 0,
                    PrecedingSteps = new List<string> { "Pressure test" }
                },
                new InstallationStep
                {
                    StepName = "Insulate pipes",
                    IsFixed = false,
                    BaseHours = 0.3,
                    RequiredWorkers = new Dictionary<string, int> { { "Plumber", 1 } },
                    RequiredTools = new List<string> { "Utility knife" },
                    RequiredMaterials = new Dictionary<string, double> { { "Pipe insulation", 1 } },
                    MaterialLeadTime = 3,
                    PrecedingSteps = new List<string> { "Flush pipes" }
                }
            }
        };
        installations.Add(copperPipeInstallation.MaterialType, copperPipeInstallation);
        
        // Duct system installation
        var ductSystemInstallation = new MaterialInstallation
        {
            MaterialType = "Duct system",
            InstallationSteps = new List<InstallationStep>
            {
                new InstallationStep
                {
                    StepName = "Layout planning",
                    IsFixed = true,
                    BaseHours = 2,
                    RequiredWorkers = new Dictionary<string, int> { { "HVAC technician", 1 } },
                    RequiredTools = new List<string> { "Measuring tape", "Marker" },
                    RequiredMaterials = new Dictionary<string, double>(),
                    MaterialLeadTime = 0,
                    PrecedingSteps = new List<string>()
                },
                new InstallationStep
                {
                    StepName = "Assemble ducts",
                    IsFixed = false,
                    BaseHours = 1,
                    RequiredWorkers = new Dictionary<string, int> { { "HVAC technician", 1 } },
                    RequiredTools = new List<string> { "Screwdriver", "Tin snips" },
                    RequiredMaterials = new Dictionary<string, double> { { "Duct pieces", 1 }, { "Sheet metal screws", 8 } },
                    MaterialLeadTime = 5,
                    PrecedingSteps = new List<string> { "Layout planning" }
                },
                new InstallationStep
                {
                    StepName = "Install supports",
                    IsFixed = false,
                    BaseHours = 0.8,
                    RequiredWorkers = new Dictionary<string, int> { { "HVAC technician", 1 } },
                    RequiredTools = new List<string> { "Drill", "Level" },
                    RequiredMaterials = new Dictionary<string, double> { { "Support brackets", 0.5 }, { "Screws", 4 } },
                    MaterialLeadTime = 5,
                    PrecedingSteps = new List<string> { "Layout planning" }
                },
                new InstallationStep
                {
                    StepName = "Install ducts",
                    IsFixed = false,
                    BaseHours = 1.5,
                    RequiredWorkers = new Dictionary<string, int> { { "HVAC technician", 2 } },
                    RequiredTools = new List<string> { "Drill", "Screwdriver", "Ladder" },
                    RequiredMaterials = new Dictionary<string, double> { { "Fasteners", 10 } },
                    MaterialLeadTime = 5,
                    PrecedingSteps = new List<string> { "Assemble ducts", "Install supports" }
                },
                new InstallationStep
                {
                    StepName = "Seal joints",
                    IsFixed = false,
                    BaseHours = 1,
                    RequiredWorkers = new Dictionary<string, int> { { "HVAC technician", 1 } },
                    RequiredTools = new List<string> { "Sealant gun", "Brush" },
                    RequiredMaterials = new Dictionary<string, double> { { "Sealant", 0.5 }, { "Duct tape", 2 } },
                    MaterialLeadTime = 3,
                    PrecedingSteps = new List<string> { "Install ducts" }
                },
                new InstallationStep
                {
                    StepName = "Insulate ducts",
                    IsFixed = false,
                    BaseHours = 0.8,
                    RequiredWorkers = new Dictionary<string, int> { { "HVAC technician", 1 } },
                    RequiredTools = new List<string> { "Utility knife", "Tape measure" },
                    RequiredMaterials = new Dictionary<string, double> { { "Duct insulation", 1 } },
                    MaterialLeadTime = 3,
                    PrecedingSteps = new List<string> { "Seal joints" }
                },
                new InstallationStep
                {
                    StepName = "Test airflow",
                    IsFixed = true,
                    BaseHours = 3,
                    RequiredWorkers = new Dictionary<string, int> { { "HVAC technician", 1 } },
                    RequiredTools = new List<string> { "Airflow meter" },
                    RequiredMaterials = new Dictionary<string, double>(),
                    MaterialLeadTime = 0,
                    PrecedingSteps = new List<string> { "Insulate ducts" }
                }
            }
        };
        installations.Add(ductSystemInstallation.MaterialType, ductSystemInstallation);
        
        return installations;
    }
}
