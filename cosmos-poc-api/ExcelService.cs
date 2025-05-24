using ClosedXML.Excel;
using System.Reflection;

public class ExcelService : IExcelService
{
    public byte[] ExportToExcel(List<CosmosItem> records, List<string> columnKeys)
    {
        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Data");

            // Add headers based on columnKeys
            for (int i = 0; i < columnKeys.Count; i++)
            {
                worksheet.Cell(1, i + 1).Value = columnKeys[i];
            }

            // Add data rows
            for (int row = 0; row < records.Count; row++)
            {
                var record = records[row];
                for (int col = 0; col < columnKeys.Count; col++)
                {
                    string colKey = columnKeys[col];
                    // Use reflection or a switch to get property value dynamically
                    var prop = typeof(CosmosItem).GetProperty(colKey, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop != null)
                    {
                        worksheet.Cell(row + 2, col + 1).Value = prop.GetValue(record)?.ToString();
                    }
                    else
                    {
                        // Handle cases where columnKey doesn't match a property
                        worksheet.Cell(row + 2, col + 1).Value = "N/A";
                    }
                }
            }

            worksheet.Columns().AdjustToContents(); // Auto-adjust column widths

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
        }
    }
}

