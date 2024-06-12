import jwt from 'jsonwebtoken';

// Hàm mã hóa dữ liệu trước khi lưu vào cookie
export const encodeData = (data) => {
    // Sử dụng JWT để tạo token từ dữ liệu
    return jwt.sign(data, 'nhoksky1991'); // Thay 'your_secret_key' bằng khóa bí mật thực sự của bạn
};

// Hàm giải mã dữ liệu khi đọc từ cookie
export const decodeData = (token) => {
    // Giải mã token để lấy dữ liệu
    return jwt.verify(token, 'nhoksky1991'); // Thay 'your_secret_key' bằng khóa bí mật thực sự của bạn
};
