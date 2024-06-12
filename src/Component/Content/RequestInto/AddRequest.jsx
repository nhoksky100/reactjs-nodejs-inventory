import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';

import { randomId } from '../../RandomId/randomId'
import { FormatNumber } from '../../FormatNumber'
import Select from 'react-select';
// import Creatable from 'react-select/async-creatable';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { valueIndex } from '../../../StoreRcd';
const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)
const getdataItemsList = () => axios.get('/getItemsList').then((res) => res.data)
const getdataListAccount = () => axios.get('/getAccount').then((res) => res.data)
const getDataRequestTeamp = () => axios.get('/getRequestTeamp').then((res) => res.data)
const getDataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataWarehouse = () => axios.get('/getWarehouse').then((res) => res.data)
const getdataNotification = () => axios.get('/getNotification').then((res) => res.data)

class AddRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataItemList: [],
            dataListAccount: [],
            dataRequestTeamp: [],
            dataMember: [],
            dataWarehouse: [],
            dataNotification: [],
            userName: '',
            idAccount: '',
            memberName: '',

            department: '',
            memberDepartment: '',
            isPrev: false,
            flagPosition: false,
            rowAddIndex: 0,
            rowAddIndexTeamp: 0,
            // idCounter: 0,
            columnValues: ['id', 'orderCode', 'warehouseAreaName', 'orderName', 'orderNotes', 'unit', 'amount', 'unitPrice', 'intoMoney', 'dateCreated', 'dateUpdate'],

            // input select
            // isItemExist: [],
            isAddRow: false,
            selectedOption: '', // Lưu giá trị của option được chọn
            selectedItem: null, // Thông tin về mặt hàng được chọn,

            countNewRow: 0,
            newRowDataList: [], // Mảng mới để lưu các đối tượng dòng mới
            newRowDataListTeamp: [], // Mảng mới để lưu các đối tượng dòng mới
            isisSave: false,
            warehouseAreaName: [],
            // create table selected 
            selectedOptions: [],
            warehouseOptions: [],
            // optselect
            listNameItemsOpt: [],
            // handleselect index
            rowIndex: 0,
            isSelected: false,
            // dataSet:[],
            firstValueAssigned: false,

        };
        this._isMounted = false;
        this.handleOptionSelect = this.handleOptionSelect.bind(this)
    }


    componentDidMount() {
        this._isMounted = true;
        Promise.all([this.getData(), this.isBcryptPermission()]).then(() => {
            this.updateNewRowDataListFromDataSet();
            this.listItemMember();
            this.fetchWarehouseData()

        });

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
        this._isMounted = true
        try {



            const [dataRequest, dataItemList, dataListAccount, dataRequestTeamp, dataMember, dataWarehouse, dataNotification] = await Promise.all([
                getdataRequest(),
                getdataItemsList(),
                getdataListAccount(),
                getDataRequestTeamp(),
                getDataMember(),
                getdataWarehouse(),
                getdataNotification(),
            ]);

            if (dataRequest) {
                let id = randomId();
                const isDuplicateitemCode = (id) => {
                    return dataRequest.rows.some(item => item.id === id);
                };

                // Kiểm tra và tạo itemCode mới nếu trùng lặp
                while (isDuplicateitemCode(id)) {
                    id = randomId();
                }
                if (this._isMounted) {

                    this.setState({
                        dataRequest: dataRequest.rows.reverse(),
                        id: id
                    });
                }

            }

            if (dataItemList) {
                // const idCounter = dataItemList.rows.length && dataItemList.rows.length !== 0 ? dataItemList.rows.length + 1 : 1;
                // const listNameItemsOpt = dataItemList
                //     .filter(item => item.itemsStatus === 'Đang sử dụng') // Lọc ra các phần tử có status là 'Đang sử dụng'
                //     .map(item => ({
                //         value: item.itemsName,
                //         label: item.itemsName
                //     }));

                if (this._isMounted) {

                    this.setState({
                        dataItemList: dataItemList.rows.reverse(),
                        // idCounter: idCounter,
                        // listNameItemsOpt: listNameItemsOpt
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
            if (dataWarehouse) {
                if (this._isMounted) {
                    const filteredWarehouseData = dataWarehouse.rows.filter(item => item.warehouseStatus !== 'Không sử dụng' && item.warehouseStatus !== 'Không dùng');
                    this.setState({ dataWarehouse: filteredWarehouseData });
                }
            }
            if (dataNotification) {
                if (this._isMounted) {
                    this.setState({ dataNotification: dataNotification.rows });
                }
            }

            // Sau khi tất cả dữ liệu đã được cập nhật, gọi updateNewRowDataListFromDataSet
            // this.updateNewRowDataListFromDataSet();
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


    // create table selected
    fetchWarehouseData = () => {
        const { dataWarehouse } = this.state;

        // Lọc các mục trong dataWarehouse có warehouseStatus !== 'Không sử dụng'
        // const filteredWarehouseData = dataWarehouse.filter(item => item.warehouseStatus !== 'Không sử dụng' && item.warehouseStatus !== 'Không dùng');

        // Tạo một Set để lưu trữ các warehouseAreaName duy nhất
        const uniqueWarehouseAreaNames = new Set();

        // Lặp qua mảng filteredWarehouseData và thêm các warehouseAreaName vào Set
        dataWarehouse.forEach(item => {
            uniqueWarehouseAreaNames.add(item.warehouseAreaName);
        });

        // Chuyển Set thành mảng
        const uniqueWarehouseAreaNamesArray = Array.from(uniqueWarehouseAreaNames);

        // Tạo mảng options từ danh sách các warehouseAreaName duy nhất
        const options = uniqueWarehouseAreaNamesArray.map(name => ({
            value: name,
            label: name
        }));
        if (this._isMounted) {

            // Cập nhật state với options cho CreatableSelect
            this.setState({ warehouseOptions: options });
        }
    };

    handleSelectChange = (selectedOptions, rowIndex, column) => {
        let warehouseAreaNames = []
        const { dataWarehouse } = this.state;
        if (selectedOptions) {
            let option = selectedOptions;
            if (Array.isArray(selectedOptions)) {
                option = selectedOptions.find(opt => opt); // Lấy phần tử đầu tiên
            }
            if (option) {
                warehouseAreaNames = [option.value]; // Tạo một mảng chứa giá trị

            }
        }

        // Lọc ra các mục trong dataWarehouse có giá trị trùng khớp với các giá trị được chọn
        const filteredWarehouseItems = dataWarehouse.filter(item => warehouseAreaNames.includes(item.warehouseAreaName));

        // Tạo danh sách mục mới từ các mục đã lọc
        const filteredItemsOptions = filteredWarehouseItems.map(item => ({
            label: item.warehouseItemsName,
            value: item.warehouseItemsName
        }));

        // Cập nhật state selectedOptions và listNameItemsOpt với danh sách mục đã lọc
        this.setState({
            selectedOptions,
            listNameItemsOpt: filteredItemsOptions
        });
        const newRowDataListUpdated = [...this.state.newRowDataList];
        // Lấy ra dòng cụ thể từ newRowDataList
        const newRowData = newRowDataListUpdated[rowIndex];

        // Cập nhật giá trị của cột tương ứng cho dòng cụ thể
        newRowData[column] = warehouseAreaNames.join(', ');

        // Thêm newRowData vào newRowDataList nếu nó chưa tồn tại trong mảng
        if (!newRowDataListUpdated.includes(newRowData)) {
            newRowDataListUpdated[rowIndex] = newRowData;
        }

        // Cập nhật state với newRowDataList được cập nhật
        this.setState({ newRowDataList: newRowDataListUpdated });

    };


    refeshRandomId = (data) => {
        let id = ''
        const isDuplicateitemCode = (id) => {
            return data.some(item => item.id === id);
        };

        // Kiểm tra và tạo itemCode mới nếu trùng lặp
        while (isDuplicateitemCode(id)) {
            id = randomId();
        }
        return id;
    }
    undoClearAddRow = () => {
        this.setState({ isPrev: true })
    }

    listItemMember = () => {
        try {
            const { dataMember, idAccount } = this.state;
            const dataMemberFill = dataMember.length > 0 && dataMember.filter((item) => item.id === idAccount) || [];

            if (dataMemberFill.length > 0 && this._isMounted) {

                this.setState({
                    memberDepartment: dataMemberFill[0].memberDepartment,
                    memberName: dataMemberFill[0].memberName
                })
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error occurred while fetching data:", error);
        }

    }
    handleSave = () => {
        const { permission, newRowDataList, newRowDataListTeamp, rowAddIndex, countNewRow, memberName, memberDepartment, dataRequest, dataNotification, idAccount } = this.state;
        const promises = [];

        // Tạo các promise cho việc gửi dữ liệu lên máy chủ từ mỗi dòng
        if (newRowDataList.length === 0 && newRowDataListTeamp.length === 0) return;
        if (this._isMounted) {

            newRowDataList.forEach(newRowData => {
                const { id, orderCode, orderName, orderNotes, unit, amount, unitPrice, intoMoney, warehouseAreaName } = newRowData;

                if (orderName && unit && amount && unitPrice && intoMoney && warehouseAreaName) {
                    let priceFormat = unitPrice;
                    let amountFormat = amount;

                    if (typeof unitPrice === 'string' && unitPrice.indexOf(',') !== -1) {
                        priceFormat = unitPrice.replace(",", "").replace(".", "")
                    }
                    else if (typeof amount === 'string' && amount.indexOf(',') !== -1) {
                        amountFormat = amount.replace(",", "").replace(".", "")
                    }

                    // Kiểm tra xem có orderCode nào trong dataRequest giống với orderCode trong newRowDataList và đơn chưa xuất pdf không
                    const existingData = dataRequest.find(request => request.orderCode === orderCode && parseInt(request.orderComplete) < 2);
                    const existingDateCreated = existingData ? existingData.dateCreated : null;

                    // Tạo promise cho mỗi dòng
                    const promise = axios.post('/addOrderRequest', {
                        id: id, // Sử dụng rowAddIndex trực tiếp
                        warehouseAreaName,
                        orderCode,
                        orderMaker: memberName,
                        orderName,
                        orderNotes,
                        unit,
                        amount: amountFormat,
                        unitPrice: priceFormat,
                        intoMoney,
                        statusOrder: 'Chờ duyệt', // Khai báo trực tiếp
                        department: memberDepartment,
                        // idSave: isSave ? id : '',
                        permission,
                        dateCreated: existingDateCreated || UpdateDateTime(), // Sử dụng ngày tạo từ dataRequest nếu tồn tại, ngược lại sử dụng ngày tạo mới
                        dateUpdate: UpdateDateTime() // Khai báo trực tiếp
                    }).then(response => {
                        if (newRowDataListTeamp.length > 0) {
                            newRowDataListTeamp.map((value, key) => {
                                axios.post('/removeOrderTeamp', { id: value.id })
                                    .catch(error => {
                                        console.error("Đã xảy ra lỗi khi xóa dữ liệu:", error);
                                    });
                            })
                        }
                        if (permission === 'Thành viên thu mua') {
                            axios.post('/addApproveDate', {
                                id: randomId(),
                                orderApprove: memberName,
                                department: memberDepartment,
                                dateUpdate: UpdateDateTime(),
                                orderCode,
                                idRequest: id,
                            })
                        }

                        let idNotification = this.refeshRandomId(dataNotification)

                        const nameItems = 'Mặt hàng ' + orderName
                        axios.post('/addNotification', {
                            id: idNotification, idRequest: id, idMember: idAccount, title: 'Đơn nhập hàng đang chờ duyệt',
                            content: nameItems, maker: memberName, department: memberDepartment, status: 'Chờ duyệt', isApproved: 0,
                            pointApprovedInto: 0,
                            pointApprovedExport: 0,
                            tab: 'Nhập', isRead: 0,
                            dateCreated: UpdateDateTime()
                        }).catch(error => {
                            // Trả về null khi promise thất bại
                            console.error("Đã xảy ra lỗi:", error);
                            return null;
                        });
                        // Trả về dữ liệu khi promise thành công
                        this.getData()
                        return response.data;
                    }).catch(error => {
                        // Trả về null khi promise thất bại
                        console.error("Đã xảy ra lỗi:", error);
                        return null;
                    });

                    promises.push(promise);

                } else {
                    // Thêm null vào danh sách promise nếu mặt hàng không tồn tại
                    promises.push(Promise.resolve(null));
                }

            });

            // Sử dụng Promise.all để theo dõi việc thực hiện của tất cả các promise
            Promise.all(promises).then(results => {
                // Kiểm tra kết quả của tất cả các promise
                const isSuccess = results.every(result => result !== null);

                if (isSuccess) {
                    //Nottification 


                    // Hiển thị thông báo thành công nếu tất cả các promise đều thành công
                    toast(<div className="advertise"><i className="fa fa-check-circle" aria-hidden="true" />
                        <i>tạo mới thành công!</i></div>);
                    this.setState({ isPrev: true })
                } else {
                    // Hiển thị thông báo thất bại nếu có ít nhất một promise thất bại
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>tạo mới thất bại!</i></div>);
                }
            });
        }
    };


    // lưu đơn tạm
    handleSaveTeamp = async () => {
        const { newRowDataList, newRowDataListTeamp, permission, userName, memberDepartment, memberName, selectedOptions } = this.state;
        // let dataSet = this.getValuesFromDataRequest();
        const promises = [];
        if (newRowDataListTeamp.length === 0 && newRowDataList.length === 0) return
        if (this._isMounted) {

            // console.log(newRowDataListTeamp, 'newRowDataListTeamp');
            for (const newRowData of newRowDataList) {
                const { id, orderName, orderCode, orderNotes, unit, amount, unitPrice, intoMoney, warehouseAreaName } = newRowData;

                // Kiểm tra xem id có tồn tại trong newRowDataList không
                const isNewRowData = newRowDataListTeamp.some(newRowData => newRowData.id === id);

                // if (dataSet && dataSet.includes(id)) {
                //     console.log('trung');
                //     // Nếu id đã tồn tại, bỏ qua và tiếp tục với phần tử tiếp theo trong newRowDataList
                //     continue;
                // }

                try {
                    // let priceFormat = unitPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })
                    // console.log(priceFormat,'priceFormat');
                    let priceFormat = unitPrice;
                    let amountFormat = amount;
                    if (typeof unitPrice === 'string' && unitPrice.indexOf(',') !== -1) {

                        priceFormat = unitPrice.replace(",", "").replace(".", "")
                    }
                    else if (typeof amount === 'string' && amount.indexOf(',') !== -1) {

                        amountFormat = amount.replace(",", "").replace(".", "")
                    }


                    // let formatAmount = parseInt(amount)
                    // priceFormat.join(",")


                    let response;
                    if (isNewRowData) {
                        response = await axios.post('/updateOrderRequestTeamp', {
                            id: id,
                            saveCode: orderCode,
                            warehouseAreaName: warehouseAreaName,
                            savePermission: permission,
                            saveUserName: userName,
                            orderNotes,
                            idSave: id,
                            orderMaker: memberName,
                            orderCode,
                            statusOrder: 'Chờ duyệt',
                            orderName, unit, amount: amountFormat, unitPrice: priceFormat, intoMoney, department: memberDepartment,
                            dateCreated: UpdateDateTime(),
                            dateUpdate: UpdateDateTime()
                        });
                    }
                    else {
                        response = await axios.post('/addOrderRequestTeamp', {
                            id: id,
                            saveCode: orderCode,
                            warehouseAreaName: warehouseAreaName,
                            savePermission: permission,
                            saveUserName: userName,
                            idSave: id,
                            orderMaker: memberName,
                            orderCode,
                            statusOrder: 'Chờ duyệt',
                            orderName, orderNotes, unit, amount: amountFormat, unitPrice: priceFormat, intoMoney, department: memberDepartment,
                            dateCreated: UpdateDateTime(),
                            dateUpdate: UpdateDateTime()
                        });

                        this.getData();
                        promises.push(response.data);
                    }
                } catch (error) {
                    console.error("Đã xảy ra lỗi:", error);
                    promises.push(null);
                }
            }

            Promise.all(promises).then(results => {
                const isSuccess = results.every(result => result !== null);

                if (isSuccess) {
                    this.setState({ isPrev: true });
                    toast(<div className="advertise"><i className="fa fa-check-circle" aria-hidden="true" />
                        <i>Lưu tạm thời thành công!</i></div>);
                }
                // else {
                //     toast(<div className="advertise"><i className="fa fa-check-circle" aria-hidden="true" />
                //         <i>Lưu tạm thời thất bại!</i></div>);
                // }
            });
        }
    }

    renderOptions = () => {
        const { dataItemList } = this.state;

        return dataItemList.map((item, index) => {
            if (item.itemsStatus === 'Đang sử dụng') {

                return <option key={index} value={item.itemsName}>{item.itemsName}</option>
            }
        });
    }







    // handleOptionChange = (e) => {
    //     const selectedOption = e.target.value;
    //     const selectedItem = this.state.dataItemList.find(item => item.itemsName === selectedOption);
    //     if (selectedItem) {
    //         this.setState({
    //             orderName: selectedItem.itemsName,
    //             orderCode: selectedItem.itemsCode,
    //             unit: selectedItem.itemsUnit,
    //             unitPrice: selectedItem.itemsUnitPrice,
    //             isItemExist: true,
    //             // isAddRow: true,

    //         });
    //     } else {
    //         this.setState({
    //             orderName: '',
    //             orderCode: '',
    //             isItemExist: false,
    //             // isAddRow: false,
    //         }); // Đặt tên hàng về trạng thái mặc định nếu không tìm thấy dòng tương ứng
    //     }
    // }

    handleOptionSelect = (selectedOption, rowIndex, column, rowData) => {

        const selectedItem = this.state.dataWarehouse.find(item =>
            item.warehouseItemsName === selectedOption.value &&
            (item.warehouseStatus !== 'Đã khóa' || item.warehouseStatus !== 'Đang khóa')
        );

        if (selectedItem) {
            const newRowDataList = [...this.state.newRowDataList];
            const currentIndex = rowIndex; // Chỉ số dòng tương ứng

            if (currentIndex >= 0 && currentIndex < newRowDataList.length) { // Kiểm tra chỉ số hợp lệ
                const newRowData = { ...newRowDataList[currentIndex] }; // Sao chép dòng tương ứng
                // Cập nhật các giá trị cho dòng tương ứng
                newRowData[column] = selectedItem.warehouseItemsName;
                newRowData.orderCode = selectedItem.warehouseItemsCode;
                newRowData.unit = selectedItem.warehouseUnit;
                newRowData.unitPrice = selectedItem.warehouseUnitPrice;
                // newRowData.isItemExist = true;

                // Cập nhật lại state với dòng đã được cập nhật
                newRowDataList[currentIndex] = newRowData;

                this.setState({
                    newRowDataList,
                    firstValueAssigned: true,
                    orderCode: selectedItem.warehouseItemsCode,
                    isSelected: true,

                });




            }
        }
        // } else {
        //     this.setState({
        //         // orderName: '',
        //         // orderCode: '',
        //         // isItemExist: false,
        //         // isAddRow: false,
        //     }); // Đặt tên hàng về trạng thái mặc định nếu không tìm thấy dòng tương ứng
        // }
    };

    addNewRow = () => {
        const { dataWarehouse, columnValues, orderName, id } = this.state;

        // Kiểm tra xem liệu mặt hàng có tồn tại trong dataWarehouse hay không
        // const isItemExist = dataWarehouse.some(item => item.warehouseItemsName === orderName);

        // Tạo một đối tượng mới đại diện cho dòng mới
        const newRowData = {
            // isItemExist, // Gán giá trị cho trường isItemExist của newRowData
            dateCreated: UpdateDateTime(),
            dateUpdate: UpdateDateTime(),
            id,
        };

        // Lặp qua các cột và gán giá trị tương ứng từ state vào newRowData
        columnValues.forEach(column => {
            if (column !== 'dateCreated' && column !== 'dateUpdate' && column !== 'id') {
                newRowData[column] = this.state[column];
            }
        });

        // Thêm dòng mới vào mảng
        this.setState(prevState => ({
            newRowDataList: [...prevState.newRowDataList, newRowData],
            rowAddIndex: prevState.id + 1, // Tăng chỉ số dòng
            countNewRow: prevState.countNewRow + 1, // Tăng số lượng dòng mới
            isSelected: false,

            listNameItemsOpt: []
        }));
        // this.props.getValueIndex(rowIndexRemove)
        this.getData(); // Có thể cần xem xét việc di chuyển getData() nếu cần
    };


    // componentDidUpdate(prevProps, prevState) {
    //     // if (prevState.isAddRow !== this.state.isAddRow && this.state.isAddRow) {
    //     //     this.addNewRow();
    //     // }

    // }

    showDataItemListApprove = () => {
        const { dataRequest, dataWarehouse, newRowDataList, rowIndex, orderCode } = this.state;

        // Lọc dataWarehouse dựa trên điều kiện orderCode === warehouseItemsCode
        let filteredWarehouse = []
        if (newRowDataList.length !== 0) {
            filteredWarehouse = dataWarehouse.filter(item => item.warehouseItemsCode === orderCode);
        }

        if (filteredWarehouse.length !== 0 && newRowDataList.length !== 0) {
            // Lọc dataRequest để chỉ lấy các mục có orderCode tương tự như warehouseItemsCode trong filteredWarehouse
            const filteredRequests = dataRequest.filter(request => request.orderCode === orderCode
                && parseInt(request.orderComplete !== null ? request.orderComplete : 0) !== 3);

            // Tính tổng amount của các mục trong filteredRequests
            const totalAmount = filteredRequests.length !== 0 ? filteredRequests.reduce((acc, curr) => parseInt(acc) + parseInt(curr.amount), 0) : 0

            return (
                <>
                    {filteredWarehouse.map((value, key) => (
                        <tr key={key}>
                            <td>{value.warehouseItemsCode}</td>
                            <td>{value.warehouseResidual}</td>
                            <td>{totalAmount}</td>
                            <td>{value.warehouseQuotaMin}</td>
                            <td>{value.warehouseQuotaMax}</td>
                            <td>{value.warehouseUnit}</td>
                            <td>{value.warehouseStatus}</td>
                            <td>{filteredRequests.length !== 0 ? filteredRequests[0].dateCreated : ''}</td>
                            <td>{filteredRequests.length !== 0 ? filteredRequests[0].dateUpdate : ''}</td>
                        </tr>
                    ))}
                </>
            );
        }
    };

    // Hàm xóa dòng
    removeOrder = (id) => {
        const { newRowDataList, rowIndex, dataRequestTeamp, userName } = this.state;

        // Lọc dataRequestTeamp dựa trên userName và orderCode của newRowDataList
        const filteredRequests = dataRequestTeamp.length > 0 && dataRequestTeamp.filter(request =>
            request.userName === userName && newRowDataList.some(newRow => newRow.orderCode === request.orderCode) || []
        );

        const updatedNewRowDataList = newRowDataList.filter(item => item.id !== id);
        const rowIndexRemove = rowIndex - 1 < 0 ? 0 : rowIndex - 1;
        const orderCode = updatedNewRowDataList.length > 0 ? updatedNewRowDataList[rowIndexRemove].orderCode : '';

        this.setState({
            newRowDataList: updatedNewRowDataList,
            rowIndex: rowIndexRemove,
            orderCode: orderCode
        });
        this.getData()

        // Kiểm tra xem có mục nào phù hợp với điều kiện không
        if (filteredRequests.length > 0) {
            axios.post('/removeOrderTeamp', { id })
                .then(response => {
                    // Xử lý kết quả nếu cần
                })
                .catch(error => {
                    console.error("Đã xảy ra lỗi khi xóa dữ liệu:", error);
                });
        } else {
            console.log("Không có mục phù hợp với điều kiện.");
        }
    };


    // Phương thức để cập nhật newRowDataList từ dataSet
    updateNewRowDataListFromDataSet = () => {
        const { columnValues } = this.state;
        const dataSet = this.getValuesFromDataRequest()

        //   console.log(dataSet,'dataSet');
        if (dataSet && dataSet.length > 0) {
            // Duyệt qua từng dòng trong dataSet
            const newRowDataList = dataSet.map(data => {
                // Tạo một đối tượng mới để chứa dữ liệu của mỗi hàng
                let newRowData = {};

                // Duyệt qua từng cột trong columnValues
                columnValues.forEach(column => {
                    if (column === 'dateCreated' || column === 'dateUpdate') {
                        // Nếu là cột 'dateCreated' hoặc 'dateUpdate', gán giá trị thích hợp
                        newRowData[column] = UpdateDateTime();
                    } else {
                        // Nếu không, kiểm tra xem dataSet có chứa giá trị cho cột này không
                        if (data.hasOwnProperty(column)) {
                            newRowData[column] = data[column];
                        } else {
                            // Nếu không tìm thấy giá trị cho cột này, gán giá trị mặc định (có thể là rỗng)
                            newRowData[column] = '';
                        }
                    }
                });

                return newRowData;
            });
            if (this._isMounted) {
                this.setState({
                    newRowDataList: newRowDataList,
                    newRowDataListTeamp: newRowDataList,
                });
            }
        }
    };

    rowIndex = (index) => {
        this.setState({ rowIndex: index })
        // this.props.getValueIndex(index)
    }
    arrayTextAreaAddRow = () => {
        let { newRowDataList } = this.state;

        // const dataSet = this.getValuesFromDataRequest();
        // // // Hiển thị dataSet nếu có

        // if (dataSet && countNewRow == 0) {
        //     this.state.newRowDataList = dataSet
        // }


        const pushNewRow = newRowDataList.map((newRowData, index) => (
            <tr onClick={() => this.rowIndex(index)} key={index}>
                <td><img style={{ width: '40px', cursor: 'pointer' }} onClick={() => this.removeOrder(newRowData.id)} title='Xóa' src='../icons/color/removeOrder.png' /></td>
                {this.renderInputFields(newRowData, index)}
            </tr>
        ));


        return pushNewRow;
    };
    handleChange = (event, rowIndex, column) => {
        const { newRowDataList, dataItemList } = this.state;
        const { name, value } = event.target;
        // let isItemExist = this.state.isItemExist; // Giữ nguyên trạng thái isItemExist
        // if (name === 'orderName') {
        //     // Kiểm tra sự tồn tại của mặt hàng
        //     isItemExist = dataItemList && dataItemList.some(item => item.itemsName === value);
        // }

        const updatedRowDataList = newRowDataList.map((rowData, index) => {
            if (index === rowIndex) {
                // if (name === 'orderName') {
                //     // Kiểm tra sự tồn tại của mặt hàng trong dòng hiện tại
                //     isItemExist = dataItemList && dataItemList.some(item => item.itemsName === value);
                // }

                // Nếu đây là dòng cần cập nhật
                return {
                    ...rowData,
                    [column]: value,
                    // isItemExist: isItemExist // Cập nhật trạng thái isItemExist cho dòng hiện tại
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
                // isItemExist: isItemExist // Cập nhật trạng thái isItemExist cho dòng hiện tại
            };
        }

        this.setState({
            newRowDataList: updatedRowDataList,
            // isItemExist: isItemExist // Cập nhật trạng thái isItemExist
        });
    };



    getValuesFromDataRequest = () => {
        const { dataRequestTeamp } = this.state;
        const { permission, userName } = this.state;

        const combinedData = [];
        if (dataRequestTeamp) {

            // Lặp qua mỗi phần tử trong dataRequest
            dataRequestTeamp.forEach(item => {
                // Tìm phần tử trong dataRequestTeamp có idSave tương tự


                if (item.savePermission === permission && item.saveUserName === userName) {
                    combinedData.push(item);
                }

            });
        }
        // this.setState({newRowDataList:combinedData})
        return combinedData;
    };

    // rule
    handleKeyPress = (event) => {
        const keyCode = event.keyCode || event.which;
        const allowedCharacters = [',', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        if (!allowedCharacters.includes(String.fromCharCode(keyCode))) {
            event.preventDefault();
        }
    }

    renderInputFields = (rowData, rowIndex) => {
        const { columnValues, dataRequestTeamp, dataRequest, permission, countNewRow,
            listNameItemsOpt, warehouseOptions, selectedOptions, newRowDataList } = this.state;

        // Kiểm tra xem rowData có dữ liệu không


        // if (countNewRow === 0) {
        //     rowData.isItemExist = true;
        // }
        return columnValues.map((column, index) => {
            if (column === 'id' || column === 'orderCode' || column === 'orderComplete') {
                return null;
            } else {
                if (column === 'warehouseAreaName') {


                    return (

                        <td key={index}>


                            <div className='form-group'>
                                <Select
                                    className='select-order-name'
                                    onChange={(selectedOptions) => this.handleSelectChange(selectedOptions, rowIndex, column)}
                                    options={warehouseOptions}
                                    value={selectedOptions[index] ||
                                    {
                                        value: newRowDataList[rowIndex].warehouseAreaName && newRowDataList[rowIndex].warehouseAreaName,
                                        label: newRowDataList[rowIndex].warehouseAreaName && newRowDataList[rowIndex].warehouseAreaName
                                    }}

                                    name={column}
                                    placeholder="Chọn kho..."
                                />
                            </div>

                        </td>
                    )
                }
                else if (column === 'orderName') {


                    return (

                        <td key={index}>


                            <div className="form-group">



                                {/* {Array.isArray(listNameItemsOpt) && listNameItemsOpt.length > 0 && ( */}
                                <Select
                                    className='select-order-name'
                                    onChange={(selectedOption) => this.handleOptionSelect(selectedOption, rowIndex, column, rowData)} // Thêm rowIndex ở đây
                                    name={column}
                                    placeholder="Chọn mặt hàng"
                                    // value={listNameItemsOpt[index] || { value: newRowDataList[rowIndex].orderName, label: newRowDataList[rowIndex].orderName }}
                                    value={listNameItemsOpt[index] || { value: newRowDataList[rowIndex]?.orderName || '', label: newRowDataList[rowIndex]?.orderName || '' }}


                                    options={listNameItemsOpt}
                                />
                                {/* )} */}


                            </div>
                            {/* <span className='itemExist'>
                                {!rowData.isItemExist && 'Tên hàng này không tồn tại!'}
                            </span> */}
                        </td>
                    )
                }
                else if (column === 'intoMoney') {

                    return (
                        <td key={index}>
                            <textarea
                                readOnly={
                                    column === 'id' || column === 'orderCode' || column === 'intoMoney' ||
                                    column === 'dateCreated' || column === 'dateUpdate'
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
                                    column === 'dateCreated' || column === 'dateUpdate'
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
                                    column === 'dateCreated' || column === 'dateUpdate'
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
                                    column === 'dateCreated' || column === 'dateUpdate'
                                }
                                onChange={(event) => this.handleChange(event, rowIndex, column)}
                                name={column}
                                value={rowData[column] || ''}
                                autoFocus={index === 1}
                                style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                            />
                        </td>
                    )
                }
            }
        });
    };



    render() {
        const { orderCode, countNewRow, newRowDataList, listNameItemsOpt, selectedOptions, warehouseOptions, isSelected, } = this.state;
        // console.log(newRowDataList,'newRowDataList');

        if (this.state.isPrev) {
            sessionStorage.setItem('request', 'Nhập')
            return <Navigate to='/request' />
        }

        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        {/* <div className="head-content-menu">
                            <img onClick={() => this.undoClearAddRow()} title='Quay lại' src='../icons/color/undo.png' />


                        </div> */}
                    </div>
                    <div className="head">
                        <h3>Tạo đơn</h3>


                        <div>
                            <img style={{ width: '40px', cursor: 'pointer' }} onClick={() => this.addNewRow()} title='Thêm dòng mới' src='../icons/color/add-file.png' />
                        </div>


                        <div>
                            <img style={{ width: '40px', cursor: 'pointer' }} onClick={() => this.handleSaveTeamp()} title='Tạm lưu' src='../icons/color/datasetorder.png' />
                        </div>


                        {/* {(countNewRow.length > 0 || this.getValuesFromDataRequest().length > 0) && */}
                        <div>

                            <img style={{ width: '40px', cursor: 'pointer' }} onClick={() => this.handleSave()} title='Gửi đi' src='../icons/color/check.png' />
                        </div>
                        {/* } */}
                        {/* <div className="form-group">
                           
                            {Array.isArray(listNameItemsOpt) && listNameItemsOpt.length > 0 && (
                                <Select className='select-order-name' onChange={(selectedOption) => this.handleOptionSelect(selectedOption)} name='selectItemsName' placeholder="Chọn mặt hàng" options={listNameItemsOpt} />
                            )}
                        </div> */}
                        {/* <div className='form-group'>
                            <Select
                                className='select-order-name'
                                isMulti
                                onChange={this.handleSelectChange}
                                options={warehouseOptions}
                                value={selectedOptions}
                                placeholder="Chọn kho..."
                            />
                        </div> */}
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    <th ><i className='bx bxs-flag-checkered'></i></th>

                                    <th >Kho</th>
                                    <th >Tên hàng</th>
                                    <th >Ghi chú</th>
                                    <th >Đơn vị tính</th>
                                    <th >Số lượng</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Thành tiền (VND)</th>
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


                <div style={{ marginTop: '-30px' }} className='table-data'>

                    <div className='order'>

                        {newRowDataList.length !== 0 &&
                            <table className=''>
                                <thead>
                                    <tr>
                                        <th>Mã hàng</th>
                                        <th>Hàng tồn</th>
                                        <th>Số lượng đã đặt</th>
                                        <th>Số lượng tồn nhỏ nhất</th>
                                        <th>Số lượng tồn lớn nhất</th>
                                        <th>Đơn vị tính</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày tạo</th>
                                        <th>Ngày cập nhật</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isSelected &&
                                        this.showDataItemListApprove()

                                    }
                                </tbody>
                            </table>

                        }

                    </div>
                </div>

            </div>

        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        // rowIndex: state.allReducer.rowIndex,


    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getValueIndex: (action_rowIndex) => {
            dispatch(valueIndex(action_rowIndex))
        },




    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AddRequest)

