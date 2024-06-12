import React, { Component, createRef } from 'react';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';
import validator from 'validator';
import { randomId } from '../RandomId/randomId';
import { toast } from 'react-toastify';
import { Redirect } from 'react-router-dom/cjs/react-router-dom';
import { UpdateDateTime } from '../UpdateDateTime';

// const getDataAccountCustomer = () => axios.get('/signUpAccount').then((res) => res.data)
const getDataAccountCustomer = () => axios.get('/account_Customer').then((res) => res.data)

class SignUpCustomer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataAccountCustomer: null,
            // isEmailExist:false,
            dataEmail: null,
            username: '',
            image:'',
            password: '',
            confirmPassword: '',
            email: '',
            isShowHidePassword: false,
            errors: {
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
            },
            hasSpecialCharacter: false,
            flagErrors: false,
            isLogin: false

        }
        this.typingTimeoutRef = createRef()
    }
    componentDidMount() {
        this.getData();
    }

    getData = () => {
        getDataAccountCustomer().then((res) => {
            // console.log(res, 'res');
            this.setState({ dataAccountCustomer: res })
        })

            .catch((error) => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Lỗi {error} !</i></div>)
            })

    }
    isChange = (e) => {

        const { name, value } = e.target;
        const errors = { ...this.state.errors }
        let flagErrors = false;
        if (this.typingTimeoutRef.current) {
            clearTimeout(this.typingTimeoutRef.current);
        }
        this.typingTimeoutRef.current = setTimeout(() => {
            if (validator.isEmpty(value)) {
                errors[name] = ' không được để trống!';
                flagErrors = true;
            } else {
                errors[name] = '';
            }
            // Kiểm tra độ dài không quá 30 kí tự
            if (value.length > 30) {
                errors[name] = ' Không được quá 30 kí tự!';
                flagErrors = true;
            }
            else if (name === 'username' && validator.matches(value, /[!@#$%^&*(),.?":{}|<>]/)) {
                errors[name] = ' Tên tài khoản không được chứa kí tự đặt biệt!';
                flagErrors = true;

            }
            else if (/\s{1,}/.test(value)) {
                errors[name] = ' Không được chứa khoảng trắng!';
                flagErrors = true;
            }
            else if (name === 'password') {  // Kiểm tra password có ít nhất 8 kí tự và không phải toàn số
                if (value.length < 8) {
                    errors[name] = ' Mật khẩu phải có ít nhất 8 kí tự!';
                    flagErrors = true;
                } else if (/^\d+$/.test(value)) {
                    errors[name] = ' Mật khẩu không được chứa toàn bộ số!';
                    flagErrors = true;
                } else {
                    errors[name] = '';
                }
            }
            else if (!validator.isEmail(value) && name === 'email') {
                errors[name] = 'Email không hợp lệ';
                flagErrors = true;
            }

            this.setState({
                [name]: value, errors, flagErrors: flagErrors,
            })
        }, 500); // Khoảng thời gian 0.5 giây
    }
    handleKeyDown = (e) => {
        // Kiểm tra xem ký tự có phải là một trong các ký tự tiếng Anh, số hoặc ký tự đặc biệt không
        const isEnglishOrNumberOrSpecial = /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]*$/.test(e.key);

        if (!isEnglishOrNumberOrSpecial) {
            // Nếu không phải là ký tự tiếng Anh, ngăn chặn sự kiện
            e.preventDefault();
        }
    };
    isCheckForm = () => {
        const { username, password, confirmPassword, email, dataEmail, } = this.state;
        // const hasSpecialCharacter = validator.matches(inputValue, /[!@#$%^&*(),.?":{}|<>]/); // Kiểm tra kí tự đặc biệt

        if (!username || typeof username !== 'string') {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Tên tài khoản không được để trống!</i></div>)

            return false
        }
        else if (this.isExistAccount(email, username)) {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Tài khoản người dùng này đã có!</i></div>)
            return false
        }
        else if (!password || typeof password !== 'string') {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Mật khẩu không được để trống!</i></div>)
            return false
        }
        else if (!confirmPassword || typeof confirmPassword !== 'string') {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Xác nhận mật khẩu không được để trống!</i></div>)
            return false
        }
        else if (password !== confirmPassword) {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Mật khẩu xác nhận không khớp!</i></div>)
            return false
        }


        else if (!email || typeof email !== 'string') {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Email không được để trống!</i></div>)
            return false
        }


        return true
    }
    isExistAccount = (email, username) => {
        const { dataAccountCustomer } = this.state;
        let flagExist = false;
        dataAccountCustomer.map((value) => {
            if (email === value.email || username === value.username) {
                flagExist = true
            }
        })
        if (flagExist)
            return true
        else
            return false

    }
    handeClickSignUp = () => {
        const { username, password, email, flagErrors,image } = this.state;
        
        const isCheckForm = this.isCheckForm();
        if (isCheckForm && !flagErrors) {
            const date = new Date();
            const dateTimeCreate = UpdateDateTime(date)
            const id = randomId()
            axios.post('/signUp_Account', { id, username, password, email,image, dateTimeCreate })
                .then((res) => {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Đăng ký thành công!</i></div>)
                })
            setTimeout(() => {
                this.setState({ isLogin: true })
            }, 1500);

        }
    }
    isShowForm = () => {
        const { errors } = this.state;
        return (
            <div className="wrap-login100 p-l-110 p-r-110 p-t-62 p-b-33">
                {/* <form  className="login100-form validate-form flex-sb flex-w"> */}
                <span className="login100-form-title p-b-53">Đăng Ký</span>

                <div className="p-t-31 p-b-9">
                    <span className="txt1">Tên tài khoản</span>
                </div>
                <div
                    className="wrap-input100 validate-input"
                // data-validate="username is required"
                >
                    <input onChange={(e) => this.isChange(e)} className="input100" type="text" name="username" />
                    <span className="focus-input100" />
                    <label>{errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}</label>
                </div>
                <div className="p-t-13 p-b-9">
                    <span className="txt1">Mật khẩu</span>

                </div>
                <div
                    className="wrap-input100 validate-input"
                // data-validate="Password is required"
                >
                    <input onChange={(e) => this.isChange(e)} className="input100"
                        type={this.state.isShowHidePassword ? "text" : "password"}
                        onKeyDown={this.handleKeyDown}
                        name="password" />
                    <span className="focus-input100" />
                    <label>{errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}</label>

                    <i
                        onClick={() => this.setState({ isShowHidePassword: !this.state.isShowHidePassword })}
                        style={{
                            position: 'absolute', right: '0', top: '0', fontSize: '25px', cursor: 'pointer'
                        }}
                        className={this.state.isShowHidePassword ? "fa fa-eye" : "fa fa-eye-slash"} aria-hidden="true"></i>
                </div>
                <div className="p-t-13 p-b-9">
                    <span className="txt1">Xác nhận mật khẩu</span>

                </div>
                <div
                    className="wrap-input100 validate-input"
                // data-validate="Confirm Password is required"
                >
                    <input onChange={(e) => this.isChange(e)} className="input100"
                        onKeyDown={this.handleKeyDown}
                        type={this.state.isShowHidePassword ? "text" : "password"}
                        name="confirmPassword" />
                    <span className="focus-input100" />
                    <label>{errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}</label>
                </div>
                <div className="p-t-13 p-b-9">
                    <span className="txt1">Email</span>

                </div>
                <div
                    className="wrap-input100 validate-input"
                // data-validate="Email is required"
                >
                    <input onChange={(e) => this.isChange(e)} className="input100" type="text" name="email" />
                    <span className="focus-input100" />
                    <label>{errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}</label>
                </div>
                <div className="container-login100-form-btn m-t-17">
                    <button onClick={() => this.handeClickSignUp()} className="login100-form-btn">Đăng Ký</button>
                </div>
                <div className="w-full text-center p-t-55">
                    <span className="txt2">Bạn có tài khoản? </span>
                    <NavLink to="/login" className="txt2 bo1">
                        Đăng Nhập
                    </NavLink>
                </div>
                {/* </form> */}
            </div>
        )
    }
    render() {

        if (this.state.isLogin) {
            return <Redirect to='/login' />
        }
        return (
            <div className="limiter">
                <div
                    className="container-login100"
                // style={{ backgroundImage: 'url("../../../../ProfileCustomer/LoginSignUp/images/bg-01.jpg")' }}
                >
                    {this.isShowForm()}
                </div>
            </div>
        );
    }
}

export default SignUpCustomer;