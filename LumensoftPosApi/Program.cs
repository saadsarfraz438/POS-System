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

var dbPath = Path.Combine(builder.Environment.ContentRootPath, "lumensoft.db");
builder.Services.AddDbContext<LumensoftDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

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
    db.Database.Migrate();

    if (!db.Products.Any())
    {
        db.Products.AddRange(
            new Product { Code = "P-001", Name = "Laptop", CostPrice = 85000, RetailPrice = 105000, ImageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80", Comment = "Business laptop", Status = "Active" },
            new Product { Code = "P-002", Name = "Laptop Bag", CostPrice = 3000, RetailPrice = 4500, ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80", Comment = "Premium bag", Status = "Active" },
            new Product { Code = "P-003", Name = "Mouse", CostPrice = 1200, RetailPrice = 1800, ImageUrl = "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=300&q=80", Comment = "Ergonomic mouse", Status = "Active" }
        );
    }

    if (!db.Salespersons.Any())
    {
        db.Salespersons.AddRange(
            new Salesperson { Code = "SP-001", Name = "Ahmed Khan", Phone = "03001234567", Email = "ahmed@lumensoft.com", Address = "Lahore", Status = "Active" },
            new Salesperson { Code = "SP-002", Name = "Sana Ali", Phone = "03009876543", Email = "sana@lumensoft.com", Address = "Karachi", Status = "Active" }
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
    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{product.Id}", product);
});
app.MapPut("/api/products/{id}", async (int id, Product updated, LumensoftDbContext db) =>
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

    var duplicate = await db.Products.AnyAsync(p => p.Id != id && p.Code.ToLower() == updated.Code.Trim().ToLower());
    if (duplicate)
    {
        return Results.Conflict(new { message = "Product code already exists." });
    }

    existing.Code = updated.Code.Trim();
    existing.Name = updated.Name.Trim();
    existing.CostPrice = updated.CostPrice;
    existing.RetailPrice = updated.RetailPrice;
    existing.ImageUrl = updated.ImageUrl;
    existing.Comment = updated.Comment;
    existing.Status = updated.Status;
    await db.SaveChangesAsync();
    return Results.Ok(existing);
});
app.MapDelete("/api/products/{id}", async (int id, LumensoftDbContext db) =>
{
    var existing = await db.Products.FindAsync(id);
    if (existing is null) return Results.NotFound();
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

app.MapGet("/api/sales", async (LumensoftDbContext db) => await db.Sales.Include(s => s.Items).OrderByDescending(s => s.SaleDate).ToListAsync());
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

    if (sale.Items.Any(item => item.Quantity <= 0))
    {
        return Results.BadRequest(new { message = "Each product quantity must be greater than zero." });
    }

    var duplicateInvoice = await db.Sales.AnyAsync(s => s.InvoiceNo.ToLower() == sale.InvoiceNo.Trim().ToLower());
    if (duplicateInvoice)
    {
        return Results.Conflict(new { message = "Invoice number already exists." });
    }

    sale.InvoiceNo = sale.InvoiceNo.Trim();
    sale.SaleDate = sale.SaleDate == default ? DateTime.Now : sale.SaleDate;
    sale.GrandTotal = sale.Items.Sum(item => item.Total);
    db.Sales.Add(sale);
    await db.SaveChangesAsync();
    return Results.Created($"/api/sales/{sale.Id}", sale);
});
app.MapDelete("/api/sales/{id}", async (int id, LumensoftDbContext db) =>
{
    var existing = await db.Sales.Include(s => s.Items).FirstOrDefaultAsync(s => s.Id == id);
    if (existing is null) return Results.NotFound();
    db.SaleItems.RemoveRange(existing.Items);
    db.Sales.Remove(existing);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
