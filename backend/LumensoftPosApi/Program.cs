using LumensoftPosApi.Data;
using LumensoftPosApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("LumensoftConnection")
    ?? "Server=(localdb)\\MSSQLLocalDB;Database=LumensoftPosDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";
builder.Services.AddDbContext<LumensoftDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LumensoftDbContext>();
    db.Database.EnsureCreated();

    if (!db.Products.Any())
    {
        db.Products.AddRange(
            new Product { Code = "P-001", Name = "Laptop", CostPrice = 85000, RetailPrice = 105000, ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80", Comment = "Business laptop", EnteredDate = DateTime.Today, CreationDate = DateTime.UtcNow, Status = "Active" },
            new Product { Code = "P-002", Name = "Laptop Bag", CostPrice = 3000, RetailPrice = 4500, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80", Comment = "Premium bag", EnteredDate = DateTime.Today, CreationDate = DateTime.UtcNow, Status = "Active" },
            new Product { Code = "P-003", Name = "Mouse", CostPrice = 1200, RetailPrice = 1800, ImageUrl = "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=300&q=80", Comment = "Ergonomic mouse", EnteredDate = DateTime.Today, CreationDate = DateTime.UtcNow, Status = "Active" }
        );
    }

    if (!db.Salespersons.Any())
    {
        db.Salespersons.AddRange(
            new Salesperson { Code = "SP-001", Name = "Ahmed Khan", EnteredDate = DateTime.Today, Phone = "03001234567", Email = "ahmed@lumensoft.com", Address = "Lahore", Status = "Active" },
            new Salesperson { Code = "SP-002", Name = "Sana Ali", EnteredDate = DateTime.Today, Phone = "03009876543", Email = "sana@lumensoft.com", Address = "Karachi", Status = "Active" }
        );
    }

    db.SaveChanges();
}

app.MapGet("/api/products", async (LumensoftDbContext db) => await db.Products.OrderBy(p => p.Code).ToListAsync());
app.MapPost("/api/products", async (Product product, LumensoftDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(product.Code) || string.IsNullOrWhiteSpace(product.Name))
    {
        return Results.BadRequest(new { message = "Product code and name are required." });
    }

    if (product.CostPrice <= 0 || product.RetailPrice <= 0)
    {
        return Results.BadRequest(new { message = "Cost price and retail price must be greater than zero." });
    }

    if (product.RetailPrice <= product.CostPrice)
    {
        return Results.BadRequest(new { message = "Retail price must be greater than cost price." });
    }

    var normalizedCode = product.Code.Trim().ToLowerInvariant();
    var duplicate = await db.Products.AnyAsync(p => p.Code.ToLower() == normalizedCode);
    if (duplicate)
    {
        return Results.Conflict(new { message = "Product code already exists." });
    }

    product.Code = product.Code.Trim();
    product.Name = product.Name.Trim();
    product.Comment = product.Comment?.Trim();
    product.EnteredDate = product.EnteredDate == default ? DateTime.Today : product.EnteredDate.Date;
    product.CreationDate = DateTime.UtcNow;
    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{product.Id}", product);
});
app.MapPut("/api/products/{id}", async (string id, Product updated, LumensoftDbContext db) =>
{
    var existing = await db.Products.FindAsync(id);
    if (existing is null) return Results.NotFound();

    if (string.IsNullOrWhiteSpace(updated.Code) || string.IsNullOrWhiteSpace(updated.Name))
    {
        return Results.BadRequest(new { message = "Product code and name are required." });
    }

    if (updated.CostPrice <= 0 || updated.RetailPrice <= 0)
    {
        return Results.BadRequest(new { message = "Cost price and retail price must be greater than zero." });
    }

    if (updated.RetailPrice <= updated.CostPrice)
    {
        return Results.BadRequest(new { message = "Retail price must be greater than cost price." });
    }

    var duplicate = await db.Products.AnyAsync(p => p.Code != id && p.Code.ToLower() == updated.Code.Trim().ToLower());
    if (duplicate)
    {
        return Results.Conflict(new { message = "Product code already exists." });
    }

    existing.Code = updated.Code.Trim();
    existing.Name = updated.Name.Trim();
    existing.CostPrice = updated.CostPrice;
    existing.RetailPrice = updated.RetailPrice;
    existing.ImageUrl = updated.ImageUrl?.Trim();
    existing.Comment = updated.Comment?.Trim();
    existing.EnteredDate = updated.EnteredDate == default ? existing.EnteredDate : updated.EnteredDate.Date;
    existing.Status = updated.Status;
    await db.SaveChangesAsync();
    return Results.Ok(existing);
});
app.MapDelete("/api/products/{id}", async (string id, LumensoftDbContext db) =>
{
    var existing = await db.Products.FindAsync(id);
    if (existing is null) return Results.NotFound();

    var isReferenced = await db.SaleDetails.AnyAsync(item => item.ProductId == id);
    if (isReferenced)
    {
        return Results.Conflict(new { message = "Product cannot be deleted because it is already used in a sale." });
    }

    db.Products.Remove(existing);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/api/salespersons", async (LumensoftDbContext db) => await db.Salespersons.OrderBy(s => s.Code).ToListAsync());
app.MapPost("/api/salespersons", async (Salesperson salesperson, LumensoftDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(salesperson.Code) || string.IsNullOrWhiteSpace(salesperson.Name) || string.IsNullOrWhiteSpace(salesperson.Phone) || string.IsNullOrWhiteSpace(salesperson.Email) || string.IsNullOrWhiteSpace(salesperson.Address))
    {
        return Results.BadRequest(new { message = "Salesperson code, name, phone, email, and address are required." });
    }

    var duplicateCode = await db.Salespersons.AnyAsync(s => s.Code.ToLower() == salesperson.Code.Trim().ToLower());
    var duplicatePhone = await db.Salespersons.AnyAsync(s => s.Phone.ToLower() == salesperson.Phone.Trim().ToLower());
    var duplicateEmail = await db.Salespersons.AnyAsync(s => s.Email.ToLower() == salesperson.Email.Trim().ToLower());
    if (duplicateCode || duplicatePhone || duplicateEmail)
    {
        return Results.Conflict(new { message = "Salesperson code, phone, or email already exists." });
    }

    salesperson.Code = salesperson.Code.Trim();
    salesperson.Name = salesperson.Name.Trim();
    salesperson.EnteredDate = salesperson.EnteredDate == default ? DateTime.Today : salesperson.EnteredDate.Date;
    salesperson.Phone = salesperson.Phone.Trim();
    salesperson.Email = salesperson.Email.Trim();
    salesperson.Address = salesperson.Address.Trim();
    db.Salespersons.Add(salesperson);
    await db.SaveChangesAsync();
    return Results.Created($"/api/salespersons/{salesperson.Id}", salesperson);
});
app.MapPut("/api/salespersons/{id}", async (int id, Salesperson updated, LumensoftDbContext db) =>
{
    var existing = await db.Salespersons.FindAsync(id);
    if (existing is null) return Results.NotFound();

    if (string.IsNullOrWhiteSpace(updated.Code) || string.IsNullOrWhiteSpace(updated.Name) || string.IsNullOrWhiteSpace(updated.Phone) || string.IsNullOrWhiteSpace(updated.Email) || string.IsNullOrWhiteSpace(updated.Address))
    {
        return Results.BadRequest(new { message = "Salesperson code, name, phone, email, and address are required." });
    }

    var duplicateCode = await db.Salespersons.AnyAsync(s => s.Id != id && s.Code.ToLower() == updated.Code.Trim().ToLower());
    var duplicatePhone = await db.Salespersons.AnyAsync(s => s.Id != id && s.Phone.ToLower() == updated.Phone.Trim().ToLower());
    var duplicateEmail = await db.Salespersons.AnyAsync(s => s.Id != id && s.Email.ToLower() == updated.Email.Trim().ToLower());
    if (duplicateCode || duplicatePhone || duplicateEmail)
    {
        return Results.Conflict(new { message = "Salesperson code, phone, or email already exists." });
    }

    existing.Code = updated.Code.Trim();
    existing.Name = updated.Name.Trim();
    existing.EnteredDate = updated.EnteredDate == default ? existing.EnteredDate : updated.EnteredDate.Date;
    existing.Phone = updated.Phone.Trim();
    existing.Email = updated.Email.Trim();
    existing.Address = updated.Address.Trim();
    existing.Status = updated.Status;
    await db.SaveChangesAsync();
    return Results.Ok(existing);
});
app.MapDelete("/api/salespersons/{id}", async (int id, LumensoftDbContext db) =>
{
    var existing = await db.Salespersons.FindAsync(id);
    if (existing is null) return Results.NotFound();
    db.Salespersons.Remove(existing);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/api/sales", async (LumensoftDbContext db) => await db.Sales
    .AsNoTracking()
    .OrderByDescending(s => s.SaleDate)
    .Select(s => new
    {
        id = s.Id,
        invoiceNo = s.InvoiceNo,
        saleDate = s.SaleDate,
        salespersonId = s.SalespersonId,
        salespersonName = s.SalespersonName,
        grandTotal = s.Total,
        items = s.Items.Select(item => new
        {
            id = item.Id,
            saleId = item.SaleId,
            productId = item.ProductId,
            retailPrice = item.RetailPrice,
            quantity = item.Quantity,
            discount = item.Discount,
            total = item.Total
        }).ToList()
    })
    .ToListAsync());
app.MapPost("/api/sales", async (Sale sale, LumensoftDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(sale.InvoiceNo))
    {
        return Results.BadRequest(new { message = "Invoice number is required." });
    }

    if (sale.Items.Count == 0)
    {
        return Results.BadRequest(new { message = "At least one product is required." });
    }

    if (sale.SaleDate.Date != DateTime.Today)
    {
        return Results.BadRequest(new { message = "Sale date must be today." });
    }

    if (sale.Items.Any(item => item.Quantity <= 0))
    {
        return Results.BadRequest(new { message = "Each product quantity must be greater than zero." });
    }

    if (sale.Items.Any(item => item.Discount < 0 || item.Discount > (item.RetailPrice * item.Quantity)))
    {
        return Results.BadRequest(new { message = "Discount must be zero or more and cannot exceed the line total." });
    }

    var salesperson = await db.Salespersons.FindAsync(sale.SalespersonId);
    if (salesperson is null)
    {
        return Results.BadRequest(new { message = "Selected salesperson was not found." });
    }

    if (!string.Equals(salesperson.Status?.Trim(), "Active", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { message = "Selected salesperson is inactive." });
    }

    var productIds = sale.Items.Select(item => item.ProductId).Distinct().ToList();
    var products = await db.Products.Where(product => productIds.Contains(product.Code)).ToListAsync();
    if (products.Count != productIds.Count)
    {
        return Results.BadRequest(new { message = "One or more selected products were not found." });
    }

    if (products.Any(product => !string.Equals(product.Status?.Trim(), "Active", StringComparison.OrdinalIgnoreCase)))
    {
        return Results.BadRequest(new { message = "One or more selected products are inactive." });
    }

    var duplicateInvoice = await db.Sales.AnyAsync(s => s.InvoiceNo.ToLower() == sale.InvoiceNo.Trim().ToLower());
    if (duplicateInvoice)
    {
        return Results.Conflict(new { message = "Invoice number already exists." });
    }

    sale.InvoiceNo = sale.InvoiceNo.Trim();
    sale.SaleDate = DateTime.Today;
    sale.Total = sale.Items.Sum(item => item.Total);
    db.Sales.Add(sale);
    await db.SaveChangesAsync();
    return Results.Created($"/api/sales/{sale.Id}", new
    {
        id = sale.Id,
        invoiceNo = sale.InvoiceNo,
        saleDate = sale.SaleDate,
        salespersonId = sale.SalespersonId,
        salespersonName = sale.SalespersonName,
        grandTotal = sale.Total,
        items = sale.Items.Select(item => new
        {
            id = item.Id,
            saleId = item.SaleId,
            productId = item.ProductId,
            retailPrice = item.RetailPrice,
            quantity = item.Quantity,
            discount = item.Discount,
            total = item.Total
        })
    });
});
app.MapDelete("/api/sales/{id}", async (int id, LumensoftDbContext db) =>
{
    var existing = await db.Sales.Include(s => s.Items).FirstOrDefaultAsync(s => s.Id == id);
    if (existing is null) return Results.NotFound();
    db.SaleDetails.RemoveRange(existing.Items);
    db.Sales.Remove(existing);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
