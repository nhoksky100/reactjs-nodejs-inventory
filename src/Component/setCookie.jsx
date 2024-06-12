import Cookies from 'universal-cookie';
// const encodeData = (data) => {
//     // Chuyển đổi dữ liệu sang JSON và mã hóa base64
//     return btoa(JSON.stringify(data));
// };
// const decodeData = (encodedData) => {
//     // Giải mã dữ liệu từ base64 và chuyển đổi về JSON
//     return JSON.parse(atob(encodedData));
// };
export const setCookie = (username, codeToken, expirationMinutes) => {
    let cookie = new Cookies();
    let minutes = expirationMinutes || 5; // 5 phút mặc định
    let d = new Date();
    d.setTime(d.getTime() + minutes * 60 * 1000);

    // Tạo đối tượng cookieOptions để cấu hình cookie
    let cookieOptions = {
        path: '/',
        expires: d,
    };

    // Thêm thông tin profileObj và thời gian vào cookieOptions
    if (codeToken) {
        cookieOptions = {
            ...cookieOptions,
            codeToken: codeToken,
            expirationTime: d.getTime(), // Lưu thời gian hết hạn dưới dạng timestamp
        };
    }

    // Đặt cookie với các tùy chọn đã cấu hình
   return document.cookie = `${username}=${JSON.stringify(cookieOptions)}; expires=${d.toUTCString()}; path=/; SameSite=None; Secure`;
};