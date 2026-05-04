import React, { useState, useEffect, useRef } from 'react';
import * as Chart from 'chart.js';
import {io} from 'socket.io-client';
import ChartTmp from "../components/chartLine"
import NavBar from '../components/navbar';
import '../assets/SmartHomeDashboard.scss';

const socket = io("http://localhost:3000");

const SmartHomeDashboard = () => {
  const [devices, setDevices] = useState(() => {
    const localS = localStorage.getItem("deviceStatus");
    return localS ? JSON.parse(localS) :
    {
      led1: { status: false },
      led2: { status: false },
      led3: { status: false }
    };
  });

  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [light, setLight] = useState('');
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  // Giữ nguyên các hàm bổ trợ giao diện của bạn
  const toggleDevice = (deviceName) => {
    setDevices(prev => ({
      ...prev,
      [deviceName]: {
        ...prev[deviceName],
        status: !prev[deviceName].status
      }
    }));
  };

  const StatCard = ({ icon, label, value, unit, color, trend, className }) => (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-header">
        <span className="stat-icon" style={{ color }}>{icon}</span>
      </div>
      <div className="stat-content">
        <h3 className={className}>{value}<span>{unit}</span></h3>
        <p>{label}</p>
      </div>
    </div>
  );

  const DeviceCard = ({ device, name, icon, title, isActive, onToggle, children }) => (
    <div className={`device-card ${isActive ? 'active' : ''}`}>
      <div className="device-header">
        <div className="device-info">
          <span className="device-icon">{icon}</span>
          <span className="device-title">{title}</span>
        </div>
        <label className="switch">
          <input type="checkbox" checked={isActive} onChange={() => {
            socket.emit("ledReq", {
              name: name,
              status: !isActive
            });
          }} />
          <span className="slider round"></span>
        </label>
      </div>
      {children && <div className="device-controls">{children}</div>}
    </div>
  );

  const getStatusClass = (type, value) => {
    if (type === "temperature") {
      if (value < 10) return "level-1";
      if (value < 20) return "level-2";
      if (value < 30) return "level-3";
      if (value < 40) return "level-4";
      return "level-5";
    }
    if (type === "humidity") {
      if (value < 20) return "level-1";
      if (value < 40) return "level-2";
      if (value < 70) return "level-3";
      if (value < 80) return "level-4";
      return "level-5";
    }
    if (type === "light") {
      if (value < 810) return "level-5";
      if (value < 1620) return "level-4";
      if (value < 2430) return "level-3";
      if (value < 3240) return "level-2";
      return "level-1";
    }
    return "";
  };

  // 1. Lắng nghe dữ liệu cảm biến[cite: 10]
  useEffect(() => {
    socket.on("dataSensor", (data) => {
      setHumidity(data.humidity);
      setTemperature(data.temperature);
      setLight(data.light);
      setTimestamp(new Date().toISOString());
    });
    return () => socket.off("dataSensor");
  }, []);

  // 2. PHẦN SỬA LỖI: Lắng nghe phản hồi trạng thái đèn
  useEffect(() => {
    socket.on("ledStatus", (data) => {
      // Backend gửi 'status' thay vì 'msg'[cite: 9]
      // Chỉ cập nhật thiết bị cụ thể, không reset toàn bộ[cite: 10]
      if (data.name && data.name !== "all") {
        setDevices(prev => ({
          ...prev,
          [data.name]: {
            status: data.status // Cập nhật đúng trạng thái true/false từ mạch[cite: 9]
          }
        }));
      } else if (data.name === "all") {
        // Chỉ reset tất cả khi nhận lệnh "all" từ hệ thống[cite: 9]
        setDevices({
          led1: { status: false },
          led2: { status: false },
          led3: { status: false }
        });
      }
    });
    return () => socket.off("ledStatus");
  }, []);

  useEffect(() => {
    localStorage.setItem("deviceStatus", JSON.stringify(devices));
  }, [devices]);

  return (
    <div className="smart-home-dashboard">
      <NavBar />
      <div className="main-content">
        <div>
          <div className="stats-grid">
            <StatCard 
              icon="🌡️" label="Nhiệt độ" value={temperature} unit="°C" color="#4ECDC4"
              className={getStatusClass("temperature", temperature)}
            />
            <StatCard 
              icon="💧" label="Độ ẩm" value={humidity} unit="%" color="#4ECDC4"
              className={getStatusClass("humidity", humidity)}
            />
            <StatCard 
              icon="💡" label="Ánh sáng" value={light} unit="lux" color="#4ECDC4"
              className={getStatusClass("light", light)}
            />
          </div>

          <div className="content-grid">
            <div className="chart-section">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Nhiệt độ và độ ẩm </h3>
                  <span className="chart-period">Trong 24 giờ</span>
                </div>
                <div className="chart-container">
                  <ChartTmp 
                    humiditi={humidity}
                    temp={temperature}
                    lights={light}
                    timestamp={timestamp}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="devices-section">
          <div className="devices-grid">
            <DeviceCard
              name="led1" icon="💡" title="Đèn 1"
              isActive={devices.led1.status}
            />
            <DeviceCard
              name="led2" icon="💡" title="Đèn 2"
              isActive={devices.led2.status}
            />
            <DeviceCard
              name="led3" icon="💡" title="Đèn 3"
              isActive={devices.led3.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartHomeDashboard;