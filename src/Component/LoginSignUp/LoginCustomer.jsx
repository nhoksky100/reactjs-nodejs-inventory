import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { NavLink, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// import LoginFacebook from './LoginFacebook';
// import LoginGoogle from './LoginGoogle';

import Cookies from 'universal-cookie';
import { setCookie } from '../setCookie';
// import { connect } from 'react-redux';

// import { encodeData,decodeData } from './CookieUtils'; // Đường dẫn đến file chứa hàm getDecodedCookie

const getdataAccount = () => axios.get('/getAccount').then((res) => res.data)

class LoginCustomer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dataAccount: [],
            username: '',
            password: '',
            isDisabled: false,
            isShowHidePassword: false,
        };
        this.timer = null;
        this._isMounted = false
    }

    isChange = (e) => {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })

    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidMount() {
        this._isMounted = true;
        this.getData();
    }
    handleKeyDown = (e) => {
        // Kiểm tra xem ký tự có phải là một trong các ký tự tiếng Anh, số hoặc ký tự đặc biệt không
        const isEnglishOrNumberOrSpecial = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]*$/.test(e.key);

        if (!isEnglishOrNumberOrSpecial) {
            // Nếu không phải là ký tự tiếng Anh, ngăn chặn sự kiện
            e.preventDefault();
        }
        if (e.keyCode === 13) {
            this.handleClickLogin()
        }

    }
    handleKeyDownUser = (e) => {
        if (e.keyCode === 13) {
            this.handleClickLogin()
        }
    }
    getData = () => {
        getdataAccount().then((res) => {
            // console.log(res, 'res');
            if (this._isMounted) {

                this.setState({ dataAccount: res.rows })
            }
        })

            .catch((error) => {
                if (this._isMounted)
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Lỗi {error} !</i></div>)
            })

    }
    // setCookie = (username, token, profileObj) => {
    //     let cookie = new Cookies();
    //     let minutes = 1140; // 1140m 1 day

    //     let d = new Date();
    //     d.setTime(d.getTime() + minutes * 60 * 1000);

    //     // Tạo đối tượng cookieOptions để cấu hình cookie
    //     let cookieOptions = {
    //         path: "/",
    //         expires: d,
    //     };

    //     // Thêm thông tin profileObj vào cookieOptions
    //     if (profileObj) {
    //         cookieOptions = {
    //             ...cookieOptions,
    //             profileObj: profileObj,
    //         };
    //     }

    //     // Đặt cookie với các tùy chọn đã cấu hình
    //     // cookie.set(username, token, cookieOptions);


    //     document.cookie = `loginObject=${JSON.stringify(profileObj)}; expires=${d.toUTCString()}; path=/; SameSite=None; Secure`;

    // };






    // decodeShow  =()=>  {
    //     const encode = this.getCookie('loginObject') || []
    //     axios.post('/decodeData', { encode: encode.codeToken }).then((res) => {

    //         if (res.data.isDeCode) {
    //             // tokenObj: res.data.decodeData,
    //           
    //             // return res.data.decodedData


    //         }
    //     })
    // }



    handleClickLogin = () => {
        const { dataAccount, username, password } = this.state;

        // console.log(stringtoslug(username),'username');
        console.log(dataAccount, 'dataAccount');
        let flagLogin = false;

        if (!dataAccount || dataAccount.length === 0) {
            console.error('No data account found.');
            return;
        }

        this.setState({ isDisabled: true }); // Vô hiệu hóa nút

        // Tạo một mảng chứa tất cả các promise
        const promises =dataAccount && dataAccount.length > 0 && dataAccount.map((value) => {
          
            if ((username === value.accountUserName || username === value.accountEmail) && value.accountStatus === 'Đang sử dụng') {
                let dataLogin = value;
                console.log(value,'value');
                // Trả về một promise từ mỗi yêu cầu axios.post
                return axios.post('/login_Account', { dataLogin, username, password })
                    .then((res) => {
                        if (res.data.isLogin) {
                            flagLogin = true;
                            delete dataLogin.accountPassword;
                            dataLogin.accountPermission = res.data.hashPermission;
                            // const dataEncode = res.data.tokenData || []

                            // sessionStorage.setItem('encode', JSON.stringify(dataEncode));

                            // Mã hóa dữ liệu trước khi lưu vào cookie
                            // const encodedDataLogin = encodeData(dataLogin);
                            setCookie('loginObject', dataLogin, 1140)

                            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                                <i>Đăng nhập thành công!</i></div>);
                            // xử lý truyền router khi đang nhập thành công
                        }
                    })
                    .catch((error) => {
                        console.error('Error during login:', error);
                    });
            }
            // Nếu không khớp, trả về một promise đã giải quyết ngay lập tức
            return Promise.resolve();
        });

        // Sử dụng Promise.all để chờ tất cả các promise hoàn thành
        Promise.all(promises)
            .then(() => {
                // Sau khi tất cả promises đã hoàn thành, kiểm tra giá trị của flagLogin
                if (!flagLogin) {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Tên tài khoản /email hoặc mật khẩu không đúng!</i></div>);
                }
                // Đặt lại trạng thái của nút và trường nhập sau khoảng thời gian
                setTimeout(() => {
                    this.setState({
                        isDisabled: false,
                        username: '',
                        password: ''
                    });
                    // this.refs.username.value = "";
                    // this.refs.password.value = "";
                }, 1500);
            });


    }

    isShowForm = () => {
        const { dataAccount } = this.state;
        return (
            <Fragment>

                <div
                    className="container-login100"
                // style={{ backgroundImage: 'url("../../../../ProfileCustomer/LoginSignUp/images/bg-01.jpg")' }}
                >
                    <div className="wrap-login100 p-l-110 p-r-110 p-t-62 p-b-33">
                        <span className="login100-form-title p-b-53">Đăng Nhập</span>
                        {/* <form className="login100-form validate-form flex-sb flex-w">
                            
                            <LoginFacebook />
                            <LoginGoogle />
                        </form> */}
                        <div className="p-t-31 p-b-9">
                            <span className="txt1">Tên tài khoản / Email</span>
                        </div>
                        <div
                            className="wrap-input100 validate-input"
                            data-validate="Username is required"
                        >
                            <input onKeyDown={this.handleKeyDownUser} onChange={(e) => this.isChange(e)} className="input100" type="text"

                                value={this.state.username} name="username" />
                            <span className="focus-input100" />
                        </div>
                        <div className="p-t-13 p-b-9">
                            <span className="txt1">Mật khẩu</span>
                            <NavLink to="/login/password-retrieval" className="txt2 bo1 m-l-5">
                                Quên?
                            </NavLink>

                        </div>
                        <div
                            className="wrap-input100 validate-input"
                            data-validate="Password is required"
                        >
                            <input onChange={(e) => this.isChange(e)}
                                onKeyDown={this.handleKeyDown}
                                value={this.state.password} className="input100"
                                type={this.state.isShowHidePassword ? "text" : "password"}
                                name="password" />
                            <span className="focus-input100" />

                            <i
                                onClick={() => this.setState({ isShowHidePassword: !this.state.isShowHidePassword })}
                                style={{
                                    position: 'absolute', right: '0', top: '0', fontSize: '25px', cursor: 'pointer'
                                }}
                                className={this.state.isShowHidePassword ? "fa fa-eye" : "fa fa-eye-slash"} aria-hidden="true"></i>
                        </div>
                        <div className="container-login100-form-btn m-t-17">
                            <button disabled={this.state.isDisabled} onClick={() => this.handleClickLogin()} className="login100-form-btn">Đăng Nhập</button>
                        </div>
                        {/* <div className="w-full text-center p-t-55">
                            <span className="txt2">Không phải thành viên? </span>
                            <NavLink to="/signup" className="txt2 bo1">
                                Đăng ký
                            </NavLink>
                        </div> */}
                        {/* </form> */}
                    </div>
                </div>
            </Fragment>
        )
    }

    render() {
        try {
            // let profileCustomer = JSON.parse(localStorage.getItem('tokenProfileCustomer')) || null;
            const cookies = new Cookies();

            // Lấy giá trị từ cookie
            const loginCustomerToken = cookies.get('loginObject');
            // console.log(loginCustomerToken, 'cookie');
            if (!loginCustomerToken) {
                return (

                    <div className="limiter" >
                        {this.isShowForm()}
                    </div>

                );
            } else {
                return <Navigate to='/' />
            }
        } catch (error) {
            return <div>
                <p>Đã xảy ra lỗi khi xử lý dữ liệu.</p>
            </div>
            // console.log(' lỗi', error);
        }
    }
}

export default LoginCustomer
