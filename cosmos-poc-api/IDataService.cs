public interface IDataService
{
    Task AddItemAsync(CosmosItem item);
    Task<GridResponse> GetItemsAsync(GridRequest request);
    Task<List<CosmosItem>> GetAllItemsAsync();
    // Removed GetContainer as it was specific to CosmosDbService's seeding logic
}

