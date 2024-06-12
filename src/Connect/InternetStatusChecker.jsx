import React, { Component } from 'react';
import { toast } from 'react-toastify';

export class InternetStatusChecker extends Component {
  componentDidMount() {
    this.checkInternetConnection();
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatusChange);
    window.removeEventListener('offline', this.handleOnlineStatusChange);
  }

  checkInternetConnection = () => {
    fetch('https://www.google.com', { mode: 'no-cors' })
      .then(() => {
        toast.dismiss(); // Đóng thông báo nếu đã kết nối mạng
      })
      .catch(() => {
        toast.error(
          <div className="advertise">
            <i className="fa fa-minus-circle" aria-hidden="true" />
            <i>Mất kết nối mạng! <a style={{ color: 'black' }} href='#reload' onClick={() => window.location.reload()}>Làm mới</a></i>
          </div>
        );
      });
  };

  handleOnlineStatusChange = () => {
    this.checkInternetConnection();
  };

  render() {
    return null; // Component này không render ra gì cả, chỉ xử lý logic
  }
}
