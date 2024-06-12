import firebase from './firebaseConfig';

// Hàm này nhận một số điện thoại và gửi mã OTP đến số điện thoại đó
export const ConnectFirebaseSMS = (phoneNumber) => {
    // Gọi phương thức signInWithPhoneNumber() từ Firebase Authentication
    // Đối số phoneNumber là số điện thoại mà bạn muốn gửi mã OTP đến
    return firebase.auth().signInWithPhoneNumber(phoneNumber)
        .then((confirmationResult) => {
            // Mã OTP đã được gửi đi thành công
            // confirmationResult chứa thông tin về quá trình xác nhận, bạn có thể lưu lại để sử dụng sau này
            return confirmationResult;
        })
        .catch((error) => {
            // Xử lý các lỗi nếu có
            console.error("Error sending verification code:", error);
            throw error;
        });
};
