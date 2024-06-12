const express = require('express');
const router = express.Router();
// const axios = require('axios');
const path = require('path');
const cors = require('cors');
const fs = require('fs/promises');



// Kích hoạt Cors Middleware với cấu hình tùy chỉnh (nếu cần)
router.use(cors({
    origin: 'http://localhost:3000', // Cấp quyền cho domain React của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép sử dụng Cookie và các loại xác thực khác
}));
const upload_file = path.join(__dirname, './Upload_File.json');
router.post('/uploadFile', async function (req, res) {
    try {
        // Đọc dữ liệu từ file JSON
        const jsonData = await fs.readFile(upload_file, 'utf8');
        const data = JSON.parse(jsonData);

        // Xử lý dữ liệu và thêm một bản ghi mới
        const { id, nameSong, nameSinger, categoryMusic, describe, imageProfile, audioFile, dateTime, } = req.body;
        const dataLikeList = {
            id: id,
            nameSong: nameSong,
            nameSinger: nameSinger,
            categoryMusic: categoryMusic,
            describe: describe,
            imageProfile: imageProfile,
            audioFile: audioFile,
            dateTime: dateTime
        };
        data.push(dataLikeList);

        // Ghi dữ liệu mới vào file JSON
        await fs.writeFile(upload_file, JSON.stringify(data, null, 4), 'utf8');

        // Phản hồi với dữ liệu mới
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
