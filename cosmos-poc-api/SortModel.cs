using Newtonsoft.Json;

public class SortModel
{
    [JsonProperty("colId")]
    public string ColId { get; set; } = string.Empty;

    [JsonProperty("sort")]
    public string Sort { get; set; } = string.Empty; // 'asc' or 'desc'
}

