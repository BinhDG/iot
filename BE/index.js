const express = require('express');
const mqtt = require('mqtt');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const httpServer = createServer(app);
const route = require('./route');
const sequelize = require('./db');

const DataSensor = require("./model/dataSensor");
const History = require("./model/History");

const io = new Server(httpServer, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

const mqttClient = mqtt.connect("mqtt://127.0.0.1:1884", {
    username: 'tripled',
    password: '842004'  
});

sequelize.authenticate()
    .then(() => {
        console.log('Connected to MySQL');
        return sequelize.sync();
    })
    .catch(err => console.log('Database Error:', err));

io.on('connection', (socket) => {
    console.log('Client connected to Dashboard');
    
    // Nhận lệnh điều khiển đèn từ Web
    socket.on('ledReq', (data) => {
        let topic = `home/${data.name}`;
        let msg = data.status ? "ON" : "OFF";
        mqttClient.publish(topic, msg);
    });
});

mqttClient.on('connect', () => {
    mqttClient.subscribe(['home/sensor', 'home/ledStatus', 'home/status']);
    console.log('Subscribed to MQTT topics');
});

mqttClient.on('message', async (topic, message) => {
    const msgString = message.toString();

    if (topic === "home/sensor") {
        try {
            const tmpData = JSON.parse(msgString);
            await DataSensor.create({
                temperature: tmpData.temperature,
                humidity: tmpData.humidity,
                light: tmpData.light
            });
            io.emit('dataSensor', tmpData);
        } catch (e) { console.log("Sensor Error:", e); }
    }
    
    if (topic === "home/ledStatus") {
        try {
            const tmpLed = JSON.parse(msgString);
            let keyLed = Object.keys(tmpLed)[0];
            let valueLed = tmpLed[keyLed];
            
            await History.create({
                device: keyLed,
                action: valueLed == 1 ? "ON" : "OFF"
            });
            
            // Gửi 'status' (true/false) về cho Frontend
            io.emit('ledStatus', {
                name: keyLed,
                status: valueLed == 1
            });
        } catch (e) { console.log("LED Status Error:", e); }
    }
});

route(app);
httpServer.listen(3000, () => console.log('Backend running on port 3000'));