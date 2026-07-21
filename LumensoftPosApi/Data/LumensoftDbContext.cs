using LumensoftPosApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LumensoftPosApi.Data;

public class LumensoftDbContext : DbContext
{
    public LumensoftDbContext(DbContextOptions<LumensoftDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Salesperson> Salespersons => Set<Salesperson>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
}
