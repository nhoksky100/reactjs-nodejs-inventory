import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';

const getdataSupplier = () => axios.get('/getSupplier').then((res) => res.data)

class AddSupplier extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataSupplier: [],
            isPrev: false,
            flagPosition: false,
            rowAddIndex: 0,
            columnValues: [ 'supplierName', 'supplierNumberPhone', 'supplierEmail', 'supplierAddress', 'supplierCompany',
                'supplierDateCreated', 'supplierDateUpdate',],
            supplierStatus: 'Đang sử dụng',
          
            supplierTotalPurchasePrice: 0,
            supplierTotalLiabilities: 0,
            // input select
            isItemExist: false,
            id: '',
            supplierCode: '',
        };
        this._isMounted = false
      
    }

    componentDidMount() {
        this._isMounted = true
        this.getData()
    }
    componentWillUnmount() {
        this._isMounted = false
    }

    getData = () => {
        getdataSupplier().then((res) => {

            if (res) {


                let itemsCode = 'MH-' + randomId()
                let id = randomId();
                const isDuplicateitemsCode = (id) => {
                    return res.rows.some(item => item.id === id);
                };

                // Kiểm tra và tạo itemsCode mới nếu trùng lặp
                while (isDuplicateitemsCode(id)) {
                    id = randomId();
                }
                if (this._isMounted) {

                    this.setState({
                        dataSupplier: res.rows.reverse(),
                        rowAddIndex: res.rows.length && res.rows.length !== 0 ? res.rows.length + 1 : 1,
                        itemsCode: itemsCode,
                        id: id
                    })
                }
                // this.setState({ itemsCode: itemsCode })
            }
        })
    }
    undoClearAddRow = () => {
        this.setState({ isPrev: true })
    }
    isChange = (e) => {
        const { value, name } = e.target;
        const { dataSupplier } = this.state;
        // Kiểm tra xem giá trị nhập vào có tồn tại trong danh sách không
        if (name === 'supplierName') {
            const isItemExist = dataSupplier.some(item => item.supplierName === value);
            this.setState({
                [name]: value,
                isItemExist: isItemExist
            })
        } else {
            this.setState({
                [name]: value,
            })
        }

    }

    handleSave = () => {
        const { id, supplierCode, supplierName,supplierNumberPhone, supplierEmail, supplierAddress, supplierCompany,
            supplierStatus, dataSupplier, flagPosition, isItemExist } = this.state;
        
        const dateCreated = UpdateDateTime();
        const dateUpdate = UpdateDateTime();
        if (!isItemExist) {


            axios.post('/addSupplier', {
                id,
                supplierName,
                supplierNumberPhone,
                supplierEmail,
                supplierAddress,
                supplierCompany,
                supplierStatus,
                supplierDateCreated: dateCreated,
                supplierDateUpdate: dateUpdate
            }).then(response => {
                // Xử lý sau khi yêu cầu được thêm thành công
                // console.log("Yêu cầu đã được thêm thành công:", response.data);

                // Cập nhật lại state hoặc thực hiện các hành động khác tại đây nếu cần
                // if (flagPosition) {
                this.getData();
                if (this._isMounted) {

                    this.setState({
                        id: id,
                        // supplierCode: flagPosition ? randomId() : '',
                        supplierName: '',
                        supplierNumberPhone: '',
                        supplierEmail: '',
                        supplierAddress: '',
                        supplierCompany: '',
                        supplierDateCreated: UpdateDateTime(),
                        supplierDateUpdate: UpdateDateTime(),
                        isPrev: !flagPosition ? true : false,
                        supplierDateCreated: dateCreated,
                        supplierDateUpdate: dateUpdate,
                        dataSupplier: [...dataSupplier, response.data] // Thêm dữ liệu mới vào state
                    })
                }




                // Gọi lại hàm để lấy dữ liệu mới từ máy chủ và cập nhật state dataSupplier

            }).catch(error => {
                // Xử lý khi có lỗi xảy ra
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Đã xảy ra lỗi</i></div>)
                console.error("Đã xảy ra lỗi:", error);
            });
        } else {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>tạo mới không thành công</i></div>)
        }
    }

    handleOptionClick = (option) => {
        this.setState({
            inputValue: option,
            showOptions: false // Ẩn danh sách tùy chọn sau khi người dùng chọn một tùy chọn
        });
    }
    arrayInputAddRow = () => {
        const { columnValues, dataSupplier, isItemExist } = this.state;
        let pusInput = [];
        for (let i = 0; i < columnValues.length; i++) {
            if (columnValues[i] === 'supplierName') {
                // Thêm một thẻ select và input/textarea vào mảng pusInput
                if (dataSupplier.length !== 0) {
                    // Nếu dataList không rỗng
                    // let foundItem = dataSupplier.find(item => item.tenhang === this.state[columnValues[i]]);
                    // console.log(foundItem, 'foundItem');
                    pusInput.push(
                        <td key={i} style={{ position: 'relative' }}>
                            <textarea
                                readOnly={false}
                                onChange={(event) => this.isChange(event)}
                                name={columnValues[i]}
                                value={this.state[columnValues[i]]}
                                autoFocus={i === 0 ? true : false}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                            />
                            <span style={{ position: 'relative', color: 'red' }}>{isItemExist && 'Hàng này đã có'}</span>
                        </td>


                    );
                } else {
                    // Nếu dataList rỗng
                    pusInput.push(
                        <td key={i}>
                            <textarea
                                readOnly={false}
                                onChange={(event) => this.isChange(event)}
                                name={columnValues[i]}
                                value={this.state[columnValues[i]]}
                                autoFocus={i === 0 ? true : false}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                            />
                        </td>
                    );
                }
            }

            else {
                // Thêm một textarea cho các trường khác
                pusInput.push(
                    <td key={i}>

                        <textarea
                            readOnly={
                                columnValues[i] === 'id' || 
                                columnValues[i] === 'supplierDateCreated' || columnValues[i] === 'supplierDateUpdate'
                                && true}
                            onChange={(event) => this.isChange(event)}
                            name={columnValues[i]}
                            value={
                                // (columnValues[i] === 'id')
                                //     ? id
                                // :
                                // (columnValues[i] === 'itemsCode')
                                //     ? itemsCode
                                //     :
                                (columnValues[i] === 'supplierDateCreated')
                                    ? UpdateDateTime()
                                    : (columnValues[i] === 'supplierDateUpdate')
                                        ? UpdateDateTime()
                                        : this.state[columnValues[i]]
                            }
                            autoFocus={i === 0 ? true : false}
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
            return <Navigate to='/supplier' />
        }
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <div className="head-content-menu">
                            <img onClick={() => this.undoClearAddRow()} title='Quay lại' src='../icons/color/undo.png' />
                        </div>
                    </div>
                    <div className="head">
                        <h3>Thêm nhà cung cấp</h3>
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    <th ><i className='bx bxs-flag-checkered'></i></th>
                                    {/* <th >STT</th> */}
                                    {/* <th >Mã hàng</th> */}
                                    <th >Tên nhà cung cấp</th>
                                    <th >Số điện thoại</th>
                                    <th >Email</th>
                                    <th >Địa chỉ</th>
                                    <th >Tên công ty | Doanh nghiệp</th>
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

const mapStateToProps = (state, ownProps) => {
    return {
        permission: state.allReducer.permission

    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
       
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AddSupplier)
