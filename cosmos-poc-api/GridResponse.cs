
// Represents the response payload sent back to AG Grid.
public class GridResponse
{
    public List<CosmosItem> Data { get; set; } = new List<CosmosItem>();
    public int TotalRowCount { get; set; }
    public string? LastContinuationToken { get; set; } // For advanced pagination if needed
}

