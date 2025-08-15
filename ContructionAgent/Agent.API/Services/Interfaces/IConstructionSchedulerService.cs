using Agent.API.Models;

namespace Agent.API.Services.Interfaces;

public interface IConstructionSchedulerService
{
    List<Models.Task> GenerateTasksFromEbom(List<BomItem> ebomItems);
    ScheduleResult GenerateCompleteSchedule(List<BomItem> ebomItems, DateTime projectStartDate);
    List<ResourceInfo> GetResourcePool();
    List<ToolInfo> GetToolPool();
    Dictionary<string, double> GetMaterialCosts();
    Dictionary<string, double> GetWorkerCosts();
}
