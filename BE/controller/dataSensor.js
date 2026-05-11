const DataSensor = require('../model/dataSensor');
const moment = require('moment');
const configTime = require('../time');
const { Op, Sequelize } = require('sequelize');

module.exports.getData = async (req, res) => {
    try {
        let { keyword, sortKey, sortValue, page, filter, frequent } = req.query;
        let limit = frequent ? parseInt(frequent) : 10;
        let where = {};
        let order = [];

        // 1. Sắp xếp
        if (sortKey && sortValue) {
            order.push([sortKey, parseInt(sortValue) === 1 ? 'ASC' : 'DESC']);
        } else {
            order.push(['createdAt', 'DESC']);
        }

        // 2. Xử lý logic tìm kiếm
        if (keyword && keyword.trim() !== "") {
            keyword = keyword.trim();

            if (filter === "all") {
                // Điều kiện tìm kiếm cho các cột dữ liệu số (Cần CAST về CHAR để dùng LIKE)
                let orConditions = [
                    Sequelize.where(Sequelize.cast(Sequelize.col('temperature'), 'CHAR'), { [Op.like]: `%${keyword}%` }),
                    Sequelize.where(Sequelize.cast(Sequelize.col('humidity'), 'CHAR'), { [Op.like]: `%${keyword}%` }),
                    Sequelize.where(Sequelize.cast(Sequelize.col('light'), 'CHAR'), { [Op.like]: `%${keyword}%` })
                ];

                // Kiểm tra xem keyword có phải định dạng thời gian linh hoạt không
                const timeRange = configTime(keyword);
                if (timeRange) {
                    orConditions.push({
                        createdAt: { [Op.between]: [timeRange.start, timeRange.end] }
                    });
                }
                
                where[Op.or] = orConditions;
            } 
            else if (filter === "createdAt") {
                const timeRange = configTime(keyword);
                if (timeRange) {
                    where.createdAt = { [Op.between]: [timeRange.start, timeRange.end] };
                } else {
                    // Nếu gõ ngày sai định dạng khi đang chọn lọc theo thời gian
                    where.id = null; 
                }
            } 
            else {
                // Lọc theo từng cột cụ thể (temperature, humidity, light)
                where = Sequelize.where(Sequelize.cast(Sequelize.col(filter), 'CHAR'), { [Op.like]: `%${keyword}%` });
            }
        }

        const skipPage = page ? (parseInt(page) - 1) * limit : 0;
        const { count, rows } = await DataSensor.findAndCountAll({
            where: where,
            order: order,
            offset: skipPage,
            limit: limit,
            raw: true
        });

        // Định dạng lại thời gian hiển thị cho Frontend
        let data = rows.map(item => {
            item.createdAt = moment(item.createdAt).format("HH:mm:ss DD/MM/YYYY");
            return item;
        });

        res.status(200).json({
            doc: data,
            totalPage: Math.ceil(count / limit),
            currentPage: page ? parseInt(page) : 1
        });
    } catch (error) {
        console.error("Lỗi tại getDataSensor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};