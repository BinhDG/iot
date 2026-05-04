const History = require('../model/History');
const moment = require('moment');
const configTime = require('../time');
const { Op } = require('sequelize');

module.exports.getHistory = async (req, res) => {
    try {
        const { page, filter, keyword, sortKey, sortValue, frequent, filterStatus } = req.query;
        let limit = frequent ? parseInt(frequent) : 10;
        let where = {};
        let order = [];

        // Sort
        if (sortKey && sortValue) {
            order.push([sortKey, parseInt(sortValue) === 1 ? 'ASC' : 'DESC']);
        } else {
            order.push(['createdAt', 'DESC']);
        }

        // Filter
        if (filter) {
            where.device = filter;
        }
        if (filterStatus) {
            where.action = filterStatus;
        }

        // Search
        if (keyword) {
            const { start, end } = configTime(keyword);
            where.createdAt = {
                [Op.between]: [start, end]
            };
        }

        const skipPage = page ? (parseInt(page) - 1) * limit : 0;

        // Query DB
        const { count, rows } = await History.findAndCountAll({
            where: where,
            offset: skipPage,
            limit: limit,
            order: order,
            raw: true
        });

        let history = rows.map(item => {
            item.createdAt = moment(item.createdAt).format('HH:mm:ss DD/MM/YYYY');
            return item;
        });

        res.status(200).json({
            doc: history,
            totalPage: Math.ceil(count / limit),
            currentPage: page ? parseInt(page) : 1
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports.getLedStatus = async (req, res) => {
    try {
        const arr = ["led1", "led2", "led3"];
        let arr1 = [];
        for (let i in arr) {
            const latestData = await History.findOne({
                where: { device: arr[i] },
                order: [['createdAt', 'DESC']],
                raw: true
            });
            arr1.push({
                device: arr[i],
                status: latestData ? latestData.action : "OFF"
            });
        }
        res.status(200).json(arr1);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}