import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';
const getdataAccount = () => axios.get('/getAccount').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)

class AddAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataAccount: [],
            dataMember: [],
            isPrev: false,
            flagPosition: false,
            rowAddIndex: 0,
            columnValues: ['accountUserName', 'accountPassword', 'accountEmail', 'accountPermission',
                'accountDateCreated', 'accountDateUpdate'
            ],
            isItemExist: false,
            selectedOption: '', // Lưu giá trị của option được chọn
            selectedItem: null, // Thông tin về mặt hàng được chọn,
            id: '',
            accountCode: '',
        };
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        this.getData()
    }
    componentWillUnmount() {
        // Thiết lập biến _isMounted thành false khi thành phần bị unmounted
        this._isMounted = false;
    }

    getData = () => {
        this._isMounted=true
        getdataAccount().then((res) => {

            if (res) {
                if(this._isMounted){

                    this.setState({
                        dataAccount: res.rows.reverse(),
                        rowAddIndex: res.rows.length && res.rows.length !== 0 && res.rows.length + 1
                    })
                }
            }
        })
        getdataMember().then((res) => {

            if (res) {
                if(this._isMounted){

                    this.setState({
                        dataMember: res.rows.reverse(),
                        // rowAddIndex: res.length && res.length !== 0 && res.length + 1
                    })
                }
            }
        })
    }
    undoClearAddRow = () => {
        this.setState({ isPrev: true })
    }
    isChange = (e) => {
        const { value, name } = e.target;

        this.setState({ [name]: value })
    }
    handleOptionClick = (option) => {
        if(this._isMounted){

            this.setState({
                inputValue: option,
                showOptions: false // Ẩn danh sách tùy chọn sau khi người dùng chọn một tùy chọn
            });
        }
    }
    // Xử lý khi một option được chọn
    handleOptionChange = (e) => {
        const selectedOption = e.target.value;
        const selectedItem = this.state.dataMember.find(item => item.memberName === selectedOption);
        if (selectedItem) {
            if(this._isMounted){

                this.setState({
                    // accountUserName: selectedItem.memberName,
                    accountCode: selectedItem.memberCode,
                    id: selectedItem.id,
                    accountEmail: selectedItem.memberEmail,
                    accountPermission: selectedItem.memberPermission,
    
                    // isItemExist: true
                });
            }
        } else {
            if(this._isMounted){

                this.setState({
                    accountUserName: '',
                    accountCode: '',
                    id: '',
                    accountEmail: '',
                    accountPermission: ''
                    // isItemExist: false
                }); // Đặt tên hàng về trạng thái mặc định nếu không tìm thấy dòng tương ứng
            }
        }
    }
    // Phương thức render các option từ dataMember
    checkCodeAccount = (memberCode) => {
        const { dataAccount } = this.state;
        let flagAccount = false;
        if (dataAccount) {

            dataAccount.map((value) => {

                if (value.accountCode === memberCode) {

                    return flagAccount = true
                }
            })
        }

        return flagAccount
    }
    renderOptions = () => {
        const { dataMember } = this.state;

        if (dataMember) {

            return dataMember.map((item, index) => {
                // Kiểm tra nếu trạng thái không phải là 'Đang khóa' và account chưa tạo
                if (item.memberStatus !== 'Đang khóa' && !this.checkCodeAccount(item.memberCode)) {
                    return (
                        <option key={index} value={item.memberName}>{item.memberName}</option>
                    );
                }
                return null; // Trả về null nếu trạng thái là 'Đang khóa' và account đã tạo full
            });
        }
    }
    handleSave = () => {
        const { id, accountCode, accountUserName, accountPassword, accountEmail, accountPermission,
            dataMember, dataAccount, flagPosition } = this.state;


        if (id && accountCode && accountUserName && accountPassword && accountEmail && accountPermission) {


            const accountDateCreated = UpdateDateTime();
            const accountDateUpdate = UpdateDateTime();
            if (this._isMounted) {
                axios.post('/addAccount', {
                    id, accountCode, accountUserName, accountPassword, accountEmail, accountPermission,
                    accountDateCreated, accountDateUpdate
                }).then(response => {
                    // Xử lý sau khi yêu cầu được thêm thành công
                    // console.log("Yêu cầu đã được thêm thành công:", response.data);

                    // Cập nhật lại state hoặc thực hiện các hành động khác tại đây nếu cần
                    if(flagPosition){

                        this.getData();
                    }
                    this.setState({
                        id: '',
                        accountCode: '',
                        accountUserName: '',
                        accountPassword: '',
                        accountStatus: 'Đang sử dụng',
                        isPrev: !flagPosition ? true : false,
                        accountDateCreated: accountDateCreated,
                        accountDateUpdate: accountDateUpdate,
                        dataAccount: [...dataAccount, response.data] // Thêm dữ liệu mới vào state
                    })

                    // Gọi lại hàm để lấy dữ liệu mới từ máy chủ và cập nhật state dataAccount
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Tạo tài khoản thành công!</i></div>)
                }).catch(error => {
                    // Xử lý khi có lỗi xảy ra
                    console.error("Đã xảy ra lỗi khi thêm yêu cầu:", error);
                });
            } else {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Tạo tài khoản thất bại!</i></div>)
            }
        }
    };
    arrayInputAddRow = () => {
        const { id, columnValues, dataAccount, accountCode, accountEmail, accountPermission } = this.state;


        let pusInput = [];
        for (let i = 0; i < columnValues.length; i++) {

            // Thêm một textarea cho các trường khác

            pusInput.push(
                <td key={i}>

                    <textarea
                        readOnly={
                            columnValues[i] === 'id' || columnValues[i] === 'accountCode' ||
                            columnValues[i] === 'accountEmail' || columnValues[i] === 'accountPermission' ||
                            columnValues[i] === 'accountDateCreated' || columnValues[i] === 'accountDateUpdate'
                            && true}
                        onChange={(event) => this.isChange(event)}
                        name={columnValues[i]}
                        value={
                            // (columnValues[i] === 'id')
                            //     ? id
                            //     :
                            // (columnValues[i] === 'accountCode')
                            //     ? accountCode
                            //     : 
                            (columnValues[i] === 'accountEmail')
                                ? accountEmail
                                : (columnValues[i] === 'accountPermission')
                                    ? accountPermission
                                    : (columnValues[i] === 'accountDateCreated')
                                        ? UpdateDateTime()
                                        : (columnValues[i] === 'accountDateUpdate')
                                            ? UpdateDateTime()
                                            : this.state[columnValues[i]]
                        }
                        autoFocus={i === 0 ? true : false}
                        style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                    />
                </td>
            );

        }
        return pusInput;
    };
    render() {

        if (this.state.isPrev) {
            return <Navigate to='/list-account' />
        }
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <div className="head-content-menu">
                            <img  onClick={() => this.undoClearAddRow()} title='Quay lại' src='../icons/color/undo.png' />
                        </div>
                    </div>
                    <div className="head">
                        <h3>Danh mục</h3>
                        <div className="form-group">
                            <label htmlFor=""></label>
                            <select onChange={this.handleOptionChange} className="form-control form-control-sm" name="" id="">
                                <option>Chọn thành viên</option>
                                {this.renderOptions()} {/* Render các option */}
                            </select>
                        </div>
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    <th ><i className='bx bxs-flag-checkered'></i></th>
                                    {/* <th >STT</th> */}
                                    {/* <th >Mã tài khoản</th> */}
                                    <th >Tên đăng nhập</th>
                                    <th >Mật khẩu</th>
                                    <th >Email</th>
                                    <th >Cấp quyền</th>
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                    <th >Hành động</th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr>
                                    <td><input onClick={() => this.setState({ flagPosition: !this.state.flagPosition })}
                                        style={{ cursor: 'pointer' }} type="checkbox" name="" id="" title='Chọn để giữ lại form nếu tiếp tục thêm hàng tiếp theo' /></td>
                                    {this.arrayInputAddRow()}

                                    <td >

                                        <img onClick={() => this.undoClearAddRow()} title='Quay lại' src='../icons/color/undo.png' />
                                        <img onClick={() => this.handleSave()} title='Đồng ý lưu' src='../icons/color/check.png' />
                                    </td>

                                </tr>


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddAccount;