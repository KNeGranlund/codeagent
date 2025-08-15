using System.ComponentModel.DataAnnotations;

namespace Agent.API.Models;

public class Task
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Duration { get; set; } // in days
    public List<Task> Dependencies { get; set; } = new List<Task>();
    public Dictionary<string, int> RequiredResources { get; set; } = new Dictionary<string, int>(); // worker types
    public string WorkingArea { get; set; } = string.Empty;
    public List<string> RequiredTools { get; set; } = new List<string>(); // tools needed
    public Dictionary<string, int> Materials { get; set; } = new Dictionary<string, int>(); // material name to quantity
    public int LeadTime { get; set; } // days before task start for material delivery
    public int StartTime { get; set; } // in days from project start
    public int FinishTime { get; set; }
}
