export const FormatNumber = (numString) => {
    // num = parseFloat(num);
    // return num.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    // Bỏ dấu phẩy trong chuỗi số để chuyển đổi thành số
    if (typeof numString !== 'string') {
        // Trả về giá trị không làm thay đổi
        return numString;
    }
    const num = parseFloat(numString.replace(/,/g, ''));
    // Kiểm tra nếu giá trị không phải là một số hợp lệ
    if (isNaN(num)) {
        return numString;
    }
    // Chuyển đổi số thành chuỗi với định dạng mong muốn
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}