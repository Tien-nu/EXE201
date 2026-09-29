"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dbCheck;
async function dbCheck({ container }) {
    const db = container.resolve("pgConnection");
    const res = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const tables = res.rows.map(r => r.table_name).filter(t => t.includes('store') || t.includes('currency') || t.includes('region'));
    console.log(tables);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGItY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9kYi1jaGVjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLDBCQUtDO0FBTGMsS0FBSyxVQUFVLE9BQU8sQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUMzRCxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFvRCxjQUFjLENBQUMsQ0FBQTtJQUMvRixNQUFNLEdBQUcsR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsOEVBQThFLENBQUMsQ0FBQTtJQUN4RyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFBO0lBQ2pJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDckIsQ0FBQyJ9