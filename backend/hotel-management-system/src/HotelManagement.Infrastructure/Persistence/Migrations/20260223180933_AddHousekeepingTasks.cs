using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHousekeepingTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "housekeeping_tasks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    due_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completion_notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    room_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    assigned_to_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_housekeeping_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_housekeeping_tasks_rooms_room_id",
                        column: x => x.room_id,
                        principalTable: "rooms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_housekeeping_tasks_users_assigned_to_user_id",
                        column: x => x.assigned_to_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_housekeeping_tasks_users_requested_by_user_id",
                        column: x => x.requested_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_housekeeping_tasks_assigned_to_user_id",
                table: "housekeeping_tasks",
                column: "assigned_to_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_housekeeping_tasks_requested_by_user_id",
                table: "housekeeping_tasks",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_housekeeping_tasks_room_id",
                table: "housekeeping_tasks",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_housekeeping_tasks_status",
                table: "housekeeping_tasks",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "housekeeping_tasks");
        }
    }
}
