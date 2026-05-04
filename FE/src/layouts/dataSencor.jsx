import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client'; // Thêm thư viện socket
import moment from 'moment';
import '../assets/dataSencor.scss';
import NavBar from '../components/navbar';
import Pagination from '../components/pagination';

const DataSensor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sensorData, setSensorData] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [searchBool, setSearchBool] = useState(false);

  // 1. Lấy dữ liệu qua API (bao gồm phân trang, sắp xếp, tìm kiếm)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/getDataSensor?filter=${filter}&keyword=${searchItem}&page=${currentPage}&frequent=${itemsPerPage}&sortKey=${sortField}&sortValue=${sortDirection === 'asc' ? 1 : -1}`
        );
        setSensorData(response.data?.doc || []);
        setTotalPage(response.data?.totalPage || 1);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, [currentPage, itemsPerPage, sortDirection, searchItem, searchBool, filter, sortField]);

  // 2. Tự động cập nhật dữ liệu mới qua Socket.io[cite: 3]
  useEffect(() => {
    const socket = io('http://localhost:3000'); // Đảm bảo đúng cổng Backend

    socket.on('dataSensor', (newData) => {
      // Chỉ tự cập nhật vào bảng nếu đang ở trang 1 và không tìm kiếm
      if (currentPage === 1 && !searchItem) {
        setSensorData((prevData) => {
          const formattedNewData = {
            ...newData,
            id: prevData.length > 0 ? "Mới" : 1, // Đánh dấu bản ghi mới
            createdAt: moment().format("HH:mm:ss DD/MM/YYYY")
          };
          // Thêm vào đầu danh sách và giới hạn theo số bản ghi mỗi trang
          const updatedList = [formattedNewData, ...prevData];
          return updatedList.slice(0, itemsPerPage);
        });
      }
    });

    return () => socket.disconnect();
  }, [currentPage, itemsPerPage, searchItem]);

  const handleSort = (field) => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const hanldeSearch = () => {
    setSearchItem(searchTerm);
    setCurrentPage(1);
    setSearchBool(!searchBool);
  };

  const deleteSearch = () => {
    setSearchTerm('');
    setSearchItem('');
    setCurrentPage(1);
  };

  return (
    <div className="data-sensor-page">
      <NavBar />
      <div className="content">
        <div className="page-header">
          <h1>Dữ liệu cảm biến</h1>
        </div>

        <div className="wrapper-bar">
          <div className="filter-bar">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tất cả thiết bị</option>
              <option value="temperature">Nhiệt độ</option>
              <option value="humidity">Độ ẩm</option>
              <option value="light">Ánh sáng</option>
              <option value="createdAt">Thời gian</option>
            </select>
          </div>
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && hanldeSearch()}
                className="search-input"
              />
              <button className='deleteButton' onClick={deleteSearch}>X</button>
            </div>
            <button className="search-btn" onClick={hanldeSearch}>🔍 Tìm kiếm</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                <th onClick={() => handleSort('temperature')}>Nhiệt độ (°C) {getSortIcon('temperature')}</th>
                <th onClick={() => handleSort('humidity')}>Độ ẩm (%) {getSortIcon('humidity')}</th>
                <th onClick={() => handleSort('light')}>Ánh sáng (lux) {getSortIcon('light')}</th>
                <th onClick={() => handleSort('createdAt')}>Thời gian {getSortIcon('createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {sensorData.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.temperature}</td>
                  <td>{item.humidity}</td>
                  <td>{item.light}</td>
                  <td>{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='wrapper-pagi'>
          <Pagination
            handlePageChange={(page) => setCurrentPage(page)}
            currentPage={currentPage}
            totalPages={totalPage} 
          />
          <div className="items-per-page">
            <label>Hiển thị: </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span> bản ghi / trang</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSensor;