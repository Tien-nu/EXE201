"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = myScript;
const utils_1 = require("@medusajs/framework/utils");
async function myScript({ container }) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: inventoryItems } = await query.graph({
        entity: 'inventory_item',
        fields: ['id', 'location_levels.location_id'],
    });
    console.log(JSON.stringify(inventoryItems, null, 2));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1xdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3QtcXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwyQkFPQztBQVZELHFEQUE4RTtBQUcvRCxLQUFLLFVBQVUsUUFBUSxDQUFDLEVBQUUsU0FBUyxFQUFZO0lBQzVELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDaEUsTUFBTSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDakQsTUFBTSxFQUFFLGdCQUFnQjtRQUN4QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsNkJBQTZCLENBQUM7S0FDOUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0RCxDQUFDIn0=