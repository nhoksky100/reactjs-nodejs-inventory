import React, { Component, createRef } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import axios from 'axios';
import validator from 'validator';
import { randomId } from '../RandomId/randomId';
import { toast } from 'react-toastify';


import { connect } from 'react-redux';
import Cookies from 'universal-cookie';
import { UpdateDateTime } from '../UpdateDateTime';
import { isDisableInput } from '../../StoreRcd';

// const getDataAccountCustomer = () => axios.get('/signUpAccount').then((res) => res.data)
const getDataAccountCustomer = () => axios.get('/getAccount').then((res) => res.data)
const bcrypt = require('bcryptjs')


class FormChangePassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataAccountCustomer: null,
            // isEmailExist:false,
            password: '',
            confirmPassword: '',

            isShowHidePassword: false,
            errors: {

                password: '',
                confirmPassword: '',

            },
            hasSpecialCharacter: false,
            flagErrors: false,
            isLogin: false,
            isShowFormPasswordRetrival: false,

        }
        this.typingTimeoutRef = createRef()
        this._isMounted = false
    }
    componentDidMount() {
        this._isMounted = true


        this.getData();

        const cookies = new Cookies();
        const getCodeConfirmData = cookies.get('removeNewPassword') || false
        if (!getCodeConfirmData) {
            localStorage.removeItem("isConfirmCode")
        }
    }
    componentWillUnmount() {
        this._isMounted = false
        localStorage.removeItem('emailCustomer')
        localStorage.removeItem('emailInput')
    }

    getData = () => {
        this._isMounted = true
        getDataAccountCustomer().then((res) => {
            if (res) {

                const hashEmail = localStorage.getItem('emailCustomer') || ' '
                res.rows.map((value) => {
                    const isEmail = this.checkBcrypt(value.accountEmail, hashEmail)

                    if (isEmail) {
                        if (this._isMounted) {

                            this.setState({ dataAccountCustomer: value })
                        }
                    }
                })
            }


        })

            .catch((error) => {
                if (this.state.isMounted) {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Lỗi {error} !</i></div>)
                }
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

            if (/\s{1,}/.test(value)) {
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
        if (e.keyCode === 13) {
            this.handeClickSignUp()
        }
    };
    isCheckForm = () => {
        const { password, confirmPassword, } = this.state;
        // const hasSpecialCharacter = validator.matches(inputValue, /[!@#$%^&*(),.?":{}|<>]/); // Kiểm tra kí tự đặc biệt

        if (!password || typeof password !== 'string') {

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

        return true
    }
    checkBcrypt = (value, hashValue) => {
        return bcrypt.compareSync(value, hashValue)
    }

    handeClickSignUp = () => {
        const { username, password, flagErrors, dataAccountCustomer } = this.state;

        if (dataAccountCustomer) {
            const isCheckForm = this.isCheckForm();
            if (isCheckForm && !flagErrors) {
                // const id = randomId()
                const email = dataAccountCustomer.accountEmail;

                axios.post('/updateChangePassword', {
                    id: dataAccountCustomer.id,
                    accountPassword: password,
                    accountEmail: email,
                    accountDateUpdate: UpdateDateTime()
                })
                    .then((res) => {
                        localStorage.removeItem('isConfirmCode')
                        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            <i>Thay đổi thành công!</i></div>)
                    })
                setTimeout(() => {
                    this.setState({ isLogin: true })
                }, 1500);

            }
        }
    }
    showFormPasswordRetrival = () => {
        localStorage.removeItem('isConfirmCode')
        const cookies = new Cookies();
        cookies.remove('removeNewPassword', { path: '/' });
        this.setState({ isShowFormPasswordRetrival: true })
        this.props.ISDISABLEINPUT(false)
    }


    isShowForm = () => {
        const { errors } = this.state;
        return (
            <div className="wrap-login100 p-l-110 p-r-110 p-t-62 p-b-33">
                {/* <form  className="login100-form validate-form flex-sb flex-w"> */}
                <span className="login100-form-title p-b-53">Thay đổi mật khẩu</span>



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


                <div className="container-login100-form-btn m-t-17">
                    <button onClick={() => this.handeClickSignUp()} className="login100-form-btn">Xác nhận</button>
                </div>
                <div className="w-full text-center p-t-20">
                    <a onClick={() => this.showFormPasswordRetrival()} style={{ cursor: 'pointer', marginBottom: '10px' }} className="txt2">Thay đổi mật khẩu với email khác? </a><br />

                </div>
                <div className="w-full text-center p-t-35">

                    <span className="txt2">Quay lại </span>
                    <NavLink to="/login" className="txt2 bo1">
                        Đăng Nhập
                    </NavLink>
                </div>

                {/* </form> */}
            </div>
        )
    }

    render() {
        const { isShowFormPasswordRetrival, isLogin } = this.state;
        const getIsConfirmCode = localStorage.getItem('isConfirmCode') || 'false';
        const isShowFormNewPassword = bcrypt.compareSync('true', getIsConfirmCode)

        if (isLogin) {
            //onClick
            return <Navigate to='/login' />
        }
        else if (isShowFormPasswordRetrival) {
            // onClick 
            return <Navigate to='/login/password-retrieval' />
            // this.props.ISSHOW_FORMCHANGE_PASSOWRD(false)
        }
        else if (isShowFormNewPassword) {
            // tải lại trang thay đổi
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
        } else {
            return <Navigate to='/login/password-retrieval' />
        }



    }

}
const mapStateToProps = (state, ownProps) => {
    return {
        // isDisableInput: state.allReducer.isDisableInput,
        // isChangePassword: state.allReducer.isChangePassword,
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        ISDISABLEINPUT: (action_isDisableInput) => {
            dispatch(isDisableInput(action_isDisableInput))
        },

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FormChangePassword)
