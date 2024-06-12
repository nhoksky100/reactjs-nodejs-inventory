
import { send } from 'emailjs-com';
import { toast } from 'react-toastify';

export const SendEmail = async (dataListAccount, code) => {
    try {

        // const profile = JSON.parse(localStorage.getItem('tokenProfileCustomer'));
        const data = {
            to_email: dataListAccount.accountEmail,
            from_name: 'Admin',
            to_name: dataListAccount.accountUserName || dataListAccount.accountEmail || ' ',
            message: [code], // port 2 array
            reply_to: 'nhoksky100@gmail.com', // send support admin
        };

        // Chuyển hàm send thành Promise bằng cách sử dụng hàm promisify
        const sendEmailPromise = new Promise((resolve, reject) => {
            send('service_9wqppm8', 'template_pq8hkcp', data, 'SR3upnVcR9Vw9RyDz')
                .then((response) => {
                    // Trả về kết quả thành công nếu không có lỗi
                    resolve(response);
                })
                .catch((error) => {
                    // Trả về lỗi nếu có lỗi
                    reject(error);
                });
        });

        // Chờ Promise hoàn thành trước khi hiển thị thông báo
        await sendEmailPromise;

        toast(<div className="advertise"><i className="fa fa-exclamation-triangle" aria-hidden="true" />
            <i>{'Đã gửi mã xác nhận đến email của bạn!'}</i></div>);
    } catch (error) {
        console.error('Lỗi khi gọi hàm send:', error);

    }
};
// user_1Zgrt13xMD2pw9OVJI6E4
// export  default SendEmail;
