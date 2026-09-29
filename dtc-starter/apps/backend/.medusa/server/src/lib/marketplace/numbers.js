"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNumber = void 0;
/** Reads plain numbers and Medusa BigNumber values alike. */
const toNumber = (value) => {
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === "object" && "numeric" in value) {
        return Number(value.numeric);
    }
    return Number(value);
};
exports.toNumber = toNumber;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvbWFya2V0cGxhY2UvbnVtYmVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2REFBNkQ7QUFDdEQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFjLEVBQVUsRUFBRTtJQUNqRCxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxDQUFBO0lBQ1YsQ0FBQztJQUVELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLFNBQVMsSUFBSyxLQUFnQixFQUFFLENBQUM7UUFDaEUsT0FBTyxNQUFNLENBQUUsS0FBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDdEIsQ0FBQyxDQUFBO0FBVlksUUFBQSxRQUFRLFlBVXBCIn0=