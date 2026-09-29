"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateDescriptions;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const DESCRIPTIONS = {
    'gau-bong-len': {
        subtitle: 'Món quà đáng yêu, mềm mại',
        description: 'Sản phẩm gấu bông được đan móc thủ công tỉ mỉ bằng sợi len cao cấp. Mỗi đường kim mũi chỉ đều chứa đựng sự tâm huyết, mang lại cảm giác vô cùng êm ái khi ôm. Thiết kế vô cùng dễ thương, an toàn tuyệt đối cho cả trẻ nhỏ và da nhạy cảm. Rất thích hợp làm quà tặng ý nghĩa cho người thân và bạn bè.',
        material: 'Len Milk Cotton nhập khẩu'
    },
    'hoa-len': {
        subtitle: 'Nở rộ mãi mãi cùng thời gian',
        description: 'Hoa len thủ công bền đẹp, không phai màu, không tàn úa. Từng cánh hoa được tạo hình tinh tế với màu sắc rực rỡ và hài hòa. Sản phẩm là biểu tượng cho tình yêu và sự trân trọng vĩnh cửu. Dễ dàng trang trí bàn làm việc, phòng khách hoặc làm quà tặng các dịp lễ đặc biệt.',
        material: 'Len Nhung cao cấp'
    },
    'moc-khoa-len': {
        subtitle: 'Phụ kiện nhỏ xinh, độc đáo',
        description: 'Móc khóa len mini với đa dạng hình dáng siêu cute: quả dâu, thú cưng, trái tim... Nhỏ gọn, chắc chắn, thích hợp để treo balo, túi xách, hay chìa khóa xe. Món phụ kiện giúp nổi bật phong cách cá nhân và đem lại niềm vui nho nhỏ mỗi ngày.',
        material: 'Len Nhôm siêu nhẹ'
    },
    'ao-cardigan-len': {
        subtitle: 'Ấm áp, thời trang và cá tính',
        description: 'Áo khoác Cardigan móc len 100% thủ công với họa tiết độc bản. Form áo rộng rãi, trẻ trung mang lại sự thoải mái tối đa cho người mặc. Chất len mềm mịn, giữ nhiệt cực tốt nhưng vẫn thoáng khí, lý tưởng cho những ngày se lạnh hoặc dạo phố phong cách thu đông.',
        material: 'Len Cừu & Sợi Cotton'
    },
    'tui-xach-len': {
        subtitle: 'Điểm nhấn vintage cho trang phục',
        description: 'Túi xách dệt từ sợi len siêu bền, form túi cứng cáp đựng được nhiều vật dụng cá nhân như điện thoại, son, ví. Kiểu dáng đan chéo mang đậm chất vintage, thích hợp để mix&match với váy Boho, trang phục dạo biển hay chụp hình sống ảo.',
        material: 'Sợi Cotton Dệt nguyên bản'
    },
    'mu-len-trum': {
        subtitle: 'Phong cách và giữ ấm hoàn hảo',
        description: 'Mũ trùm đầu móc len họa tiết xinh xắn, ôm sát vừa vặn đem lại hiệu quả giữ ấm tối đa cho phần đầu và tai. Phong cách cổ điển nhưng không lỗi thời, phù hợp với mọi độ tuổi. Sợi len không xù lông, không gây ngứa, êm ái vô cùng.',
        material: 'Len Sợi To ấm áp'
    },
    'khan-choang-len': {
        subtitle: 'Đẳng cấp và thanh lịch',
        description: 'Khăn choàng cổ len bản rộng, dễ dàng quấn nhiều vòng hoặc khoác nhẹ bờ vai. Mẫu mã thanh lịch, sang trọng phù hợp cho những ngày giá rét. Công nghệ đan thừng chắc chắn, hạn chế tối đa việc nhão sợi hay bai dão sau nhiều lần giặt.',
        material: 'Len Milk Cotton & Len Cừu'
    },
    'thu-bong-amigurumi': {
        subtitle: 'Nghệ thuật đan thú bông Nhật Bản',
        description: 'Được chế tác theo phong cách Amigurumi truyền thống của Nhật, thú bông có tỷ lệ ngộ nghĩnh, biểu cảm sinh động. Nhồi bông bi tinh khiết 100%, có thể giặt máy mà không làm mất phom dáng. Trở thành người bạn đồng hành tuyệt vời cho bé yêu.',
        material: 'Len Milk Cotton 50g'
    },
    'lot-ly-len': {
        subtitle: 'Góc tinh tế cho bàn trà',
        description: 'Set lót ly đan len với họa tiết mandala hoặc hoa cúc cực kỳ thanh tao. Giúp bảo vệ mặt bàn khỏi vết ố nước, chịu nhiệt tốt. Có thể tái sử dụng dễ dàng sau khi giặt. Mang đến sự mộc mạc, ấm cúng cho góc uống trà hay bàn làm việc của bạn.',
        material: 'Sợi Cotton dệt tay'
    },
    'bang-do-len': {
        subtitle: 'Ngọt ngào và nữ tính',
        description: 'Băng đô len quấn tóc co giãn tốt, không làm đau đầu hay gãy tóc. Tôn lên nét đáng yêu và gọn gàng cho phái nữ. Phụ kiện hoàn hảo khi skincare, rửa mặt hoặc kết hợp với trang phục năng động dạo phố cuối tuần.',
        material: 'Len Nhung mềm mịn'
    }
};
async function updateDescriptions({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: allProducts } = await query.graph({
        entity: 'product',
        fields: ['id', 'handle'],
    });
    const updates = allProducts.map(p => {
        // Find the right info based on handle
        const key = Object.keys(DESCRIPTIONS).find(k => p.handle.includes(k));
        const info = key ? DESCRIPTIONS[key] : {
            subtitle: 'Sản phẩm móc len thủ công',
            description: 'Sản phẩm được làm 100% từ len cao cấp, an toàn và thân thiện.',
            material: 'Len'
        };
        return {
            id: p.id,
            subtitle: info.subtitle,
            description: info.description,
            material: info.material,
            weight: 150 + Math.floor(Math.random() * 150),
            origin_country: 'VN',
            width: 10 + Math.floor(Math.random() * 10),
            height: 10 + Math.floor(Math.random() * 10),
            length: 10 + Math.floor(Math.random() * 10),
        };
    });
    logger.info(`Updating ${updates.length} products with beautiful details...`);
    await (0, core_flows_1.updateProductsWorkflow)(container).run({
        input: { products: updates }
    });
    logger.info('Products updated successfully! Search index should automatically sync.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWRlc2NyaXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3VwZGF0ZS1kZXNjcmlwdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUF5REEscUNBc0NDO0FBL0ZELHFEQUFxRTtBQUVyRSw0REFBb0U7QUFFcEUsTUFBTSxZQUFZLEdBQUc7SUFDbkIsY0FBYyxFQUFFO1FBQ2QsUUFBUSxFQUFFLDJCQUEyQjtRQUNyQyxXQUFXLEVBQUUseVNBQXlTO1FBQ3RULFFBQVEsRUFBRSwyQkFBMkI7S0FDdEM7SUFDRCxTQUFTLEVBQUU7UUFDVCxRQUFRLEVBQUUsOEJBQThCO1FBQ3hDLFdBQVcsRUFBRSw4UUFBOFE7UUFDM1IsUUFBUSxFQUFFLG1CQUFtQjtLQUM5QjtJQUNELGNBQWMsRUFBRTtRQUNkLFFBQVEsRUFBRSw0QkFBNEI7UUFDdEMsV0FBVyxFQUFFLDhPQUE4TztRQUMzUCxRQUFRLEVBQUUsbUJBQW1CO0tBQzlCO0lBQ0QsaUJBQWlCLEVBQUU7UUFDakIsUUFBUSxFQUFFLDhCQUE4QjtRQUN4QyxXQUFXLEVBQUUsbVFBQW1RO1FBQ2hSLFFBQVEsRUFBRSxzQkFBc0I7S0FDakM7SUFDRCxjQUFjLEVBQUU7UUFDZCxRQUFRLEVBQUUsa0NBQWtDO1FBQzVDLFdBQVcsRUFBRSx5T0FBeU87UUFDdFAsUUFBUSxFQUFFLDJCQUEyQjtLQUN0QztJQUNELGFBQWEsRUFBRTtRQUNiLFFBQVEsRUFBRSwrQkFBK0I7UUFDekMsV0FBVyxFQUFFLG1PQUFtTztRQUNoUCxRQUFRLEVBQUUsa0JBQWtCO0tBQzdCO0lBQ0QsaUJBQWlCLEVBQUU7UUFDakIsUUFBUSxFQUFFLHdCQUF3QjtRQUNsQyxXQUFXLEVBQUUsdU9BQXVPO1FBQ3BQLFFBQVEsRUFBRSwyQkFBMkI7S0FDdEM7SUFDRCxvQkFBb0IsRUFBRTtRQUNwQixRQUFRLEVBQUUsa0NBQWtDO1FBQzVDLFdBQVcsRUFBRSwrT0FBK087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