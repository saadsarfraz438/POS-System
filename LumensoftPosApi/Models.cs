namespace LumensoftPosApi.Models;

public class Product
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal RetailPrice { get; set; }
    public string? ImageUrl { get; set; }
    public string? Comment { get; set; }
    public string Status { get; set; } = "Active";
}

public class Salesperson
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string Status { get; set; } = "Active";
}

public class SaleItem
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
}

public class Sale
{
    public int Id { get; set; }
    public string InvoiceNo { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public int SalespersonId { get; set; }
    public string SalespersonName { get; set; } = string.Empty;
    public decimal GrandTotal { get; set; }
    public List<SaleItem> Items { get; set; } = new();
}
