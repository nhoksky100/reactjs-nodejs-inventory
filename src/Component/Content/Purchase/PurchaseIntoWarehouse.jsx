import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';

import { randomId } from '../../RandomId/randomId'
import { FormatNumber } from '../../FormatNumber'
import Select from 'react-select';
import Creatable from 'react-select/async-creatable';
const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)
const getdataItemsList = () => axios.get('/getItemsList').then((res) => res.data)
const getdataListAccount = () => axios.get('/getAccount').then((res) => res.data)
const getDataRequestTeamp = () => axios.get('/getRequestTeamp').then((res) => res.data)
const getDataMember = () => axios.get('/getMember').then((res) => res.data)
const getDataOrderApprove = () => axios.get('/getApproveOrder').then((res) => res.data)
const getdataDocument = () => axios.get('/getDocument').then((res) => res.data)
const getdataWarehouse = () => axios.get('/getWarehouse').then((res) => res.data)

class PurchaseIntoWarehouse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataItemList: [],
            dataListAccount: [],
            dataOrderApprove: [],
            dataRequestTeamp: [],
            dataMember: [],
            dataWarehouse: [],
            userName: '',
            idAccount: '',
            memberName: '',
            orderCode: '',
            department: '',
            memberDepartment: '',
            isPrev: false,
            flagPosition: false,
            rowAddIndex: 0,
            rowAddIndexTeamp: 0,
            idRequestTeamp: [],
            columnValues: ['id', 'intoWarehouseCodeDocument', 'orderCode', 'orderName', 'unit', 'amount', 'unitPrice', 'intoMoney', 'dateCreated', 'dateUpdateApprove'],
            intoWarehouseCodeDocument: '',
            // input select,
            isItemExist: [],
            isAddRow: false,
            selectedOption: '', // Lưu giá trị của option được chọn
            selectedItem: null, // Thông tin về mặt hàng được chọn,
            selectedRows: [],
            countNewRow: 0,
            dataApproved: [], // Mảng mới để lưu các đối tượng dòng mới
            dataApprovedTeamp: [], // Mảng mới để lưu các đối tượng dòng mới
            isisSave: false,
            // document 
            dataDocument: [],
            documentCode: [],
            // optselect
            listNameItemsOpt: []
            // dataSet:[],
        };
        this._isMounted = false;
        this.handleChangeDocumentCode = this.handleChangeDocumentCode.bind(this);
    }



    componentDidMount() {
        this._isMounted = true;
        Promise.all([this.getData(), this.isBcryptPermission()]).then(() => {
            // this.updatedataApprovedFromDataSet();
            // this.listItemMember();
            this.setId()
        });

    }
    setId = () => {
        const { dataRequest } = this.state;
        if (dataRequest) {
            let id = randomId();
            const isDuplicateitemCode = (id) => {
                return dataRequest.some(item => item.id === id);
            };

            // Kiểm tra và tạo itemCode mới nếu trùng lặp
            while (isDuplicateitemCode(id)) {
                id = randomId();
            }
            if (this._isMounted) {

                this.setState({
                    // dataRequest: dataRequest.reverse(),
                    id: id
                });
            }

        }
    }
    async isBcryptPermission(dataListAccount) {
        const { tokenObj } = this.props;

        let permission = '';
        let userName = '';
        let idAccount = ''
        if (dataListAccount) {
            for (let value of dataListAccount) {
                if (tokenObj.id === value.id) {
                    const isPermission = await bcrypt.compare(value.accountPermission, tokenObj.accountPermission);
                    if (isPermission) {
                        idAccount = value.id
                        permission = value.accountPermission;
                        userName = tokenObj.accountUserName;
                        break; // Không cần duyệt các phần tử khác nữa nếu đã tìm thấy quyền
                    }
                }
            }
        }
        if (this._isMounted) {

            this.setState({
                idAccount: idAccount,
                permission: permission,
                userName: userName,
            });
        }
    }

    getData = async () => {
        try {



            const [dataRequest, dataItemList, dataListAccount, dataRequestTeamp, dataMember, dataOrderApprove,
                dataDocument, dataWarehouse] = await Promise.all([
                    getdataRequest(),
                    getdataItemsList(),
                    getdataListAccount(),
                    getDataRequestTeamp(),
                    getDataMember(),
                    getDataOrderApprove(),
                    getdataDocument(),
                    getdataWarehouse(),
                ]);

            if (dataRequest) {

                if (this._isMounted) {

                    this.setState({
                        dataRequest: dataRequest.rows.reverse(),

                    });
                }

            }

            if (dataRequest && dataOrderApprove) {

                const dataApproved = dataRequest.rows.filter(requestItem => {
                    if (requestItem.statusOrder === 'Đã duyệt' && parseInt(requestItem.orderComplete) === 2) {
                        return true; // Trả về true nếu orderStatus là 'Đã duyệt' và orderComplete là 2
                    }
                    return false; // Nếu orderStatus không phải 'Đã duyệt' hoặc orderComplete không phải 2, loại bỏ phần tử
                }).map(requestItem => {
                    const matchingApproveItems = dataOrderApprove.rows.filter(approveItem => {
                        return approveItem.idRequest === requestItem.id && approveItem.datePrint;
                    });

                    if (matchingApproveItems.length > 0) {
                        const updatedRequestItem = { ...requestItem }; // Tạo một bản sao của requestItem
                        const matchingApproveItem = matchingApproveItems[0]; // Lấy phần tử đầu tiên trong matchingApproveItems

                        // Gán giá trị của dateUpdateApprove từ matchingApproveItem vào cột mới dateUpdateApproveApprove của updatedRequestItem
                        updatedRequestItem.dateUpdateApprove = matchingApproveItem.dateUpdate;

                        return updatedRequestItem; // Trả về requestItem đã được cập nhật
                    }
                    return null; // Trả về null nếu không có phần tử phù hợp trong dataOrderApprove
                }).filter(updatedRequestItem => updatedRequestItem !== null); // Loại bỏ các phần tử null

                if (this._isMounted) {
                    // Lọc và thêm cột mới vào dataApproved
                    const updatedDataApproved = dataApproved.map(approvedItem => {
                        // Tìm phần tử trong dataItemList có itemsCode bằng với orderCode của approvedItem
                        const matchedItem = dataItemList.rows.find(item => item.itemsCode === approvedItem.orderCode);
                        if (matchedItem) {
                            // Nếu tìm thấy, thêm cột mới vào approvedItem với giá trị là itemsCommodities của matchedItem
                            return {
                                ...approvedItem,
                                intoWarehouseItemsCommodities: matchedItem.itemsCommodities
                            };
                        } else {
                            // Nếu không tìm thấy, trả về approvedItem ban đầu
                            return approvedItem;
                        }
                    });

                    // Cập nhật state với dataItemList đã đảo ngược và dataApproved đã được cập nhật
                    this.setState({
                        dataItemList: dataItemList.rows.reverse(),
                        dataApproved: updatedDataApproved
                    });
                }

            }


            if (dataListAccount) {
                // Gọi hàm isBcryptPermission để xử lý quyền
                await this.isBcryptPermission(dataListAccount.rows);
            }

            if (dataRequestTeamp) {
                if (this._isMounted) {

                    this.setState({ dataRequestTeamp: dataRequestTeamp.rows });
                }
            }
            if (dataMember) {
                if (this._isMounted) {

                    this.setState({ dataMember: dataMember.rows });
                }
            }
            if (dataOrderApprove) {
                if (this._isMounted) {

                    this.setState({ dataOrderApprove: dataOrderApprove.rows });
                }
            }
            if (dataWarehouse) {
                if (this._isMounted) {

                    this.setState({ dataWarehouse: dataWarehouse.rows });
                }
            }
            if (dataDocument) {
                if (this._isMounted) {

                    const documentCode = dataDocument.rows.map(itemDocument => ({ value: itemDocument.documentCode, label: itemDocument.documentCode }));

                    this.setState({
                        // dataDocument: dataDocument.reverse(),
                        documentCode: documentCode,

                        // documentCodeTeamp: documentCode,
                    })
                }
            }

            // Sau khi tất cả dữ liệu đã được cập nhật, gọi updatedataApprovedFromDataSet
            // this.updatedataApprovedFromDataSet();
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error occurred while fetching data:", error);
        }
    };

    componentWillUnmount() {
        // Đặt biến _isMounted thành false khi component bị hủy
        this._isMounted = false;

        // Hủy bất kỳ tác vụ bất đồng bộ nào ở đây
    }

    undoClearAddRow = () => {
        this.setState({ isPrev: true })
    }

    // listItemMember = () => {
    //     const { dataMember, idAccount } = this.state;
    //     const dataMemberFill = dataMember && dataMember.filter((item) => item.id === idAccount) || [];
    //     this.setState({
    //         memberDepartment: dataMemberFill[0].memberDepartment,
    //         memberName: dataMemberFill[0].memberName
    //     })
    // }


    handleSave = () => {
        const { permission, dataApproved, dataWarehouse, isItemExist, memberName, memberDepartment, idRequestTeamp } = this.state;
        const promises = [];

        // Tạo các promise cho việc gửi dữ liệu lên máy chủ từ mỗi dòng
        if (dataApproved.length === 0) return
        if (this._isMounted) {
            // Lọc ra các phần tử thỏa mãn điều kiện idRequestTeamp và documentCode không bằng 'undefined'
            const filteredData = dataApproved && dataApproved.filter(row => idRequestTeamp.includes(row.id) && row.documentCode);



            if (filteredData.length === 0) {

                toast(<div className="advertise"><i className="fa fa-check-circle" aria-hidden="true" />
                    <i>Chưa có hàng nào được chọn!</i></div>);
                return
            }

            // Tính tổng số lượng và cập nhật vào warehouseResidual
            const updateWarehouseResidual = (orderCode, amount) => {
                // Tính tổng số lượng và cập nhật vào warehouseResidual
                let totalAmount = 0;
                dataWarehouse.forEach(item => {
                    if (item.warehouseItemsCode === orderCode) {
                        return totalAmount = parseInt(item.warehouseResidual) + parseInt(amount);

                    }
                });
                // Cộng thêm giá trị amount


                return totalAmount;
            };

            filteredData.forEach(newRowData => {

                const { id, orderCode, orderName, orderNotes, unit, amount, unitPrice, intoMoney,
                    documentCode, orderSupplierName, intoWarehouseItemsCommodities, warehouseAreaName } = newRowData;


                const newWarehouseResidual = updateWarehouseResidual(orderCode, amount);
                console.log(newWarehouseResidual, 'newWarehouseResidual');
                if ((orderName && unit && amount && unitPrice && intoMoney && documentCode)) {
                    let priceFormat = unitPrice;
                    let amountFormat = amount;
                    if (typeof unitPrice === 'string' && unitPrice.indexOf(',') !== -1) {

                        priceFormat = unitPrice.replace(",", "").replace(".", "")
                    }
                    else if (typeof amount === 'string' && amount.indexOf(',') !== -1) {

                        amountFormat = amount.replace(",", "").replace(".", "")
                    }
                    // Tạo promise cho mỗi dòng

                    const promise = axios.post('/addIntoWarehouse', {
                        id, orderCode, orderName, orderNotes, unit, amount, unitPrice, intoMoney,
                        documentCode, orderSupplierName, intoWarehouseItemsCommodities,
                        intoWarehouseDateUpdate: UpdateDateTime(),
                        idIntoWarehouse: this.state.id
                    })
                        .then(response => {
                            // cập nhật vào kho tổng 
                            axios.post('/updateWarehouseInto', {
                                warehouseType: documentCode, warehouseItemsCode: orderCode, warehouseItemsName: orderName,
                                warehouseAreaName, warehouseItemsCommodities: intoWarehouseItemsCommodities, warehouseUnitPrice: unitPrice,
                                warehouseResidual: newWarehouseResidual, warehouseUnit: unit, intoWarehouseCode: id, intoWarehouseDate: UpdateDateTime()
                            })


                        })
                        .catch(error => {
                            // Trả về null khi promise thất bại
                            console.error("Đã xảy ra lỗi:", error);
                            return null;
                        });

                    promises.push(promise);

                }
                else {
                    // Thêm null vào danh sách promise nếu mặt hàng không tồn tại
                    promises.push(Promise.resolve(null));
                }

            });

            // Sử dụng Promise.all để theo dõi việc thực hiện của tất cả các promise

            Promise.all(promises).then(results => {
                // Kiểm tra kết quả của tất cả các promise
                const isSuccess = results.every(result => result !== null);

                if (isSuccess) {
                    // Hiển thị thông báo thành công nếu tất cả các promise đều thành công
                    this.setState({
                        documentCode: [],

                    })
                    toast(<div className="advertise"><i className="fa fa-check-circle" aria-hidden="true" />
                        <i>tạo mới thành công!</i></div>);
                    this.getData()
                    this.setId()
                    // this.setState({ isPrev: true })

                } else {
                    // Hiển thị thông báo thất bại nếu có ít nhất một promise thất bại

                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>tạo mới thất bại!</i></div>);
                }
            });
        }
    };



    // renderOptions = () => {
    //     const { dataItemList } = this.state;

    //     return dataItemList.map((item, index) => {
    //         if (item.itemsStatus === 'Đang sử dụng') {

    //             return <option key={index} value={item.itemsName}>{item.itemsName}</option>
    //         }
    //     });
    // }











    handleChangeDocumentCode = (selectedOption, id) => {
        // Tìm chỉ mục của selectedData trong dataApproved
        const dataIndex = this.state.dataApproved.findIndex(item => item.id === id);

        // Kiểm tra xem đã tìm thấy selectedData trong dataApproved hay không
        if (dataIndex !== -1) {
            // Cập nhật nhacungcap vào selectedData
            const updatedDataApproved = [...this.state.dataApproved];
            updatedDataApproved[dataIndex].documentCode = selectedOption.value; // Lưu ý: selectedOption chứa giá trị được chọn từ dropdown

            // Cập nhật lại state cho dataApproved
            this.setState({
                dataApproved: updatedDataApproved
            });
        } else {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Không tìm thấy!</i></div>);
        }
    }





    approvedOrder = (idRequest) => {

        const { idRequestTeamp } = this.state;

        const index = idRequestTeamp.indexOf(idRequest);
        if (index === -1) {
            // Nếu idRequest không tồn tại trong mảng, thêm nó vào mảng
            this.setState({
                idRequestTeamp: [...idRequestTeamp, idRequest]
            });
        } else {
            // Nếu idRequest đã tồn tại trong mảng, loại bỏ nó khỏi mảng
            idRequestTeamp.splice(index, 1);

            this.setState({
                idRequestTeamp: [...idRequestTeamp]
            });
        }

    }
    // Xử lý sự kiện click vào dòng
    handleRowClick = (index) => {
        const { selectedRows } = this.state;
        const selectedIndex = selectedRows.indexOf(index);

        // Nếu dòng đã được chọn, loại bỏ nó khỏi state
        if (selectedIndex !== -1) {
            selectedRows.splice(selectedIndex, 1);
        } else {
            // Nếu dòng chưa được chọn, thêm nó vào state
            selectedRows.push(index);
        }

        // Cập nhật state
        this.setState({ selectedRows: [...selectedRows] });
    };
    arrayTextAreaAddRow = () => {
        let { dataApproved, idRequestTeamp } = this.state;

        // const dataSet = this.getValuesFromDataRequest();
        // // // Hiển thị dataSet nếu có

        // if (dataSet && countNewRow == 0) {
        //     this.state.dataApproved = dataSet
        // }


        const pushNewRow = dataApproved.map((newRowData, index) => (
            <tr key={index}

            // className={this.state.selectedRows.includes(index) ? 'selected' : ''}
            // onClick={() => this.handleRowClick(index)}
            >
                <td>
                    <input
                        onClick={() => this.approvedOrder(newRowData.id)}
                        onChange={() => { }}
                        checked={idRequestTeamp.includes(newRowData.id)} // Kiểm tra xem idRequest có trong mảng idRequestTeamp hay không
                        style={{ cursor: 'pointer' }}
                        type="checkbox"
                        name=""
                        id=""
                        title='checkbox nhấn nút duyệt để nhập kho'
                    />
                </td>
                {this.renderInputFields(newRowData, index)}</tr>
        ));


        return pushNewRow;
    };
    handleChange = (event, rowIndex, column) => {
        const { dataApproved, dataItemList } = this.state;
        const { name, value } = event.target;
        let isItemExist = this.state.isItemExist; // Giữ nguyên trạng thái isItemExist
        // if (name === 'orderName') {
        //     // Kiểm tra sự tồn tại của mặt hàng
        //     isItemExist = dataItemList && dataItemList.some(item => item.itemsName === value);
        // }

        const updatedRowDataList = dataApproved.map((rowData, index) => {
            if (index === rowIndex) {
                if (name === 'orderName') {
                    // Kiểm tra sự tồn tại của mặt hàng trong dòng hiện tại
                    isItemExist = dataItemList && dataItemList.some(item => item.itemsName === value);
                }

                // Nếu đây là dòng cần cập nhật
                return {
                    ...rowData,
                    [column]: value,
                    isItemExist: isItemExist // Cập nhật trạng thái isItemExist cho dòng hiện tại
                };
            }
            return rowData; // Giữ nguyên các dòng không cần cập nhật
        });
        // Tính toán giá trị mới cho intoMoney nếu thay đổi ở amount hoặc unitPrice
        if (name === 'amount' || name === 'unitPrice') {
            const amountValue = updatedRowDataList[rowIndex].amount;
            const unitPriceValue = updatedRowDataList[rowIndex].unitPrice;
            const amount = typeof amountValue === 'string' ? parseFloat(amountValue.replace(/,/g, '')) : parseFloat(amountValue) || 0;
            // const amount = parseFloat(updatedRowDataList[rowIndex].amount.replace(/,/g, '') || 0);
            const unitPrice = typeof unitPriceValue === 'string' ? parseFloat(unitPriceValue.replace(/,/g, '')) : parseFloat(unitPriceValue) || 0;
            const intoMoney = amount * unitPrice;
            updatedRowDataList[rowIndex] = {
                ...updatedRowDataList[rowIndex],
                intoMoney: intoMoney, // Làm tròn đến 2 chữ số thập phân
                isItemExist: isItemExist // Cập nhật trạng thái isItemExist cho dòng hiện tại
            };
        }

        this.setState({
            dataApproved: updatedRowDataList,
            // isItemExist: isItemExist // Cập nhật trạng thái isItemExist
        });
    };


    // getValuesFromDataRequest = () => {
    //     const { dataRequestTeamp } = this.state;
    //     const { permission, userName } = this.state;

    //     const combinedData = [];
    //     if (dataRequestTeamp) {

    //         // Lặp qua mỗi phần tử trong dataRequest
    //         dataRequestTeamp.forEach(item => {
    //             // Tìm phần tử trong dataRequestTeamp có idSave tương tự


    //             if (item.savePermission === permission && item.saveUserName === userName) {
    //                 combinedData.push(item);
    //             }

    //         });
    //     }

    //     return combinedData;
    // };

    // rule

    handleKeyPress = (event) => {
        const keyCode = event.keyCode || event.which;
        const allowedCharacters = [',', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        if (!allowedCharacters.includes(String.fromCharCode(keyCode))) {
            event.preventDefault();
        }
    }

    renderInputFields = (rowData, rowIndex) => {
        const { columnValues, dataRequestTeamp, dataRequest, permission, countNewRow, documentCode } = this.state;

        if (countNewRow === 0) {
            rowData.isItemExist = true;
        }

        return columnValues.map((column, index) => {
            if (column === 'id' || column === 'orderComplete') {
                return null;
            } else {
                if (column === 'orderName') {
                    return (

                        <td key={index}>

                            <textarea
                                readOnly={
                                    column === 'id' || column === 'orderCode' ||
                                    column === 'dateCreated' || column === 'dateUpdateApprove'
                                }
                                onChange={(event) => this.handleChange(event, rowIndex, column)}
                                name={column}
                                value={rowData[column] || ''}

                                autoFocus={index === 1}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                            />
                            <span style={{ position: 'relative', color: 'red' }}>
                                {!rowData.isItemExist && 'Tên hàng này không tồn tại!'}
                            </span>
                        </td>
                    )
                }
                else if (column === 'intoWarehouseCodeDocument') {

                    return (
                        <td key={index}>
                            <div className='select-intowarehouse'>

                                {Array.isArray(documentCode) && documentCode.length > 0 && (
                                    <Select onChange={(selectedOption) => this.handleChangeDocumentCode(selectedOption, rowData.id)} name='selectDocumentCode' placeholder="Nhập mã chứng từ" options={documentCode} />
                                )}
                            </div>
                        </td>
                    )
                }
                else if (column === 'intoMoney') {

                    return (
                        <td key={index}>
                            <textarea
                                readOnly={
                                    column === 'id' || column === 'orderCode' || column === 'intoMoney' ||
                                    column === 'dateCreated' || column === 'dateUpdateApprove'
                                }
                                onChange={(event) => this.handleChange(event, rowIndex, column)}
                                name={column}
                                value={parseFloat(rowData[column]).toLocaleString('en-US', { maximumFractionDigits: 0 }) || ''} // Định dạng giá trị trước khi truyền vào textarea

                                // autoFocus={index === 2}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                            />
                        </td>
                    )
                }
                else if (column === 'amount') {
                    return (

                        <td key={index}>
                            <textarea
                                readOnly={
                                    column === 'id' || column === 'orderCode' ||
                                    column === 'dateCreated' || column === 'dateUpdateApprove'
                                }

                                onChange={(event) => this.handleChange(event, rowIndex, column)}
                                name={column}
                                value={FormatNumber(rowData[column]) || ''}

                                // autoFocus={index === 2}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                                onKeyPress={this.handleKeyPress}
                            />
                        </td>
                    )
                }
                else if (column === 'unitPrice') {
                    return (
                        <td key={index}>
                            <textarea
                                readOnly={
                                    column === 'id' || column === 'orderCode' ||
                                    column === 'dateCreated' || column === 'dateUpdateApprove'
                                }
                                onChange={(event) => this.handleChange(event, rowIndex, column)}
                                name={column}
                                value={FormatNumber(rowData[column]) || ''}

                                // autoFocus={index === 1}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                                onKeyPress={this.handleKeyPress}
                            />
                        </td>
                    )
                }
                else {
                    return (
                        <td key={index}>
                            <textarea
                                readOnly={
                                    column === 'id' || column === 'orderCode' ||
                                    column === 'dateCreated' || column === 'dateUpdateApprove'
                                }
                                onChange={(event) => this.handleChange(event, rowIndex, column)}
                                name={column}
                                value={rowData[column] || ''}
                                autoFocus={index === 1}
                                title={column === 'dateUpdateApprove' ? 'Là ngày đơn được duyệt' : column === 'dateCreated' ? 'Là ngày đơn được tạo' : ''}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                            />
                        </td>
                    )
                }
            }
        });
    };



    render() {
        const { orderCode, countNewRow, dataApproved, listNameItemsOpt } = this.state;

        if (this.state.isPrev) {
            window.history.back()
            // return <Redirect to='/request-not' />
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
                        <h3>Nhập kho</h3>






                        {/* {(countNewRow.length > 0 || this.getValuesFromDataRequest().length > 0) && */}
                        <div>

                            <img style={{ width: '40px', cursor: 'pointer' }} onClick={() => this.handleSave()} title='Gửi đi' src='../icons/color/check.png' />
                        </div>
                        {/* } */}
                        <div className="form-group">

                        </div>
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    <th ><i className='bx bxs-flag-checkered'></i></th>

                                    <th >Mã chứng từ</th>
                                    <th >Mã hàng</th>
                                    <th >Tên hàng</th>
                                    <th >Đơn vị tính</th>
                                    <th >Số lượng nhận</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Thành tiền (VND)</th>
                                    {/* <th >Ghi chú</th> */}
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                </tr>
                            </thead>
                            <tbody>

                                {this.arrayTextAreaAddRow()}


                            </tbody>
                        </table>
                    </div>
                </div>

                {/* order click row show warehouse */}
            </div>

        );
    }
}

export default PurchaseIntoWarehouse;