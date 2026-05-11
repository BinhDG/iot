import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ChartTmp from "../components/chartLine";
import NavBar from '../components/navbar';
import '../assets/SmartHomeDashboard.scss';

const socket = io("http://localhost:3000");

const SmartHomeDashboard = () => {
  const [devices, setDevices] = useState(() => {
    const localS = localStorage.getItem("deviceStatus");
    const initial = localS ? JSON.parse(localS) : {
      led1: { status: false },
      led2: { status: false },
      led3: { status: false }
    };
    return {
      led1: { ...initial.led1, isWaiting: false },
      led2: { ...initial.led2, isWaiting: false },
      led3: { ...initial.led3, isWaiting: false }
    };
  });

  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [light, setLight] = useState('');
  const [timestamp, setTimestamp] = useState('');

  const timers = useRef({
    led1: null,
    led2: null,
    led3: null
  });

  const StatCard = ({ icon, label, value, unit, color, className }) => (
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

  const DeviceCard = ({ name, icon, title, isActive, isWaiting }) => (
    <div className={`device-card ${isActive ? 'active' : ''} ${isWaiting ? 'waiting' : ''}`}>
      <div className="device-header">
        <div className="device-info">
          <span className="device-icon">{icon}</span>
          <span className="device-title">{title}</span>
        </div>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isActive} 
            disabled={isWaiting} 
            onChange={() => handleToggle(name, isActive)} 
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );

  const handleToggle = (name, currentStatus) => {
    // Bật trạng thái waiting màu cam ngay lập tức
    setDevices(prev => ({
      ...prev,
      [name]: { ...prev[name], isWaiting: true }
    }));

    socket.emit("ledReq", {
      name: name,
      status: !currentStatus
    });

    if (timers.current[name]) clearTimeout(timers.current[name]);
    timers.current[name] = setTimeout(() => {
      setDevices(prev => ({
        ...prev,
        [name]: { ...prev[name], isWaiting: false }
      }));
      alert(`Lỗi: Thiết bị ${name} không phản hồi!`);
    }, 10000);
  };

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

  useEffect(() => {
    socket.on("dataSensor", (data) => {
      setHumidity(data.humidity);
      setTemperature(data.temperature);
      setLight(data.light);
      setTimestamp(new Date().toISOString());
    });
    return () => socket.off("dataSensor");
  }, []);

  useEffect(() => {
    socket.on("ledStatus", (data) => {
      if (data.name && data.name !== "all") {
        if (timers.current[data.name]) {
          clearTimeout(timers.current[data.name]);
          timers.current[data.name] = null;
        }

        setDevices(prev => ({
          ...prev,
          [data.name]: {
            status: data.status,
            isWaiting: false 
          }
        }));
      } else if (data.name === "all") {
        setDevices({
          led1: { status: false, isWaiting: false },
          led2: { status: false, isWaiting: false },
          led3: { status: false, isWaiting: false }
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
              isWaiting={devices.led1.isWaiting}
            />
            <DeviceCard
              name="led2" icon="💡" title="Đèn 2"
              isActive={devices.led2.status}
              isWaiting={devices.led2.isWaiting}
            />
            <DeviceCard
              name="led3" icon="💡" title="Đèn 3"
              isActive={devices.led3.status}
              isWaiting={devices.led3.isWaiting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartHomeDashboard;