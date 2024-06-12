import React, { Component, createRef } from 'react';
import validator from 'validator';
import { toast } from 'react-toastify';
import { NavLink, Navigate } from 'react-router-dom';
import axios from 'axios';
import FormSMSDigitNumber from './FormSMSDigitNumber';
import TimerSend from './TimerSend';
import { connect } from 'react-redux';
import { SendEmail } from '../EmailSend/SendEmail';
import Cookies from 'universal-cookie';
import { setCookie } from '../setCookie';
import { isClearFormInput, isDisableInput, reSendEmail } from '../../StoreRcd';

const bcrypt = require('bcryptjs')

const getDataAccountCustomer = () => axios.get('/getAccount').then((res) => res.data)
// const getDataSendEmailConfirm = () => axios.get('/sendEmailConfirm').then((res) => res.data)

class PasswordRetrieval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataAccountCustomer: null,
            email: '',
            errors: {
                email: '',
            },
            isFormConfirm: false, isConfirmCode: false,
            isMounted: false,
        }
        this.typingTimeoutRef = createRef()
    }
    componentDidMount() {
        const getIsFormConfirm = localStorage.getItem('isFormConfirm') || 'false'; //form sms
        const getIsConfirmCode = localStorage.getItem('isConfirmCode') || 'false'; //form new password
        const isShowFormConfirm = this.checkBcrypt('true', getIsFormConfirm);
        if (isShowFormConfirm) {

            const emailInput = localStorage.getItem('emailInput') || ''
            if (emailInput) {
                this.setState({ email: emailInput })
            }
            this.setState({ isFormConfirm: true });
        }
        const isShowFormNewPassword = this.checkBcrypt('true', getIsConfirmCode);
        if (isShowFormNewPassword) {
            this.setState({ isConfirmCode: true });
            // this.props.ISSHOW_FORMCHANGE_PASSOWRD(true);
        }
        this.setState({ isMounted: true });
    }

    componentWillUnmount() {
        this.setState({ isMounted: false, isConfirmCode: false });

    }

    isChange = (e) => {

        const { name, value } = e.target;
        const errors = { ...this.state.errors }
        let flagErrors = false;
        if (this.typingTimeoutRef.current) {
            clearTimeout(this.typingTimeoutRef.current);
        }
        // this.typingTimeoutRef.current = setTimeout(() => {
        if (validator.isEmpty(value)) {
            errors[name] = ' không được để trống!';
            flagErrors = true;
        } else {
            errors[name] = '';
        }


        if (/\s{1,}/.test(value)) {
            errors[name] = ' Không được chứa khoảng trắng!';
            flagErrors = true;
        }

        else if (!validator.isEmail(value) && name === 'email') {
            errors[name] = 'Email không hợp lệ';
            flagErrors = true;
        }

        this.setState({
            [name]: value, errors, flagErrors: flagErrors,
        })
        // }, 500); // Khoảng thời gian 0.5 giây
    }
    // getData = () => {
    //     getDataAccountCustomer().then((res) => {
    //         // console.log(res, 'res');
    //         this.setState({ dataAccountCustomer: res })
    //     })

    //         .catch((error) => {
    //             toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
    //                 <i>Lỗi {error} !</i></div>)
    //         })

    // }
    checkEmailExist = async () => {
        const { dataAccountCustomer, email } = this.state;
        let flagExist = false;

        try {
            const res = await getDataAccountCustomer();

            res.rows.forEach((value) => {
                if (value.accountEmail === email) {
                    this.setState({ dataAccountCustomer: value })
                    flagExist = true;
                }
            });
        } catch (error) {
            toast(
                <div className="advertise">
                    <i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Lỗi {error} !</i>
                </div>
            );
        } finally {

            return flagExist;
        }
    }

    // set cookie code 
    // setCookie = (username, codeToken, expirationMinutes) => {
    //     let cookie = new Cookies();
    //     let minutes = expirationMinutes || 5; // 5 phút mặc định
    //     let d = new Date();
    //     d.setTime(d.getTime() + minutes * 60 * 1000);

    //     // Tạo đối tượng cookieOptions để cấu hình cookie
    //     let cookieOptions = {
    //         path: '/',
    //         expires: d,
    //     };

    //     // Thêm thông tin profileObj và thời gian vào cookieOptions
    //     if (codeToken) {
    //         cookieOptions = {
    //             ...cookieOptions,
    //             codeToken: codeToken,
    //             expirationTime: d.getTime(), // Lưu thời gian hết hạn dưới dạng timestamp
    //         };
    //     }

    //     // Đặt cookie với các tùy chọn đã cấu hình
    //     document.cookie = `${username}=${JSON.stringify(cookieOptions)}; expires=${d.toUTCString()}; path=/; SameSite=None; Secure`;
    // };


    // bcrypt get 
    setBcrypt = (hash, salt) => {
        // salt =10 :
        return bcrypt.hashSync(hash, salt);
    }
    checkBcrypt = (value, hashValue) => {
        return bcrypt.compareSync(value, hashValue)
    }
    //confirm email 
    handeClickConfirmEmail = () => {

        try {

            const cookies = new Cookies();
            const getCodeConfirmData = cookies.get('codeConfirm') || null
            const { codeConfirmInput } = this.props || null;
            // xử lý xác nhận mã 

            const pushCodeConfirmInputValue = codeConfirmInput.map((str) => str.charAt(0)).join("") || ' ';


            //Sử dụng async/await để xử lý hàm bcrypt.compare
            const isConfirm = this.checkBcrypt(pushCodeConfirmInputValue, getCodeConfirmData.codeToken) || false
            // bcrypt.compareSync(pushCodeConfirmInputValue, getCodeConfirmData.codeConfirm) || false;

            // console.log(isConfirm, 'isConfirm');
            if (isConfirm) {
                //true
                // this.props.ISCONFIRM(true);
                // mở form new password 
                const hashFormConfirm = this.setBcrypt('true', 10);
                localStorage.setItem('isConfirmCode', hashFormConfirm)
                // remove form sms;
                localStorage.removeItem('isFormConfirm')

                this.setState({ isConfirmCode: true, isFormConfirm: false })
                // setCookie khi xác nhận code chính xác trong thời gian thay đổi mật khẩu 
                // this.setCookie('removeNewPassword', getCodeConfirmData.codeToken, 360); // setcookie trong 6h=360p ,nếu hết 6h sẽ tự động xóa form new password
                setCookie('removeNewPassword', getCodeConfirmData.codeToken, 360)
                // remove cookie codeConfirm
                cookies.remove('codeConfirm', { path: '/' });
            } else {
                localStorage.setItem('isFormConfirm', true)
                this.setState({ isConfirmCode: false, isFormConfirm: true })
                // this.props.ISCONFIRM(false);
                this.props.ISCLEARFORMINPUT(true);
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Xác nhận mã không đúng!</i></div>)
            }

        } catch {
            // this.props.ISCONFIRM(false);
            this.props.ISCLEARFORMINPUT(true);
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Thời gian xác nhận mã đã hết!</i></div>)

        }
    }
    generateRandomNumbers = () => {
        // Tạo ra một mảng chứa 6 con số ngẫu nhiên từ 0 đến 9
        const randomNumbersArray = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

        // Chuyển mảng thành chuỗi và trả về
        return randomNumbersArray
    };

    // send email && check exist email 
    handeClickSendMail = async () => {
        try {
            const { flagErrors } = this.state;

            let checkEmailExist = await this.checkEmailExist();

            if (!flagErrors && checkEmailExist) {
                const { email, dataAccountCustomer } = this.state;
                const randomNumber = this.generateRandomNumbers();

                const codeConfirm = this.setBcrypt(randomNumber.join(""), 10);
                // this.setCookie('codeConfirm', codeConfirm, 5);
                setCookie('codeConfirm', codeConfirm, 5)
                // gửi mã đến email người dùng 
                SendEmail(dataAccountCustomer, randomNumber.join(""));
                // console.log(randomNumber);

                // Vô hiệu hóa input email
                this.props.ISDISABLEINPUT(true);
                const hashFormConfirm = this.setBcrypt('true', 10);
                // Mở form input sms và form timersend
                localStorage.setItem('isFormConfirm', hashFormConfirm);
                // set email bcrypt
                const emailCustomer = this.setBcrypt(email, 10);
                localStorage.setItem('emailCustomer', emailCustomer);
                localStorage.setItem('emailInput', email);
                this.setState({ isFormConfirm: true });

            } else {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Email không tồn tại!</i></div>);
            }
        } catch (error) {
            console.error('Error in handeClickSendMail:', error);
            // Xử lý lỗi ở đây nếu cần thiết
        }
    }

    goBack = () => {
        // Sử dụng history để thực hiện chuyển hướng trở lại
        // this.props.history.goBack();

        this.setState({
            isFormConfirm: false,
            isConfirmCode: false,

        })
        localStorage.removeItem('isFormConfirm');
        localStorage.removeItem('isConfirmCode');
        localStorage.removeItem('emailInput')
        localStorage.removeItem('emailCustomer')
        this.props.ISDISABLEINPUT(false)
        const cookies = new Cookies();
        // Xóa cookie bằng cách đặt hết hạn sớm hơn hiện tại
        cookies.remove('codeConfirm', { path: '/' });
    }
    componentDidUpdate(prevProps, prevState) {
        const { reSendEmail } = this.props;
        if (reSendEmail && reSendEmail !== prevProps.reSendEmail) {
            // gửi lại mã đến email 
            this.handeClickSendMail();
            this.props.IS_RE_SENDEMAIL(false)

        }
    }

    isShowForm = () => {
        const { errors, isFormConfirm, dataAccountCustomer } = this.state;
        const { isDisableInput } = this.props;
        // console.log(this.props.isDisableInput, 'isDisableInput');
        return (
            <div className="wrap-login100 p-l-110 p-r-110 p-t-62 p-b-33">
                <div className='goback' style={{ position: 'absolute', top: '0', left: '0', cursor: 'pointer' }}>
                    {/* Gọi hàm goBack khi cần */}
                    {isFormConfirm &&
                        <i onClick={this.goBack} style={{ cursor: 'pointer', fontSize: '35px' }} className="fa fa-arrow-left" aria-hidden="true" />
                    }

                </div>
                <div className="p-t-13 p-b-9">
                    <span className="login100-form-title p-b-53">Điền email của bạn</span>

                </div>
                <div
                    className="wrap-input100 validate-input"
                // data-validate="Email is required"
                >
                    <input disabled={isDisableInput} onChange={(e) => this.isChange(e)} value={this.state.email} placeholder='email' className="input100" type="text" name="email" />
                    <span className="focus-input100" />
                    <label>{errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}</label>
                </div>
                {isFormConfirm && <FormSMSDigitNumber />}
                {isFormConfirm && <TimerSend />}
                <div className="container-login100-form-btn m-t-17">
                    {isFormConfirm
                        ? <button onClick={() => this.handeClickConfirmEmail()} className="login100-form-btn">Xác nhận</button>
                        : <button onClick={() => this.handeClickSendMail()} className="login100-form-btn">Gửi</button>

                    }
                </div>
                <div className="w-full text-center p-t-55">
                    {/* <span className="txt2"> </span> */}
                    <NavLink to="/login" className="txt2 bo1">
                        Quay lại đăng nhập
                    </NavLink>
                </div>

            </div>
        )
    }


    render() {
        const { isConfirmCode, isMounted } = this.state;

        if (isConfirmCode) {
            return <Navigate to='/new-password' />
        }
        return (
            <div className="limiter">
                <div className="container-login100">
                    {isMounted && ( // Kiểm tra component có còn tồn tại không
                        this.isShowForm()
                    )}

                </div>
            </div>
        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        isDisableInput: state.allReducer.isDisableInput,
        codeConfirmInput: state.allReducer.codeConfirmInput,
        // isConfirmCode: state.allReducer.isConfirmCode,
        reSendEmail: state.allReducer.reSendEmail,

    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        ISDISABLEINPUT: (action_isDisableInput) => {
            dispatch(isDisableInput(action_isDisableInput))
        },
       
        ISCLEARFORMINPUT: (action_isClearFormInput) => {
            dispatch(isClearFormInput(action_isClearFormInput))
        },
        IS_RE_SENDEMAIL: (action_reSendEmail) => {
            dispatch(reSendEmail(action_reSendEmail))
        }

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PasswordRetrieval)
