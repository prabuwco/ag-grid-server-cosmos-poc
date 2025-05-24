using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    private readonly IDataService _dataService; // Changed to IDataService
    private readonly IExcelService _excelService;
    private readonly ILogger<DataController> _logger;

    public DataController(IDataService dataService, IExcelService excelService, ILogger<DataController> logger)
    {
        _dataService = dataService;
        _excelService = excelService;
        _logger = logger;
    }

    // Endpoint for AG Grid server-side data requests
    [HttpPost("getGridData")]
    public async Task<ActionResult<GridResponse>> GetGridData([FromBody] GridRequest request)
    {
        try
        {
            _logger.LogInformation("Received grid data request: StartRow={StartRow}, EndRow={EndRow}, SearchQuery={SearchQuery}",
                request.StartRow, request.EndRow, request.SearchQuery);

            var response = await _dataService.GetItemsAsync(request); // Use IDataService
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting grid data.");
            return StatusCode(500, "Internal server error: " + ex.Message);
        }
    }

    // Endpoint to export ALL records to Excel
    [HttpGet("exportAll")]
    public async Task<IActionResult> ExportAll()
    {
        try
        {
            _logger.LogInformation("Received request to export all records.");
            var allRecords = await _dataService.GetAllItemsAsync(); // Use IDataService

            // Define column keys for export. These should match CosmosItem properties.
            var columnKeys = new List<string> { "Id", "Name", "Category", "Value", "Description", "Date" };

            var excelBytes = _excelService.ExportToExcel(allRecords, columnKeys);

            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "AllRecords.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting all records to Excel.");
            return StatusCode(500, "Internal server error: " + ex.Message);
        }
    }

    // Endpoint to export currently visible records to Excel
    [HttpPost("exportVisible")]
    public IActionResult ExportVisible([FromBody] ExportRequest request)
    {
        try
        {
            _logger.LogInformation("Received request to export visible records. Count: {Count}", request.Records.Count);
            if (request.Records == null || !request.Records.Any())
            {
                return BadRequest("No records provided for export.");
            }

            if (!request.ColumnKeys.Contains("Date", StringComparer.OrdinalIgnoreCase) && request.Records.Any())
            {
                if (request.Records.First().GetType().GetProperty("Date") != null)
                {
                    request.ColumnKeys.Add("Date");
                }
            }

            var excelBytes = _excelService.ExportToExcel(request.Records, request.ColumnKeys);

            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "VisibleRecords.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting visible records to Excel.");
            return StatusCode(500, "Internal server error: " + ex.Message);
        }
    }
}

