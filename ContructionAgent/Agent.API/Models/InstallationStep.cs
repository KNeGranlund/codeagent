namespace Agent.API.Models;

public class InstallationStep
{
    public string StepName { get; set; } = string.Empty;
    public bool IsFixed { get; set; }
    public double BaseHours { get; set; }
    public Dictionary<string, int> RequiredWorkers { get; set; } = new Dictionary<string, int>();
    public List<string> RequiredTools { get; set; } = new List<string>();
    public Dictionary<string, double> RequiredMaterials { get; set; } = new Dictionary<string, double>();
    public int MaterialLeadTime { get; set; }
    public List<string> PrecedingSteps { get; set; } = new List<string>();
}
