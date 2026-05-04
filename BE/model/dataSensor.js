const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const DataSensor = sequelize.define('dataSensor', {
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    humidity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    light: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, {
    tableName: 'data_sensors',
    timestamps: true 
});

module.exports = DataSensor;