import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { randomId } from '../../RandomId/randomId'
import bcrypt from 'bcryptjs';
import { Navigate } from 'react-router-dom';

const getDataMember = () => axios.get('/getMember').then((res) => res.data)


class AddMember extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataMember: [],
            isPrev: false,
            flagPosition: false,
            rowAddIndex: 0,
            columnValues: ['memberCode', 'memberPermission', 'memberName', 'memberDepartment', 'memberGender', 'memberAddress', 'memberNumberPhone', 'memberEmail',
                'memberDateCreated', 'memberDateUpdate'
            ],
            id: '',
            memberPermission: 'Thành viên',
            memberDepartment: 'Nhân sự',
            memberMaker: 'admin',
        };
        this._isMounted = false;

    }

    componentDidMount() {
        this._isMounted = true;
        this.getData()
        // this.getCodeRandom();
        this.isBcrypt()
    }
    // Trong componentWillUnmount, đặt biến flag thành false khi component unmounted
    componentWillUnmount() {
        this._isMounted = false;
    }


   async  isBcrypt(dataMember) {
        const { tokenObj } = this.props;

        let permission = '';
        
        if (dataMember) {
            for (let value of dataMember) {
                if (tokenObj.id === value.id) {
                    const isPermission = await bcrypt.compare(value.memberPermission, tokenObj.accountPermission);
                        
                    if (isPermission) {
                        permission = value.memberPermission;
                        break; // Không cần duyệt các phần tử khác nữa nếu đã tìm thấy quyền
                    }
                }
            }
        }
        // console.log(permission, 'permission');
        this.setState({ memberMaker: permission });
    }
    getData = () => {
        this._isMounted =true
        getDataMember().then((res) => {

            if (res) {
                this.isBcrypt(res.rows)
                let memberCode = 'MTV-' + randomId()
                let id = randomId();
                const isDuplicateitemCode = (id) => {
                    return res.rows.some(item => item.id === id);
                };

                // Kiểm tra và tạo itemCode mới nếu trùng lặp
                while (isDuplicateitemCode(id)) {
                    id = randomId();
                }
                if(this._isMounted){

                    this.setState({
                        dataMember: res.rows.reverse(),
                        rowAddIndex: res.rows.length && res.rows.length !== 0 ? res.rows.length + 1 : 1,
                        memberCode: memberCode,
                        id: id
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
        if (name === 'memberPermission') {
            // Nếu thay đổi memberPermission, cập nhật memberDepartment tương ứng
            let departmentValue = '';
            if (value === 'Lãnh đạo') {
                departmentValue = 'CEO';
            } else if (value === 'Admin') {
                departmentValue = 'Admin';
            } else if (value === 'Thành viên kho' || value === 'Thành viên thu mua') {
                departmentValue = 'Kế toán';
            } else {
                departmentValue = ''; // Đặt giá trị mặc định hoặc rỗng tùy thuộc vào logic của bạn
            }
            // Cập nhật cả memberPermission và memberDepartment
            this.setState({ [name]: value, memberDepartment: departmentValue });
        } else {
            this.setState({ [name]: value });
        }
    };

 
    handleSave = () => {
        const { id, memberMaker, memberCode, memberPermission, memberName, memberDepartment, memberGender, memberAddress, memberNumberPhone, memberEmail,
            dataMember, flagPosition } = this.state;
        const memberStatus = 'Đang sử dụng';
        const memberDateCreated = UpdateDateTime();
        const memberDateUpdate = UpdateDateTime();
        if (this._isMounted) {
       
          
            axios.post('/addMember', {
                id, memberCode, memberMaker, memberPermission, memberName, memberDepartment, memberGender, memberAddress, memberNumberPhone, memberEmail,
                memberStatus, memberDateCreated, memberDateUpdate
            }).then(response => {
                // Xử lý sau khi yêu cầu được thêm thành công
                // console.log("Yêu cầu đã được thêm thành công:", response.data);

                // Cập nhật lại state hoặc thực hiện các hành động khác tại đây nếu cần
                if (flagPosition) {

                    this.getData();
                }

                const newState = {
                    id: id,
                    memberCode: flagPosition ? randomId() : '',
                    // memberMaker: '',
                    memberPermission: '',
                    memberName: '',
                    memberDepartment: '',
                    memberGender: '',
                    memberAddress: '',
                    memberNumberPhone: '',
                    memberEmail: '',
                    memberDateCreated,
                    memberDateUpdate,
                    isPrev: !flagPosition ? true : false,
                    dataMember: [...dataMember, response.data] // Thêm dữ liệu mới vào state
                };
                if(this._isMounted){

                    // Cập nhật trạng thái
                    this.setState(newState);
                }



                // Gọi lại hàm để lấy dữ liệu mới từ máy chủ và cập nhật state dataMember

            }).catch(error => {
                // Xử lý khi có lỗi xảy ra
                console.error("Đã xảy ra lỗi khi thêm yêu cầu:", error);
            });
        }
    };
    arrayInputAddRow = () => {
        const { columnValues, dataMember, rowAddIndex, memberCode, } = this.state;

        // console.log(this.state.id,'id');
        let pusInput = [];
        for (let i = 0; i < columnValues.length; i++) {
            if (columnValues[i] === 'memberPermission') {
                // Thêm một thẻ select vào mảng pusInput
                pusInput.push(
                    <td key={i}>
                        <select
                            onChange={(event) => this.isChange(event)}
                            name={columnValues[i]}

                            value={this.state[columnValues[i]]}
                            // autoFocus={columnValues[i] === 'memberCode' ? true : false}

                            className='select-addrow'
                        >
                            <option value="Thành viên">Thành viên</option>
                            <option value="Thành viên kho">Thành viên kho</option>
                            <option value="Thành viên thu mua">Thành viên thu mua</option>
                            <option value="Admin">Admin</option>
                            <option value="Trưởng phòng">Trưởng phòng</option>
                            {/* <option value="Trưởng phòng kế toán">Trưởng phòng kế toán</option> */}
                            <option value="Lãnh đạo">Lãnh đạo</option>
                        </select>
                    </td>
                );
            }
            else if (columnValues[i] === 'memberDepartment') {
                let departmentOptions = [];

                if (this.state.memberPermission === 'Lãnh đạo') {
                    // Nếu memberPermission là 'Lãnh đạo', chọn giá trị là 'CEO'
                    departmentOptions = [{ title: 'Giám đốc điều hành', value: 'CEO', valueAcr: 'CEO' }];
                } else if (this.state.memberPermission === 'Admin') {
                    // Nếu memberPermission là 'Admin', chọn giá trị là 'Admin'
                    departmentOptions = [{ title: 'Quản lý thành viên', value: 'Admin', valueAcr: 'Admin' }];
                } else if (
                    this.state.memberPermission === 'Thành viên kho' ||
                    this.state.memberPermission === 'Thành viên thu mua'
                    // this.state.memberPermission === 'Trưởng phòng kế toán'
                ) {
                    // Nếu memberPermission là 'Thành viên kho', 'Thành viên thu mua' hoặc 'Trưởng phòng kế toán', chọn giá trị là 'ACC'
                    departmentOptions = [{ title: 'Bộ phận kế toán', value: 'Kế toán', valueAcr: 'ACC' }];
                } else {
                    // Trường hợp còn lại, ẩn các giá trị không mong muốn
                    departmentOptions = [
                        { title: 'Bộ phận nhân sự', value: 'Nhân sự', valueAcr: 'HR' },
                        { title: 'Bộ phận bếp', value: 'Bếp', valueAcr: 'KIT' },
                        { title: 'Bộ phận buồng phòng', value: 'Buồng phòng', valueAcr: 'HK' },
                        { title: 'Bộ phận Nhà hàng', value: 'Nhà hàng', valueAcr: 'F&B' },
                        { title: 'Bộ phận kế toán', value: 'Kế toán', valueAcr: 'ACC' },
                        { title: 'Bộ phận kinh doanh', value: 'Kinh doanh', valueAcr: 'CO' },
                        { title: 'Bộ phận Spa', value: 'Spa', valueAcr: 'SPA' },
                        { title: 'Bộ phận kỹ thuật', value: 'Kỹ thuật', valueAcr: 'ENG' },
                        { title: 'Bộ phận tiền sảnh', value: 'Lễ tân', valueAcr: 'FO' },
                        { title: 'Bộ phận giải trí', value: 'Giải trí', valueAcr: 'REC' },
                        { title: 'Bộ phận Công nghệ thông tin', value: 'Công nghệ thông tin', valueAcr: 'IT' },
                        { title: 'Bộ phận an ninh', value: 'An ninh', valueAcr: 'SEC' }
                    ];
                }

                // Thêm một thẻ select vào mảng pusInput
                pusInput.push(
                    <td key={i}>
                        <select
                            onChange={(event) => this.isChange(event)}
                            name={columnValues[i]}
                            value={this.state[columnValues[i]]}
                            className='select-addrow'
                        >
                            {/* Render các option từ mảng departmentOptions */}
                            {departmentOptions.map((option, index) => (
                                <option key={index} title={option.title} value={option.value}>{option.valueAcr}</option>
                            ))}
                        </select>
                    </td>
                );
            }

            else {
                // Thêm một textarea cho các trường khác
                pusInput.push(
                    <td key={i}>

                        <textarea
                            readOnly={
                                columnValues[i] === 'id' || columnValues[i] === 'memberCode' ||
                                columnValues[i] === 'memberStatus' || columnValues[i] === 'memberDateCreated' || columnValues[i] === 'memberDateUpdate'
                                && true}
                            onChange={(event) => this.isChange(event)}
                            name={columnValues[i]}
                            value={
                                // (columnValues[i] === 'id')
                                //     ? rowAddIndex
                                // : 
                                (columnValues[i] === 'memberCode')
                                    ? memberCode
                                    // : (columnValues[i] === 'memberStatus')
                                    //     ? 'Đang sử dụng'
                                    : (columnValues[i] === 'memberDateCreated')
                                        ? UpdateDateTime()
                                        : (columnValues[i] === 'memberDateUpdate')
                                            ? UpdateDateTime()
                                            : this.state[columnValues[i]]
                            }
                            autoFocus={i === 1 ? true : false}
                            style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                        />
                    </td>
                );
            }
        }
        return pusInput;
    };
    render() {

        if (this.state.isPrev) {
            return <Navigate to='/member' />
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
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    <th ><i className='bx bxs-flag-checkered'></i></th>
                                    {/* <th >STT</th> */}
                                    <th >Mã thành viên</th>
                                    {/* <th >Người tạo</th> */}
                                    <th >Cấp quyền</th>
                                    <th >Tên thành viên</th>
                                    <th >Phòng ban</th>
                                    <th >Giới tính</th>
                                    <th >Địa chỉ</th>
                                    <th >Số điện thoại</th>
                                    <th >Email</th>
                                    {/* <th >Trạng thái</th> */}
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

export default AddMember;