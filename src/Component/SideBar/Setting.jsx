import axios from 'axios';
import React, { Component } from 'react';
// import FormBankAccountInfo from './FormBankAccountInfo';
// import FormCardBank from './FormCardBank';
import validator from 'validator';
import Cookies from 'universal-cookie';
import { setCookie } from '../setCookie';
import { SendEmail } from '../EmailSend/SendEmail';
import { ConnectFirebaseSMS } from '../../Connect/ConnectFirebaseSMS';

import FormSMSDigitNumber from '../LoginSignUp/FormSMSDigitNumber';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import TimerSend from '../LoginSignUp/TimerSend';
import { isClearFormInput, isDisableInput, isUpdateSettingStore, reSendEmail } from '../../StoreRcd';

const bcrypt = require('bcryptjs')
const getDataImageProfile = () => axios.get('/imageFile').then((res) => res.data)

class Setting extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataProfile: this.props.tokenObj || [],
            errorMessageImage: '',
            imageProfile: '',
            image: '',
            isShowButtonClickProfile: false,

            isDisable: false,
            email: '',
            password: '******',
            initialDataProfile: {},
            phoneNumber: '',
            verificationCode: '',
            message: '',
            errors: {
                name: '',
                username: '',
                password: '',
                // confirmPassword: '',
                email: '',
                phone: '',

            },

            checkedRadioSendPhone: false,
            checkedRadioSendEmail: true,

            accountNumber: '',
            accountName: '',
            isShowFormBank: false,
            getCodeConfirmData: '',
        }
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const { tokenObj, reSendEmail } = this.props;

        if (tokenObj && tokenObj !== prevProps.tokenObj) {
            const email = this.emailHide(tokenObj.email)
            this.setState({
                dataProfile: tokenObj,
                email: email,

                // banks: [],

            })
        }

        if (reSendEmail && reSendEmail !== prevProps.reSendEmail) {
            // gửi lại mã đến email 
            this.handeClickEdit();
            this.props.IS_RE_SENDEMAIL(false)

        }

    }
    dataImageProfile = () => {

        getDataImageProfile().then((res) => {

            res.map((value) => {
                if (this.props.tokenObj.email === value.email) {

                    this.setState({ image: value.image, })
                    return;
                }
            })

        })
    }
    componentDidMount() {

        this.dataImageProfile()
        const checkedRadioSendEmail = localStorage.getItem('checkedRadioSendEmail') || 'false';
        const checkedRadioSendPhone = localStorage.getItem('checkedRadioSendPhone') || 'false';

        if (checkedRadioSendEmail === 'true') {
            this.setState({
                checkedRadioSendEmail: true,
                checkedRadioSendPhone: false
            })
        }
        else if (checkedRadioSendPhone === 'true') {
            this.setState({
                checkedRadioSendEmail: false,
                checkedRadioSendPhone: true
            })
        }
        const { dataProfile } = this.state;
        const email = this.emailHide(this.props.tokenObj.email || '') || '';

        let cookies = new Cookies();
        const getCodeConfirmData = cookies.get('codeConfirm') || ''

        this.setState({
            initialDataProfile: { ...dataProfile },
            email: email,
            getCodeConfirmData: getCodeConfirmData.codeToken
        });

        // this.setState({ email: email })

    }
    emailHide = (email) => {
        // Xác định vị trí của ký tự @ trong email

        // Tìm vị trí của ký tự "@" trong email
        const atIndex = email.indexOf('@') || '';

        // Tìm vị trí của ký tự "." sau ký tự "@"
        const dotIndex = email.indexOf('.', atIndex);
        // Tạo chuỗi ẩn cho phần username (5 ký tự đầu) và domain (sau ký tự "@")
        const hiddenUsername = email.substring(0, 4) + '*'.repeat(3);
        const hiddenDomain = dotIndex !== -1 ? email.substring(atIndex, dotIndex) + '*'.repeat(dotIndex - atIndex - 3) : '';

        // Kết hợp phần username và phần domain ẩn
        const hiddenEmail = hiddenUsername + hiddenDomain;
        return hiddenEmail
    }

    componentWillUnmount() {
        // Kiểm tra và thu hồi Object URL trước khi component bị hủy
        this.revokeObjectURL();

    }
    revokeObjectURL = () => {
        const { imageProfile } = this.state;
        if (imageProfile) {
            URL.revokeObjectURL(imageProfile[0]);
        }
    }



    // image file nén 

    compressImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = function (event) {
                let image = new Image();
                image.onload = function () {
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext('2d');
                    let width = image.width;
                    let height = image.height;

                    // Tính toán kích thước mới dựa trên maxWidth và maxHeight
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    // Thiết lập kích thước mới cho canvas
                    canvas.width = width;
                    canvas.height = height;

                    // Vẽ ảnh lên canvas với kích thước mới
                    ctx.drawImage(image, 0, 0, width, height);

                    // Convert canvas thành dạng blob và trả về
                    canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async handleFileChange(e) {

        const filesImg = e.target.files[0]; // lay ten file
        const fileSizeInMB = filesImg.size / (1024 * 1024); // Đổi từ byte sang MB
        if (fileSizeInMB > 5) {
            this.setState({ errorMessageImage: 'Hình ảnh bạn chọn vượt kích thướt cho phép dưới 5MB.', image: '' });
        }
        let image = await this.compressImage(filesImg, 800, 600, 0.7); // maxWidth, maxHeight, quality

        if (this.isImageFile(filesImg)) {
            // Chuyển blob thành base64 string
            let reader = new FileReader();
            reader.readAsDataURL(image);

            reader.onloadend = () => {
                let base64Data = reader.result;
                console.log(base64Data);

                // Lưu base64 string vào state
                this.setState({
                    image: base64Data,
                    errorMessageImage: '',
                    dataProfile: {
                        ...this.state.dataProfile,
                        image: base64Data // Cập nhật giá trị của image trong state
                    }
                });
            };
        }
    }





    isImageFile = (file) => {
        // Kiểm tra nếu định dạng file là hình ảnh
        return file.type.startsWith('image/');
        // return /\.(jpe?g|png|gif|bmp)$/i.test(file.name);
    };
    // getFile = (e) => {
    //     const filesImg = e.target.files[0]; // lay ten file
    //     const fileSizeInMB = filesImg.size / (1024 * 1024); // Đổi từ byte sang MB
    //     if (fileSizeInMB > 5) {
    //         this.setState({ errorMessageImage: 'Hình ảnh bạn chọn vượt kích thướt cho phép dưới 5MB.', imageProfile: '', image: '' });
    //     }
    //     else if (filesImg !== undefined) {
    //         if (this.isImageFile(filesImg)) {
    //             // let image = await this.compressImage(filesImg, 800, 600, 0.7); // maxWidth, maxHeight, quality

    //             let reader = new FileReader();
    //             reader.readAsDataURL(filesImg);
    //             reader.onloadend = function (e) {
    //                 // Thu hồi Object URL cũ trước khi cập nhật state
    //                 this.revokeObjectURL();

    //                 this.setState({
    //                     imageProfile: reader.result,
    //                     image: reader.result,
    //                     errorMessageImage: '',
    //                     dataProfile: {
    //                         ...this.state.dataProfile,
    //                         image: reader.result // Cập nhật giá trị của image trong state
    //                     }
    //                 })

    //             }.bind(this);
    //         }
    //         else {

    //             this.setState({
    //                 imageProfile: '',
    //                 image: '',
    //                 errorMessageImage: 'Chỉ chấp nhận file hình ảnh (jpg, png, etc.)',
    //             });
    //         }
    //     }

    // }
    generateRandomNumbers = () => {
        // Tạo ra một mảng chứa 6 con số ngẫu nhiên từ 0 đến 9
        const randomNumbersArray = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));

        // Chuyển mảng thành chuỗi và trả về
        return randomNumbersArray
    };
    checkCodeConfirm = () => {
        let cookies = new Cookies();
        const getCodeConfirmData = cookies.get('codeConfirm') || null
        const { codeConfirmInput } = this.props || null;
        // xử lý xác nhận mã 

        const pushCodeConfirmInputValue = codeConfirmInput.map((str) => str.charAt(0)).join("") || ' ';
        //Sử dụng async/await để xử lý hàm bcrypt.compare
        if (codeConfirmInput) {
            const isConfirm = bcrypt.compareSync(pushCodeConfirmInputValue, getCodeConfirmData.codeToken) || false
            if (isConfirm) {
                return true
            }
        }
        return false;

    }
    handeClickEdit = () => {

        const { dataProfile, initialDataProfile, flagErrors, checkedRadioSendEmail } = this.state;

        // console.log(initialDataProfile, 'initialDataProfile');
        // So sánh giữa giá trị mới và giá trị ban đầu

        const isDataChanged = JSON.stringify(dataProfile) !== JSON.stringify(initialDataProfile);
        const isPassword = bcrypt.compareSync(dataProfile.password, initialDataProfile.password) || ''
        // console.log(dataProfile.phone);
        if (isPassword) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Mật khẩu Mới của bạn trùng với mật khẩu cũ!</i></div>)
        }
        else if (isDataChanged && !flagErrors) {

            // Thực hiện lưu dữ liệu mới
            let randomNumber = [];
            if (checkedRadioSendEmail) {
                randomNumber = this.generateRandomNumbers();
                //   SendEmail(initialDataProfile, randomNumber.join(""))
            } else {

                const phoneNumber = ConnectFirebaseSMS(dataProfile.phone)
                console.log(phoneNumber, 'phone');
            }

            const hashCodeConfirm = bcrypt.hashSync(randomNumber.join(""), 10);
            setCookie('codeConfirm', hashCodeConfirm, 5)
            // gửi email để xác nhận thông tin 
            console.log(randomNumber, 'randomNumber');

            // gọi axios truyền xuống cập nhật dữ liệu mới,

            // trả về cho FA một dữ liệu mới cập nhật mới vào state 
            // Do something...

            this.setState({
                isShowButtonClickProfile: !this.state.isShowButtonClickProfile,
                isDisable: true,
                getCodeConfirmData: hashCodeConfirm
            })
        } else {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Lỗi điền form chưa chính xác hoặc chưa thay đổi!</i></div>)
            // console.log('Không có thay đổi trong dữ liệu.');
        }


    }
    handeClickRemove = () => {
        let cookies = new Cookies();
        cookies.remove('codeConfirm', { path: '/' });
        this.setState({
            isShowButtonClickProfile: false,
            isDisable: false,
            getCodeConfirmData: ''
        })
    }
    handeClickSave = () => {
        const isConfirm = this.checkCodeConfirm();
        try {
            if (isConfirm) {
                const { dataProfile, initialDataProfile } = this.state;
                const { id, image } = this.state.dataProfile;
                if (dataProfile.password !== initialDataProfile.password) {
                    dataProfile.password = bcrypt.hashSync(dataProfile.password, 10);
                }
                delete dataProfile.image;


                let cookies = new Cookies();
                cookies.remove('codeConfirm', { path: '/' });
                // lưu vào data json
                axios.post('/updateAccount', { dataProfile })
                    .then(response => {
                        // console.log(response.data,'response.data');
                        // Xử lý khi cập nhật thành công 
                        setCookie('loginObject', dataProfile, 1140)
                        this.setState({
                            // dataProfile:response.data,
                            isShowButtonClickProfile: false,
                            isDisable: false,
                            getCodeConfirmData: ''
                        })
                        axios.post('/imageFile', { id, image })
                        this.props.IS_UPDATE_SETTING(true);

                        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            <i>Cập nhật thành công!</i></div>)
                    })
                    .catch((error) => {
                        console.log(error, 'eror');
                    })

                // truyền dữ liệ xuống lưu vào database
            } else {
                this.props.ISCLEARFORMINPUT(true);
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Xác nhận mã không đúng!</i></div>)
            }
        } catch {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Lỗi không tìm thấy!</i></div>)
        }

    }
    isRadioEmail = () => {
        localStorage.setItem("checkedRadioSendEmail", 'true')
        localStorage.setItem("checkedRadioSendPhone", 'false')
        this.setState({ checkedRadioSendEmail: true, checkedRadioSendPhone: false })
    }
    isRadioPhone = () => {
        localStorage.setItem("checkedRadioSendPhone", 'true')
        localStorage.setItem("checkedRadioSendEmail", 'false')
        this.setState({ checkedRadioSendPhone: true, checkedRadioSendEmail: false })
    }


    isChangeSelectBank = (e) => {
        const { value, name } = e.target;
        this.setState({ [name]: value }, () => {
            // Gửi yêu cầu API khi người dùng nhập xong số tài khoản
            if (value === 'bacc') {
                this.setState({ isShowFormBank: true })
            } else if (value === 'bc') {
                this.setState({ isShowFormBank: false })
            }
        });
        // this.setState({ [name]: value })
    }
    // check eror form
    formCheckError = (name, value) => {
        const errors = { ...this.state.errors }
        let flagErrors = false;
        if (validator.isEmpty(value) && name !== 'name' && name !== 'phone') {
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
        else if (name === 'name' && (/\s{2,}/.test(value))) {
            errors[name] = 'Họ tên không được chứa nhiều khoảng trắng!';
            flagErrors = true;

        }
        else if (name === 'name' && !validator.matches(value, /^[^0-9]+$/) && value !== '') {
            errors[name] = 'Họ tên không được chứa kí tự số!';
            flagErrors = true;

        }
        else if (name === 'name' && validator.matches(value, /[!@#$%^&*(),.?":{}|<>]/)) {
            errors[name] = 'Họ tên không được chứa kí tự đặt biệt!';
            flagErrors = true;

        }
        else if (name === 'username' && validator.matches(value, /[!@#$%^&*(),.?":{}|<>]/)) {
            errors[name] = ' Tên tài khoản không được chứa kí tự đặt biệt!';
            flagErrors = true;

        }
        else if (/\s{1,}/.test(value) && name !== 'name') {
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
        else if (name === 'phone') {  // Kiểm tra password có ít nhất 8 kí tự và không phải toàn số
            if (value.length < 10 || value.length > 14) {
                errors[name] = ' Số điện thoại không hợp lệ!';
                flagErrors = true;
            }
            else if (value.charAt(0) !== '0' && value.indexOf('+84') === -1 &&
                value.indexOf('84') === -1
            ) {
                errors[name] = ' Số điện thoại không hợp lệ!';
                flagErrors = true;
            } else if ((value.match(/\+/g) || []).length > 1 && !(/^\+[a-zA-Z!@#$%^&*(),.?":{}|<>]/.test(value)) ||
                validator.matches(value, /[a-zA-Z!@#$%^&*(),.?":{}|<>]/)
            ) {
                errors[name] = ' Số điện thoại không hợp lệ!';
                flagErrors = true;
            } else {
                errors[name] = '';
            }
        }
        else if (!validator.isEmail(value) && name === 'email') {
            errors[name] = 'Email không hợp lệ';
            flagErrors = true;
        }
        this.setState({ errors, flagErrors: flagErrors })

    }
    // phone input preventDefault
    handleKeyDown = (event) => {
        // // Lấy mã Unicode của ký tự được nhấn
        // const keyCode = event.keyCode || event.which;

        // // Kiểm tra xem ký tự là số không (mã Unicode từ 48 đến 57 là các ký tự số)
        // if (keyCode < 48 || keyCode > 57) {
        //     // Nếu không phải là số, ngăn chặn sự kiện mặc định của bàn phím
        //     event.preventDefault();
        // }
    }

    // onchange
    handleChangeForm = (e) => {
        const { value, name } = e.target;
        this.formCheckError(name, value)
        if (name === 'email') {
            this.setState({
                dataProfile: {
                    ...this.state.dataProfile,
                    [name]: value
                },
                email: value // Cập nhật giá trị của email trong state
            });
        }
        else if (name === 'password') {
            this.setState({
                dataProfile: {
                    ...this.state.dataProfile,
                    [name]: value
                },
                password: value // Cập nhật giá trị của email trong state
            });
        }
        else {
            this.setState({
                dataProfile: {
                    ...this.state.dataProfile,
                    [name]: value,
                    image: this.state.image,
                }
            });
        }
    }


    render() {
        const { dataProfile, errorMessageImage, email, password, image,
            checkedRadioSendEmail, checkedRadioSendPhone, isShowButtonClickProfile, errors,
            isDisable, isShowFormBank, getCodeConfirmData, } = this.state;

        return (
            <div className="wrapper bg-white mt-sm-5">
                <div className='row'>
                    <div className='col-md-8'>
                        <h4 className="pb-4 border-bottom">Ảnh đại diện</h4>
                    </div>
                    <div className='col-md-4'>
                        <h4 style={{ marginBottom: '10px' }} className="pb-4 border-bottom">Cập nhật</h4>
                        <p>{dataProfile.dateTimeEdit}</p>
                    </div>
                </div>

                <div style={{ marginTop: '10px' }} className="d-flex align-items-start py-3 border-bottom">
                    {/* {this.state.imageProfile !== '' && */}

                    {image && (

                        <img style={{ width: '100px', borderRadius: '100%' }}
                            src={image} alt="Compressed" />
                    )}

                    {/* } */}
                    <div className="pl-sm-4 pl-2" id="img-section">
                        {/* <b>Ảnh đại diện</b> */}

                        <input type="file" className="form-control-file" id="exampleFormControlFile1" ref={'file'}
                            name='image'
                            onChange={(e) => this.handleFileChange(e)}
                            style={{ color: 'red', margin: '1% 0 0 1%' }}
                            disabled={isDisable}
                        />

                        {errorMessageImage && (
                            <div style={{ color: 'red' }}>{errorMessageImage}</div>
                        )}

                    </div>
                </div>
                <div className="py-2">
                    <div className="row py-2">
                        <div className="col-md-6 formRowSetting">
                            <label htmlFor="firstname">Họ tên</label>
                            <input
                                disabled={isDisable}
                                type="text"
                                className="bg-light form-control"
                                name="name"
                                value={dataProfile.name}
                                onChange={this.handleChangeForm}
                                style={isDisable ? { border: 'none' } : { border: '1px solid #cdcdcd' }}

                            /><label>{errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}</label>
                        </div>
                        <div className="col-md-6 pt-md-0 pt-3 formRowSetting">
                            <label htmlFor="lastname">tên tài khoản</label>
                            <input
                                disabled={isDisable}
                                type="text"
                                className="bg-light form-control"
                                name='username'
                                value={dataProfile.username}
                                onChange={this.handleChangeForm}
                                style={
                                    isDisable ? { border: 'none' } : { border: '1px solid #cdcdcd' }
                                }
                            /><label>{errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}</label>
                        </div>
                    </div>
                    <div className="row py-2">
                        <div className="col-md-6 formRowSetting">
                            <label htmlFor="email">Email</label>
                            <input
                                disabled={isDisable}
                                type="text"
                                className="bg-light form-control"
                                name='email'
                                value={email}
                                onChange={this.handleChangeForm}
                                style={
                                    isDisable ? { border: 'none' } : { border: '1px solid #cdcdcd' }
                                }
                            /><label>{errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}</label>
                        </div>
                        <div className="col-md-6 pt-md-0 pt-3 formRowSetting">
                            <label htmlFor="phone">Số điện thoại di động</label>
                            <input
                                disabled={isDisable}
                                type="tel"
                                className="bg-light form-control"
                                name='phone'
                                value={dataProfile.phone}
                                onChange={this.handleChangeForm}
                                style={
                                    isDisable ? { border: 'none' } : { border: '1px solid #cdcdcd' }
                                }
                                placeholder='(+84)'
                            /><label>{errors.phone && <p style={{ color: 'red' }}>{errors.phone}</p>}</label>
                        </div>
                        <div className="col-md-6 pt-md-0 pt-3 formRowSetting">
                            <label htmlFor="phone">Mật khẩu</label>
                            <input
                                disabled={isDisable}
                                type="text"
                                className="bg-light form-control"
                                name='password'
                                value={password}
                                onChange={this.handleChangeForm}
                                style={
                                    isDisable ? { border: 'none' } : { border: '1px solid #cdcdcd' }
                                }

                            /><label>{errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}</label>
                        </div>
                        <div className="col-md-9 pt-md-0 pt-3 formRowSetting">


                            <div className="form-check form-check-inline">
                                <label style={{ cursor: 'pointer' }} className="form-check-label">
                                    <input readOnly checked={checkedRadioSendEmail}
                                        onClick={() => this.isRadioEmail()} className="form-check-input" type="radio" name="rdSend" id="rdEmail" value="email" /> Gửi mã qua Email
                                </label>
                                <label style={{ cursor: 'pointer' }} className="form-check-label">
                                    <input readOnly checked={checkedRadioSendPhone}
                                        onClick={() => this.isRadioPhone()} className="form-check-input" type="radio" name="rdSend" id="rdPhone" value="phone" /> Gửi mã qua Số điện thoại
                                </label>
                            </div>


                        </div>

                        <div className='col-md-9 pt-md-0 pt-3 formRowSetting'>
                            <div id="recaptcha-container"></div>
                        </div>

                        <div className="col-md-9 pt-md-0 pt-3 formRowSetting">
                            <div className="d-sm-flex align-items-center pt-3" id="deactivate">

                                <div className="ml-auto">
                                    {
                                        getCodeConfirmData &&
                                        <div> <FormSMSDigitNumber /><TimerSend /></div>


                                    }
                                    {isShowButtonClickProfile || getCodeConfirmData
                                        ? <div>
                                            <button onClick={() => this.handeClickSave()} type="button" className="btn btn-success">Lưu</button>
                                            <button style={{ marginLeft: '10px' }} onClick={() => this.handeClickRemove()} type="button" className="btn btn-danger">Hủy</button>

                                        </div>
                                        : <button onClick={() => this.handeClickEdit()} type="button" className="btn btn-primary">Sửa</button>
                                    }
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div >

        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        // isDisableInput: state.allReducer.isDisableInput,
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
        },
        IS_UPDATE_SETTING: (action_isUpdateSetting) => {
            dispatch(isUpdateSettingStore(action_isUpdateSetting))
        }

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Setting)
