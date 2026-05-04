const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const History = sequelize.define('history', {
    device: {
        type: DataTypes.STRING,
        allowNull: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'history',
    timestamps: true 
});

module.exports = History;