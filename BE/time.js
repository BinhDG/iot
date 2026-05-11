const moment = require('moment');

const configTime = (keyword) => {
    if (!keyword) return null;

    let start, end;
    
    // Định dạng mong muốn: "Giờ:Phút:Giây Ngày/Tháng/Năm" hoặc các biến thể lược bỏ
    // Thử khớp với các trường hợp từ chi tiết đến bao quát
    
    // 1. Có đủ Giờ:Phút:Giây Ngày/Tháng/Năm (VD: 12:38:30 11/05/2026)
    if (moment(keyword, "HH:mm:ss DD/MM/YYYY", true).isValid()) {
        start = moment(keyword, "HH:mm:ss DD/MM/YYYY").startOf('second').toDate();
        end = moment(keyword, "HH:mm:ss DD/MM/YYYY").endOf('second').toDate();
    }
    // 2. Chỉ có Giờ:Phút Ngày/Tháng/Năm (VD: 12:38 11/05/2026)
    else if (moment(keyword, "HH:mm DD/MM/YYYY", true).isValid()) {
        start = moment(keyword, "HH:mm DD/MM/YYYY").startOf('minute').toDate();
        end = moment(keyword, "HH:mm DD/MM/YYYY").endOf('minute').toDate();
    }
    // 3. Chỉ có Giờ Ngày/Tháng/Năm (VD: 12 11/05/2026)
    else if (moment(keyword, "HH DD/MM/YYYY", true).isValid()) {
        start = moment(keyword, "HH DD/MM/YYYY").startOf('hour').toDate();
        end = moment(keyword, "HH DD/MM/YYYY").endOf('hour').toDate();
    }
    // 4. Chỉ có Ngày/Tháng/Năm (VD: 11/05/2026)
    else if (moment(keyword, "DD/MM/YYYY", true).isValid()) {
        start = moment(keyword, "DD/MM/YYYY").startOf('day').toDate();
        end = moment(keyword, "DD/MM/YYYY").endOf('day').toDate();
    }
    else {
        return null;
    }

    return { start, end };
};

module.exports = configTime;