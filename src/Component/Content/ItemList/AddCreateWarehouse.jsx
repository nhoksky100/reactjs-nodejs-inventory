import React, { Component } from 'react';
import { NavLink, Navigate, } from 'react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId';

const getdataCreateWarehouse = () => axios.get('/getCreateWarehouse').then((res) => res.data);

class AddCreateWarehouse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataCreateWarehouse: [],
            isPrev: false,
            flagPosition: false,
            warehouseCode: '',
            id: '',
            warehouseName: '',
            warehouseStatus: 'Đang sử dụng',
            isItemExist: false,
        };
    }

    componentDidMount() {
        this.getData();
    }

    componentWillUnmount() { }

    getData() {
        getdataCreateWarehouse().then((res) => {
            if (res) {
                let newWarehouseCode = 'MK-' + randomId();
                let newId = randomId();
                const isDuplicateId = (id) => res.rows.some(item => item.id === id);

                while (isDuplicateId(newId)) {
                    newId = randomId();
                }

                this.setState({
                    dataCreateWarehouse: res.rows.reverse(),
                    warehouseCode: newWarehouseCode,
                    id: newId
                });
            }
        });
    }

    undoClearAddRow = () => {
        this.setState({ isPrev: true });
    };

    handleSave = () => {
        const { id, warehouseCode, warehouseName, warehouseStatus, dataCreateWarehouse, flagPosition, isItemExist } = this.state;

        if (!isItemExist) {
            axios.post('/addCreateWarehouse', {
                id,
                warehouseCode,
                warehouseName,
                warehouseStatus,
                warehouseDateCreated: UpdateDateTime(),
            }).then(response => {
                this.setState({
                    dataCreateWarehouse: [...dataCreateWarehouse, response.data],
                    warehouseName: flagPosition ? warehouseName : '',
                    isPrev: !flagPosition
                });
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" /><i>Tạo mới thành công!</i></div>);
                this.getData();
            }).catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" /><i>Đã xảy ra lỗi</i></div>);
                console.error("Đã xảy ra lỗi:", error);
            });
        } else {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" /><i>tạo mới thất bại!</i></div>);
        }
    };

    isChange = (e) => {
        const { value, name } = e.target;
        if (name === 'warehouseName') {
            const exists = this.state.dataCreateWarehouse.some(item => item.warehouseName === value);
            this.setState({
                [name]: value,
                isItemExist: exists
            });
        } else {
            this.setState({
                [name]: value
            });
        }
    };

    arrayInputAddRow = () => {
        const columns = ['warehouseCode', 'warehouseName', 'warehouseDateCreated'];
        return columns.map((column, i) => {
            if (column === 'warehouseName') {
                return (
                    <td key={i} style={{ position: 'relative' }}>
                        <textarea
                            readOnly={false}
                            onChange={this.isChange}
                            name={column}
                            value={this.state.warehouseName}
                            autoFocus={i === 1}
                            style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                        />
                        <span style={{ position: 'relative', color: 'red' }}>{this.state.isItemExist && 'Kho này đã có'}</span>
                    </td>
                );
            }
            return (
                <td key={i}>
                    <textarea
                        readOnly={column === 'warehouseCode' || column === 'warehouseDateCreated'}
                        onChange={this.isChange}
                        name={column}
                        value={column === 'warehouseCode' ? this.state.warehouseCode : UpdateDateTime()}
                        autoFocus={i === 2}
                        style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                    />
                </td>
            );
        });
    };

    render() {
        if (this.state.isPrev) {
            return <Navigate to='/warehouse-list' />;
        }
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <div className="head-content-menu">
                            <img onClick={this.undoClearAddRow} title='Quay lại' src='../icons/color/undo.png' alt="Quay lại" />
                        </div>
                    </div>
                    <div className="head">
                        <h3>Danh mục</h3>
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row'>
                        <table>
                            <thead>
                                <tr>
                                    <th><i className='bx bxs-flag-checkered'></i></th>
                                    <th>Mã kho</th>
                                    <th>Tên kho</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input
                                            onClick={() => this.setState({ flagPosition: !this.state.flagPosition })}
                                            style={{ cursor: 'pointer' }}
                                            type="checkbox"
                                            title='Chọn để giữ lại form nếu tiếp tục thêm hàng tiếp theo'
                                        />
                                    </td>
                                    {this.arrayInputAddRow()}
                                    <td>
                                        <img onClick={this.undoClearAddRow} title='Quay lại' src='../icons/color/undo.png' alt="Quay lại" />
                                        <img onClick={this.handleSave} title='Đồng ý lưu' src='../icons/color/check.png' alt="Đồng ý lưu" />
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

export default AddCreateWarehouse;
