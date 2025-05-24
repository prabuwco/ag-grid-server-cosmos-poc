using Newtonsoft.Json;
// Represents the request payload sent by AG Grid for server-side operations.
public class GridRequest
{
    [JsonProperty("startRow")]
    public int StartRow { get; set; }

    [JsonProperty("endRow")]
    public int EndRow { get; set; }

    [JsonProperty("sortModel")]
    public List<SortModel> SortModel { get; set; } = new List<SortModel>();

    [JsonProperty("filterModel")]
    public Dictionary<string, FilterModel> FilterModel { get; set; } = new Dictionary<string, FilterModel>();

    [JsonProperty("searchQuery")]
    public string? SearchQuery { get; set; }
}

