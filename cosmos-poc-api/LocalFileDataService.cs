using System.Linq.Expressions;
// This service simulates data retrieval from a local source (in-memory list)
public class LocalFileDataService : IDataService
{
    private List<CosmosItem> _items;
    private readonly object _lock = new object(); // For thread-safe operations

    public LocalFileDataService()
    {
        _items = new List<CosmosItem>();
        SeedLocalData(); // Populate data on service initialization
    }

    // Simulates adding an item (adds to in-memory list)
    public Task AddItemAsync(CosmosItem item)
    {
        lock (_lock)
        {
            _items.Add(item);
        }
        return Task.CompletedTask;
    }

    // Simulates getting items with pagination, sorting, filtering, and searching
    public Task<GridResponse> GetItemsAsync(GridRequest request)
    {
        IQueryable<CosmosItem> query = _items.AsQueryable();

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
                // Use PropertyInfo to dynamically get property for LINQ OrderBy/ThenBy
                var property = typeof(CosmosItem).GetProperty(sortModel.ColId, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                if (property == null) continue;

                var parameter = Expression.Parameter(typeof(CosmosItem), "item");
                var propertyAccess = Expression.Property(parameter, property);
                var expression = Expression.Lambda<Func<CosmosItem, object>>(Expression.Convert(propertyAccess, typeof(object)), parameter);

                if (sortModel.Sort == "asc")
                {
                    orderedQuery = firstSort ? query.OrderBy(expression) : orderedQuery?.ThenBy(expression);
                }
                else
                {
                    orderedQuery = firstSort ? query.OrderByDescending(expression) : orderedQuery?.ThenByDescending(expression);
                }
                firstSort = false;
            }
            query = orderedQuery ?? query;
        }
        else
        {
            // Default order if no sort model is provided
            query = query.OrderBy(item => item.Id);
        }

        // Get total count (before pagination)
        int totalCount = query.Count();

        // Apply pagination
        int skip = request.StartRow;
        int take = request.EndRow - request.StartRow;

        List<CosmosItem> items = query.Skip(skip).Take(take).ToList();

        return Task.FromResult(new GridResponse
        {
            Data = items,
            TotalRowCount = totalCount
        });
    }

    // Simulates getting all items (returns the full in-memory list)
    public Task<List<CosmosItem>> GetAllItemsAsync()
    {
        return Task.FromResult(_items.ToList()); // Return a copy to prevent external modification
    }

    // Populates the in-memory list with 1 million records
    private void SeedLocalData()
    {
        if (_items.Any())
        {
            Console.WriteLine("Local data already seeded. Skipping local data seeding.");
            return;
        }

        Console.WriteLine("Seeding 1,000,000 records locally in-memory...");
        var random = new Random();
        var startDate = DateTime.UtcNow.AddYears(-2); // 2 years ago
        var endDate = DateTime.UtcNow.AddMonths(6);   // 6 months from now
        var timeRange = endDate - startDate;
        int totalRecords = 1_000_000;

        for (int i = 0; i < totalRecords; i++)
        {
            var randomDays = random.NextDouble() * timeRange.TotalDays;
            var randomDate = startDate.AddDays(randomDays);

            _items.Add(new CosmosItem
            {
                Id = Guid.NewGuid().ToString(),
                Name = $"Item {i}",
                Category = $"Category {i % 10}",
                Value = random.Next(1, 10000),
                Description = $"This is a description for item {i}. It belongs to category {i % 10}.",
                Date = randomDate
            });

            if ((i + 1) % 100000 == 0) // Log progress every 100k records
            {
                Console.WriteLine($"Seeded {i + 1} local records...");
            }
        }
        Console.WriteLine("Local data seeding complete.");
    }
}

