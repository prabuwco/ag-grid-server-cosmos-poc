using Microsoft.Net.Http.Headers;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Configure data service based on appsettings
bool useLocalDataService = builder.Configuration.GetValue<bool>("UseLocalDataService");

if (useLocalDataService)
{
    Console.WriteLine("Using Local In-Memory Data Service.");
    builder.Services.AddSingleton<IDataService, LocalFileDataService>();
}
else
{
    Console.WriteLine("Using Azure Cosmos DB Service.");
    builder.Services.AddSingleton<IDataService>(initializeCosmosClientInstanceAsync(builder.Configuration.GetSection("CosmosDb")).GetAwaiter().GetResult());
}
// Register Excel Service
builder.Services.AddTransient<IExcelService, ExcelService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200") // Replace with your Angular app's URL
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .WithExposedHeaders(HeaderNames.ContentDisposition); // Expose Content-Disposition header for file downloads
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigin"); // Use the CORS policy

app.UseAuthorization();

app.MapControllers();

app.Run();

// Initialize Cosmos DB client and container
static async Task<CosmosDbService> initializeCosmosClientInstanceAsync(IConfigurationSection configurationSection)
{
    string databaseName = configurationSection.GetSection("DatabaseName").Value;
    string containerName = configurationSection.GetSection("ContainerName").Value;
    string account = configurationSection.GetSection("Account").Value;
    string key = configurationSection.GetSection("Key").Value;

    CosmosClient client = new CosmosClient(account, key);
    CosmosDbService cosmosDbService = new CosmosDbService(client, databaseName, containerName);
    DatabaseResponse database = await client.CreateDatabaseIfNotExistsAsync(databaseName);
    ContainerResponse container = await database.Database.CreateContainerIfNotExistsAsync(containerName, "/id"); // Assuming 'id' as partition key

    // Seed data for testing if the container is empty.
    // IMPORTANT: For 1 million records, this will take a significant amount of time and consume RUs.
    // Only uncomment and run this once to populate your database.
    await SeedData(cosmosDbService, container.Resource.Id);

    return cosmosDbService;
}

// Optional: Seed data for testing
// Seed data for testing
static async Task SeedData(CosmosDbService cosmosDbService, string containerId)
{
    // Check if the container has any items. If it's empty, proceed with seeding.
    // This check is a simple way to prevent re-seeding every time the app starts.
    // For production, you might want a more robust migration/seeding strategy.
    try
    {
        var query = cosmosDbService.GetContainer(containerId).GetItemLinqQueryable<CosmosItem>().Take(1);
        using (FeedIterator<CosmosItem> feedIterator = query.ToFeedIterator())
        {
            if (feedIterator.HasMoreResults)
            {
                var firstItem = (await feedIterator.ReadNextAsync()).FirstOrDefault();
                if (firstItem != null)
                {
                    Console.WriteLine("Container already contains data. Skipping seeding.");
                    return;
                }
            }
        }
    }
    catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
    {
        // Container might not exist yet, or other transient errors. Proceed to seed.
        Console.WriteLine($"Cosmos DB container '{containerId}' not found or other error during check. Proceeding with seeding. Error: {ex.Message}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An unexpected error occurred during container data check: {ex.Message}. Proceeding with seeding.");
    }


    Console.WriteLine("Seeding 1,000,000 records...");
    var random = new Random();
    var startDate = DateTime.UtcNow.AddYears(-2); // 2 years ago
    var endDate = DateTime.UtcNow.AddMonths(6);   // 6 months from now
    var timeRange = endDate - startDate;

    List<Task> seedTasks = new List<Task>();
    int batchSize = 1000; // Adjust batch size based on your RU/s and throughput
    int totalRecords = 1_000_000;

    for (int i = 0; i < totalRecords; i++)
    {
        // Generate a random date within the range
        var randomDays = random.NextDouble() * timeRange.TotalDays;
        var randomDate = startDate.AddDays(randomDays);

        var item = new CosmosItem
        {
            Id = Guid.NewGuid().ToString(),
            Name = $"Item {i}",
            Category = $"Category {i % 10}", // More categories for better filtering
            Value = random.Next(1, 10000),
            Description = $"This is a description for item {i}. It belongs to category {i % 10}.",
            Date = randomDate
        };

        seedTasks.Add(cosmosDbService.AddItemAsync(item));

        if (seedTasks.Count >= batchSize)
        {
            await Task.WhenAll(seedTasks);
            seedTasks.Clear();
            Console.WriteLine($"Seeded {i + 1} records...");
        }
    }

    // Await any remaining tasks
    if (seedTasks.Any())
    {
        await Task.WhenAll(seedTasks);
    }

    Console.WriteLine("Data seeding complete.");
}

