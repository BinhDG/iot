const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('iot', 'root', 'dgb2004tu@', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00'
});

// Quan trọng: Export trực tiếp instance
module.exports = sequelize;