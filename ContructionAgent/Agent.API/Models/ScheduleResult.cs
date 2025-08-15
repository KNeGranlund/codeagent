namespace Agent.API.Models;

public class ScheduleResult
{
    public string ScheduleCsv { get; set; } = string.Empty;
    public string DeliveryCsv { get; set; } = string.Empty;
    public string CostCsv { get; set; } = string.Empty;
    public List<Task> Tasks { get; set; } = new();
    public DateTime ProjectStartDate { get; set; }
    public DateTime ProjectEndDate { get; set; }
    public double TotalProjectCost { get; set; }
}
