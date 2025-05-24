using System.Linq.Expressions;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using Container = Microsoft.Azure.Cosmos.Container;

public class CosmosDbService : IDataService
{
    private readonly Container _container;

    public CosmosDbService(
        CosmosClient cosmosClient,
        string databaseName,
        string containerName)
    {
        _container = cosmosClient.GetContainer(databaseName, containerName);
    }

    public async Task AddItemAsync(CosmosItem item)
    {
        await _container.CreateItemAsync(item, new PartitionKey(item.Id));
    }

    // Helper method, might not be needed if seeding is handled externally or differently
    public Container GetContainer(string containerId)
    {
        return _container;
    }

    // This method handles server-side pagination, sorting, filtering, and searching for Cosmos DB.
    public async Task<GridResponse> GetItemsAsync(GridRequest request)
    {
        IQueryable<CosmosItem> query = _container.GetItemLinqQueryable<CosmosItem>();

        // Apply global search
        if (!string.IsNullOrWhiteSpace(request.SearchQuery))
        {
            string searchQueryLower = request.SearchQuery.ToLower();
            query = query.Where(item =>
                item.Name.ToLower().Contains(searchQueryLower) ||
                item.Category.ToLower().Contains(searchQueryLower) ||
                item.Description.ToLower().Contains(searchQueryLower) ||
                item.Value.ToString().Contains(searchQueryLower) ||
                item.Date.ToString().ToLower().Contains(searchQueryLower)
            );
        }

        // Apply column filters
        if (request.FilterModel != null && request.FilterModel.Any())
        {
            foreach (var filterEntry in request.FilterModel)
            {
                string colId = filterEntry.Key;
                FilterModel filter = filterEntry.Value;

                switch (filter.FilterType)
                {
                    case "text":
                        if (!string.IsNullOrWhiteSpace(filter.Filter))
                        {
                            string filterValueLower = filter.Filter.ToLower();
                            switch (colId.ToLower())
                            {
                                case "name":
                                    query = query.Where(item => item.Name.ToLower().Contains(filterValueLower));
                                    break;
                                case "category":
                                    query = query.Where(item => item.Category.ToLower().Contains(filterValueLower));
                                    break;
                                case "description":
                                    query = query.Where(item => item.Description.ToLower().Contains(filterValueLower));
                                    break;
                                case "value":
                                    if (int.TryParse(filter.Filter, out int intValue))
                                    {
                                        query = query.Where(item => item.Value == intValue);
                                    }
                                    break;
                                case "date":
                                    query = query.Where(item => item.Date.ToString().ToLower().Contains(filterValueLower));
                                    break;
                            }
                        }
                        break;
                    case "set":
                        if (filter.Values != null && filter.Values.Any())
                        {
                            switch (colId.ToLower())
                            {
                                case "category":
                                    query = query.Where(item => filter.Values.Contains(item.Category));
                                    break;
                            }
                        }
                        break;
                }
            }
        }

        // Apply sorting
        if (request.SortModel != null && request.SortModel.Any())
        {
            IOrderedQueryable<CosmosItem>? orderedQuery = null;
            bool firstSort = true;

            foreach (var sortModel in request.SortModel)
            {
                Expression<Func<CosmosItem, object>> keySelector = sortModel.ColId.ToLower() switch
                {
                    "name" => item => item.Name,
                    "category" => item => item.Category,
                    "value" => item => item.Value,
                    "date" => item => item.Date,
                    _ => item => item.Id
                };

                if (sortModel.Sort == "asc")
                {
                    orderedQuery = firstSort ? query.OrderBy(keySelector) : orderedQuery?.ThenBy(keySelector);
                }
                else
                {
                    orderedQuery = firstSort ? query.OrderByDescending(keySelector) : orderedQuery?.ThenByDescending(keySelector);
                }
                firstSort = false;
            }
            query = orderedQuery ?? query;
        }
        else
        {
            query = query.OrderBy(item => item.Id);
        }

        int totalCount = await query.CountAsync();

        int skip = request.StartRow;
        int take = request.EndRow - request.StartRow;

        query = query.Skip(skip).Take(take);

        List<CosmosItem> items = new List<CosmosItem>();
        using (FeedIterator<CosmosItem> feedIterator = query.ToFeedIterator())
        {
            while (feedIterator.HasMoreResults)
            {
                foreach (var item in await feedIterator.ReadNextAsync())
                {
                    items.Add(item);
                }
            }
        }

        return new GridResponse
        {
            Data = items,
            TotalRowCount = totalCount
        };
    }

    public async Task<List<CosmosItem>> GetAllItemsAsync()
    {
        List<CosmosItem> items = new List<CosmosItem>();
        using (FeedIterator<CosmosItem> feedIterator = _container.GetItemLinqQueryable<CosmosItem>()
                                                                 .OrderBy(item => item.Id)
                                                                 .ToFeedIterator())
        {
            while (feedIterator.HasMoreResults)
            {
                foreach (var item in await feedIterator.ReadNextAsync())
                {
                    items.Add(item);
                }
            }
        }
        return items;
    }
}

