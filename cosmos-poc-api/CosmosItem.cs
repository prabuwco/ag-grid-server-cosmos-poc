using Newtonsoft.Json;

public class CosmosItem
{
    [JsonProperty("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("category")]
    public string Category { get; set; } = string.Empty;

    [JsonProperty("value")]
    public int Value { get; set; }


    [JsonProperty("date")]
    public DateTime Date { get; set; }

    [JsonProperty("description")]
    public string Description { get; set; } = string.Empty;
}

