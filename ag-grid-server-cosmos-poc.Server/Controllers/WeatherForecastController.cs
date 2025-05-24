using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;


namespace ag_grid_server_cosmos_poc.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }


    public class ProductService : IProductService
    {
        private readonly CosmosDbContext _context;

        public ProductService(CosmosDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<Product>, string, int)> GetProductsWithCountAsync(
     int pageSize, string continuationToken, string sortBy, bool desc, string filter, string search)
        {
            var query = "SELECT * FROM c WHERE 1=1";
            if (!string.IsNullOrEmpty(search))
                query += $" AND CONTAINS(c.name, '{search}')";
            if (!string.IsNullOrEmpty(filter))
                query += $" AND c.category = '{filter}'";
            if (!string.IsNullOrEmpty(sortBy))
                query += $" ORDER BY c.{sortBy} {(desc ? "DESC" : "ASC")}";

            var queryDef = new QueryDefinition(query);
            var iterator = _context.Container.GetItemQueryIterator<Product>(queryDef, continuationToken, new QueryRequestOptions { MaxItemCount = pageSize });

            FeedResponse<Product> page = null;
            if (iterator.HasMoreResults)
                page = await iterator.ReadNextAsync();

            // Now count total matching items (only when first page for performance)
            int totalCount = 0;
            if (string.IsNullOrEmpty(continuationToken))
            {
                var countQuery = "SELECT VALUE COUNT(1) FROM c WHERE 1=1";
                if (!string.IsNullOrEmpty(search))
                    countQuery += $" AND CONTAINS(c.name, '{search}')";
                if (!string.IsNullOrEmpty(filter))
                    countQuery += $" AND c.category = '{filter}'";

                var countDef = new QueryDefinition(countQuery);
                var countIter = _context.Container.GetItemQueryIterator<int>(countDef);
                if (countIter.HasMoreResults)
                    totalCount = (await countIter.ReadNextAsync()).Resource.FirstOrDefault();
            }

            return (page?.Resource ?? [], page?.ContinuationToken, totalCount);
        }

    }


    public class Product
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public double Price { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    public class ExportRequest
    {
        public string Search { get; set; }
        public Dictionary<string, string> Filter { get; set; }
    }

    public class CosmosDbContext
    {
        private readonly CosmosClient _client;
        public Microsoft.Azure.Cosmos.Container Container { get; }

        public CosmosDbContext(IConfiguration config)
        {
            _client = new CosmosClient(config["CosmosDb:ConnectionString"]);
            Container = _client.GetContainer(config["CosmosDb:DatabaseName"], config["CosmosDb:ContainerName"]);
        }
    }

    public interface IProductService
    {
        Task<(IEnumerable<Product> Items, string ContinuationToken, int TotalCount)> GetProductsWithCountAsync(
        int pageSize, string continuationToken, string sortBy, bool desc, string filter, string search);


    }


    [ApiController]
    [Route("[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;


        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int pageSize = 50,
                                      [FromQuery] string continuationToken = null,
                                      [FromQuery] string sortBy = null,
                                      [FromQuery] bool desc = false,
                                      [FromQuery] string filter = null,
                                      [FromQuery] string search = null)
        {
            var (items, token, totalCount) = await _service.GetProductsWithCountAsync(pageSize, continuationToken, sortBy, desc, filter, search);
            return Ok(new { items, continuationToken = token, totalCount });
        }


        private readonly ILogger<ProductsController> _logger;

        public ProductsController(ILogger<ProductsController> logger, IProductService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpPost("export-visible")]
        public async Task<IActionResult> ExportVisible([FromBody] ExportRequest request)
        {
            var query = "SELECT * FROM c WHERE 1=1";
            if (!string.IsNullOrEmpty(request.Search))
                query += $" AND CONTAINS(c.name, '{request.Search}')";

            if (request.Filter != null && request.Filter.TryGetValue("category", out var catFilter))
                query += $" AND c.category = '{catFilter}'";

            var iterator = _service.Container.GetItemQueryIterator<Product>(new QueryDefinition(query));
            var products = new List<Product>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                products.AddRange(response);
            }

            using var package = new ExcelPackage();
            var sheet = package.Workbook.Worksheets.Add("VisibleRows");
            sheet.Cells.LoadFromCollection(products, true);

            return File(package.GetAsByteArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "VisibleRows.xlsx");
        }






    }
}
