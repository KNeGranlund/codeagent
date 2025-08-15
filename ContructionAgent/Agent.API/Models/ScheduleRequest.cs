using Agent.API.Models;

namespace Agent.API.Models;

public class ScheduleRequest
{
    public List<BomItem> BomItems { get; set; } = new();
    public DateTime ProjectStartDate { get; set; } = DateTime.Now;
}
