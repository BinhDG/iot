const express = require('express');
const mqtt = require('mqtt');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const httpServer = createServer(app);
const route = require('./route');
const sequelize = require('./db');

// Import các model
const DataSensor = require("./model/dataSensor");
const History = require("./model/History");

const io = new Server(httpServer, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// 1. Kết nối MQTT Broker
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

// 2. Socket.io: Lắng nghe lệnh từ Web
io.on('connection', (socket) => {
    socket.on('ledReq', (data) => {
        let topic = `home/${data.name}`; 
        let msg = data.status ? "ON" : "OFF";
        
        setTimeout(() => {
            mqttClient.publish(topic, msg, (err) => {
                if (err) console.error('Lỗi gửi lệnh tới ESP32:', err);
                else console.log(`Đã gửi lệnh ${msg} tới ${data.name} sau 0.5 giây.`);
            });
        }, 500); 
    });
});

// 3. MQTT: Lắng nghe tin nhắn từ Broker
mqttClient.on('connect', () => {
    mqttClient.subscribe(['home/sensor', 'home/ledStatus', 'home/status']);
    console.log('Đã đăng ký các topic MQTT');
});

mqttClient.on('message', async (topic, message) => {
    const msgString = message.toString();

    // Dữ liệu cảm biến (Gửi ngay lập tức)
    if (topic === "home/sensor") {
        try {
            const tmpData = JSON.parse(msgString);
            await DataSensor.create({
                temperature: tmpData.temperature,
                humidity: tmpData.humidity,
                light: tmpData.light
            });
            io.emit('dataSensor', tmpData); 
        } catch (error) {
            console.error("Lỗi cảm biến:", error);
        }
    }
    
    // Phản hồi trạng thái đèn từ mạch
    if (topic === "home/ledStatus") {
        try {
            const tmpLed = JSON.parse(msgString);
            let keyLed = Object.keys(tmpLed)[0]; 
            let valueLed = tmpLed[keyLed];
            
            // Lưu lịch sử
            await History.create({
                device: keyLed,
                action: valueLed == 1 ? "ON" : "OFF"
            });
            
            // Báo về Web ngay sau khi mạch phản hồi để tắt màu cam
            io.emit('ledStatus', {
                name: keyLed,
                status: valueLed == 1
            });
        } catch (error) {
            console.error("Lỗi phản hồi đèn:", error);
        }
    }
});

route(app);
httpServer.listen(3000, () => console.log('Backend running on port 3000'));