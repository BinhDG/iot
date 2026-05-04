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

        // 2. Tìm kiếm và Lọc
        if (filter && keyword && keyword.trim() !== "") {
            keyword = keyword.trim();

            if (filter === "all") {
                let orConditions = [
                    Sequelize.where(Sequelize.cast(Sequelize.col('temperature'), 'CHAR'), { [Op.like]: `%${keyword}%` }),
                    Sequelize.where(Sequelize.cast(Sequelize.col('humidity'), 'CHAR'), { [Op.like]: `%${keyword}%` }),
                    Sequelize.where(Sequelize.cast(Sequelize.col('light'), 'CHAR'), { [Op.like]: `%${keyword}%` })
                ];
                
                const timeRange = configTime(keyword);
                if (timeRange && timeRange.start && timeRange.end) {
                    orConditions.push({
                        createdAt: { [Op.between]: [timeRange.start, timeRange.end] }
                    });
                }
                where[Op.or] = orConditions;
            } else if (filter === "createdAt") {
                const timeRange = configTime(keyword);
                if (timeRange && timeRange.start && timeRange.end) {
                    where.createdAt = { [Op.between]: [timeRange.start, timeRange.end] };
                }
            } else {
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