using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LumensoftPosApi.Migrations
{
    /// <inheritdoc />
    public partial class AddValidationConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Salespersons",
                type: "TEXT",
                maxLength: 250,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Salespersons_Code",
                table: "Salespersons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Salespersons_Email",
                table: "Salespersons",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Salespersons_Phone",
                table: "Salespersons",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_InvoiceNo",
                table: "Sales",
                column: "InvoiceNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_Code",
                table: "Products",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Salespersons_Code",
                table: "Salespersons");

            migrationBuilder.DropIndex(
                name: "IX_Salespersons_Email",
                table: "Salespersons");

            migrationBuilder.DropIndex(
                name: "IX_Salespersons_Phone",
                table: "Salespersons");

            migrationBuilder.DropIndex(
                name: "IX_Sales_InvoiceNo",
                table: "Sales");

            migrationBuilder.DropIndex(
                name: "IX_Products_Code",
                table: "Products");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Salespersons",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 250);
        }
    }
}
