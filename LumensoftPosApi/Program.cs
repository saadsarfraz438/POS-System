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
    db.Database.EnsureCreated();

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

app.MapGet("/api/products", async (LumensoftDbContext db) => await db.Products.ToListAsync());
app.MapPost("/api/products", async (Product product, LumensoftDbContext db) =>
{
    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{product.Id}", product);
});
app.MapPut("/api/products/{id}", async (int id, Product updated, LumensoftDbContext db) =>
{
    var existing = await db.Products.FindAsync(id);
    if (existing is null) return Results.NotFound();
    existing.Code = updated.Code;
    existing.Name = updated.Name;
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

app.MapGet("/api/salespersons", async (LumensoftDbContext db) => await db.Salespersons.ToListAsync());
app.MapPost("/api/salespersons", async (Salesperson salesperson, LumensoftDbContext db) =>
{
    db.Salespersons.Add(salesperson);
    await db.SaveChangesAsync();
    return Results.Created($"/api/salespersons/{salesperson.Id}", salesperson);
});
app.MapPut("/api/salespersons/{id}", async (int id, Salesperson updated, LumensoftDbContext db) =>
{
    var existing = await db.Salespersons.FindAsync(id);
    if (existing is null) return Results.NotFound();
    existing.Code = updated.Code;
    existing.Name = updated.Name;
    existing.Phone = updated.Phone;
    existing.Email = updated.Email;
    existing.Address = updated.Address;
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

app.MapGet("/api/sales", async (LumensoftDbContext db) => await db.Sales.Include(s => s.Items).ToListAsync());
app.MapPost("/api/sales", async (Sale sale, LumensoftDbContext db) =>
{
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
