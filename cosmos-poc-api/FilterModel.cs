using Newtonsoft.Json;

public class FilterModel
{
    [JsonProperty("filterType")]
    public string FilterType { get; set; } = string.Empty; // e.g., 'text', 'set'

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty; // e.g., 'contains', 'equals', 'startsWith' for text filter

    [JsonProperty("filter")]
    public string? Filter { get; set; } // The filter value for text filters

    [JsonProperty("values")]
    public List<string>? Values { get; set; } // The values for set filters
}

