import React, { Component } from 'react';
// import { NavLink,  } from 'react-router-dom/cjs/react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'
import Select from 'react-select'
import bcrypt from 'bcryptjs';
import { Navigate } from 'react-router-dom';

const getdataItemsList = () => axios.get('/getItemsList').then((res) => res.data)
const getdataCreateWarehouse = () => axios.get('/getCreateWarehouse').then((res) => res.data)
const getdataAccount = () => axios.get('/getAccount').then((res) => res.data)

class AddItemList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataItemsList: [],
            isPrev: false,
            flagPosition: false,

            columnValues: ['itemsCode', 'itemsName', 'itemsWarehouseAreaName', 'itemsCommodities', 'itemsResidualMin', 'itemsResidualMax', 'itemsUnit', 'itemsUnitPrice',
                'itemsDateCreated', 'itemsDateUpdate'
            ],
            // input select
            isItemExist: false,
            id: '',
           
            itemsWarehouseCode: '',
            listNameItemOpt: [],
            permission: '',
            userName: '',
        };
        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true
        this.getData()
        this.isBcryptPermission()
    }
    componentWillUnmount() {
        this._isMounted = false
    }
    isBcryptPermission() {
        const { tokenObj } = this.props;

        let permission = '';
        let userName = '';
        getdataAccount().then((res) => {
            if(res){
                
                res.rows.map((value) => {
    
                    if (tokenObj.id === value.id) {
                        const isPermission = bcrypt.compareSync(value.accountPermission, tokenObj.accountPermission);
                        if (isPermission) {
    
                            permission = value.accountPermission;
                            userName = tokenObj.accountUserName;
                            return // Không cần duyệt các phần tử khác nữa nếu đã tìm thấy quyền
                        }
                    }
                })
    
                if (this._isMounted) {
    
                    this.setState({
                        permission: permission,
                        userName: userName,
                    });
                }
            }
        })



    }
    getData = () => {
        this._isMounted = true
        getdataItemsList().then((res) => {

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
                        dataItemsList: res.rows.reverse(),

                        itemsCode: itemsCode,
                        id: id
                    })
                }
                // this.setState({ itemsCode: itemsCode })
            }
        })
 
        getdataCreateWarehouse().then((res) => {
            if (res) {
                const listNameItemOpt = res.rows
                    .filter(item => item.warehouseStatus === 'Đang sử dụng') // Lọc ra các phần tử có status là 'Đang sử dụng'
                    .map(item => ({
                        value: item.warehouseName,
                        label: item.warehouseName
                    }));
                if (this._isMounted) {
                    this.setState({
                        dataCreateWarehouse: res.rows,
                        listNameItemOpt: listNameItemOpt
                    })
                }
            }
        })
    }
    handleChangeWarehouseName = (selectedOption) => {

        // Cập nhật lại state cho dataItemsList
        this.setState({
            itemsWarehouseAreaName: selectedOption.value
        });
    }






    undoClearAddRow = () => {
        this.setState({ isPrev: true })
    }
    isChange = (e) => {
        const { value, name } = e.target;
        const { dataItemsList } = this.state;
        // Kiểm tra xem giá trị nhập vào có tồn tại trong danh sách không
        if (name === 'itemsName') {
            const isItemExist = dataItemsList.some(item => item.itemsName === value);
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
        const { id, itemsCode, itemsName, itemsMaker, permission, itemsCommodities = 'Hàng tiêu dùng', itemsResidualMin, itemsResidualMax, itemsUnit,
            itemsUnitPrice, dataItemsList, flagPosition, isItemExist, itemsWarehouseAreaName, dataCreateWarehouse } = this.state;
        const foundWarehouse = dataCreateWarehouse && dataCreateWarehouse.find(item => item.warehouseName === itemsWarehouseAreaName) || '';
        let warehouseCode = '';
        if (foundWarehouse) {
            warehouseCode = foundWarehouse.warehouseCode
        }
        const itemsDateCreated = UpdateDateTime();
        const itemsDateUpdate = UpdateDateTime();
        if (!isItemExist) {

            if (this._isMounted) {
                axios.post('/addItems', {
                    id,
                    itemsCode,
                    itemsName,
                    itemsMaker: permission,
                    itemsWarehouseAreaName,
                    itemsCommodities,
                    itemsResidualMin,
                    itemsResidualMax,
                    itemsUnit,
                    itemsUnitPrice,
                    itemsDateCreated,
                    itemsDateUpdate
                }).then(response => {
                    // Xử lý sau khi yêu cầu được thêm thành công
                    // console.log("Yêu cầu đã được thêm thành công:", response.data);
                    axios.post('/addWarehouse', {
                        id,
                        idWarehouse: warehouseCode,
                        itemsCode,
                        itemsName,
                        itemsWarehouseAreaName,
                        itemsCommodities,
                        itemsResidualMin,
                        itemsResidualMax,
                        itemsUnit,
                        itemsUnitPrice,
                        itemsDateCreated,
                       

                    })
                    // Cập nhật lại state hoặc thực hiện các hành động khác tại đây nếu cần
                    // if (flagPosition) {
                    this.getData();
                    if (this._isMounted) {

                        this.setState({
                            id: id,
                            itemsCode: flagPosition ? randomId() : '',
                            itemCreation: '',
                            itemsCommodities: '',
                            itemsName: '',

                            itemsUnit: '',
                            itemsUnitPrice: 0,
                            isPrev: !flagPosition ? true : false,
                            itemsDateCreated: itemsDateCreated,
                            itemsDateUpdate: itemsDateUpdate,
                            dataItemsList: [...dataItemsList, response.data] // Thêm dữ liệu mới vào state
                        })
                    }




                    // Gọi lại hàm để lấy dữ liệu mới từ máy chủ và cập nhật state dataItemsList

                }).catch(error => {
                    // Xử lý khi có lỗi xảy ra
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Đã xảy ra lỗi</i></div>)
                    console.error("Đã xảy ra lỗi:", error);
                });
            } else {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>tạo mới thất bại</i></div>)
            }
        }
    }

    handleOptionClick = (option) => {
        this.setState({
            inputValue: option,
            showOptions: false // Ẩn danh sách tùy chọn sau khi người dùng chọn một tùy chọn
        });
    }
    arrayInputAddRow = () => {
        const { id, itemsCode, columnValues, dataItemsList, rowAddIndex, isItemExist, listNameItemOpt } = this.state;
        let pusInput = [];
        for (let i = 0; i < columnValues.length; i++) {
            if (columnValues[i] === 'itemsName') {
                // Thêm một thẻ select và input/textarea vào mảng pusInput
                if (dataItemsList.length !== 0) {
                    // Nếu dataList không rỗng
                    // let foundItem = dataItemsList.find(item => item.tenhang === this.state[columnValues[i]]);
                    // console.log(foundItem, 'foundItem');
                    pusInput.push(
                        <td key={i} style={{ position: 'relative' }}>
                            <textarea
                                readOnly={false}
                                onChange={(event) => this.isChange(event)}
                                name={columnValues[i]}
                                value={this.state[columnValues[i]]}
                                autoFocus={i === 1 ? true : false}
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
                                autoFocus={i === 1 ? true : false}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                            />
                        </td>
                    );
                }
            }
            else if (columnValues[i] === 'itemsWarehouseAreaName') {
                // Thêm một thẻ select vào mảng pusInput
                pusInput.push(
                    <td key={i}>
                        <div className='select-intowarehouse'>

                            {Array.isArray(listNameItemOpt) && listNameItemOpt.length > 0 && (
                                <Select onChange={(selectedOption) => this.handleChangeWarehouseName(selectedOption)} name='selectWarehouseName' placeholder="Chọn kho" options={listNameItemOpt} />
                            )}
                        </div>
                    </td>
                );
            }
            else if (columnValues[i] === 'itemsCommodities') {
                // Thêm một thẻ select vào mảng pusInput
                pusInput.push(
                    <td key={i}>
                        <select
                            onChange={(event) => this.isChange(event)}
                            name={columnValues[i]}
                            value={this.state[columnValues[i]]}
                            // autoFocus={columnValues[i] === 'itemsCode' ? true : false}

                            className='select-addrow'
                        >
                            <option value="Hàng tiêu dùng">Hàng tiêu dùng</option>
                            <option value="Vật tư">Vật tư</option>
                            <option value="Vật tư">Vật tư 2</option>

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
                                columnValues[i] === 'id' || columnValues[i] === 'itemsCode' ||
                                columnValues[i] === 'itemsDateCreated' || columnValues[i] === 'itemsDateUpdate'
                                && true}
                            onChange={(event) => this.isChange(event)}
                            name={columnValues[i]}
                            value={
                                // (columnValues[i] === 'id')
                                //     ? id
                                // :
                                (columnValues[i] === 'itemsCode')
                                    ? itemsCode
                                    : (columnValues[i] === 'itemsDateCreated')
                                        ? UpdateDateTime()
                                        : (columnValues[i] === 'itemsDateUpdate')
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
            return <Navigate to='/category/items-list' />
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
                                    <th >Mã hàng</th>
                                    <th >Tên hàng</th>
                                    <th >Khu vực kho</th>
                                    <th >Loại hàng</th>
                                    <th >Số lượng tồn ít nhất</th>
                                    <th >Số lượng tồn cao nhất</th>
                                    <th >Đơn vị tính</th>
                                    <th >Đơn giá dự kiến</th>
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

export default AddItemList;