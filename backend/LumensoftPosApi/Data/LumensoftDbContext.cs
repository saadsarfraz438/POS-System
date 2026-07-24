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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(p => p.Code).IsRequired().HasMaxLength(50);
            entity.HasIndex(p => p.Code).IsUnique();
            entity.Property(p => p.Name).IsRequired().HasMaxLength(150);
            entity.Property(p => p.CostPrice).HasPrecision(12, 2);
            entity.Property(p => p.RetailPrice).HasPrecision(12, 2);
        });

        modelBuilder.Entity<Salesperson>(entity =>
        {
            entity.Property(s => s.Code).IsRequired().HasMaxLength(50);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(150);
            entity.Property(s => s.Phone).IsRequired().HasMaxLength(30);
            entity.Property(s => s.Email).IsRequired().HasMaxLength(150);
            entity.Property(s => s.Address).IsRequired().HasMaxLength(250);
            entity.HasIndex(s => s.Code).IsUnique();
            entity.HasIndex(s => s.Phone).IsUnique();
            entity.HasIndex(s => s.Email).IsUnique();
        });

        modelBuilder.Entity<Sale>(entity =>
        {
            entity.Property(s => s.InvoiceNo).IsRequired().HasMaxLength(50);
            entity.HasIndex(s => s.InvoiceNo).IsUnique();
            entity.Property(s => s.SalespersonName).HasMaxLength(150);
            entity.Property(s => s.GrandTotal).HasPrecision(12, 2);
        });

        modelBuilder.Entity<SaleItem>(entity =>
        {
            entity.Property(i => i.ProductName).HasMaxLength(150);
            entity.Property(i => i.Price).HasPrecision(12, 2);
            entity.Property(i => i.Discount).HasPrecision(12, 2);
            entity.Property(i => i.Total).HasPrecision(12, 2);
        });
    }
}
