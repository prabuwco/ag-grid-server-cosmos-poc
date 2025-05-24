public interface IExcelService
{
    byte[] ExportToExcel(List<CosmosItem> records, List<string> columnKeys);
}

