import axios from 'axios';
const bcrypt = require('bcrypt');
const fs = require('fs/promises');

export const stringEncryption = (tokenProfileCustomer) => {
    // Chuỗi cần mã hóa
    // const tokenProfileCustomer = 'your_token_value';

    // Số lượt lặp, số càng lớn càng an toàn, nhưng cũng tăng thời gian xử lý
    const saltRounds = 10;

    // Mã hóa chuỗi
    bcrypt.hash(tokenProfileCustomer, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing tokenProfileCustomer:', err);
            // Xử lý lỗi nếu cần thiết
            return;
        }

        // Lưu hash vào file JSON
        const dataToSave = { hashedToken: hash };
        fs.writeFileSync('tokenProfileCustomer.json', JSON.stringify(dataToSave));
        console.log('TokenProfileCustomer hashed and saved to tokenProfileCustomer.json');
        return dataToSave
    });
}