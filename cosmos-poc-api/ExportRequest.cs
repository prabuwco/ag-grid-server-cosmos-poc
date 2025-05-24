
// Represents the request payload for exporting currently visible records.
public class ExportRequest
{
    public List<CosmosItem> Records { get; set; } = new List<CosmosItem>();
    public List<string> ColumnKeys { get; set; } = new List<string>(); // Keys of columns to export
}

