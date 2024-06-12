import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime.jsx';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';
import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
// import Select from 'react-select'
// import RequestInto from './RequestInto.jsx';
const getdataRequest = () => axios.get('/getRequestTransfer').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataNotification = () => axios.get('/getNotification').then((res) => res.data)

class RequestListNotApprove extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataRequestTeamp: [],
            dataMember: [],
            dataNotification: [],


            memberName: '',
            departmentApproveDate: '',
            idRequest: '',
            idRequestTeamp: '',
            idApproveReturn: '',
            idApproveDate: '',
            permission: '',
            userName: '',

            editingRowIndex: null, // Khởi tạo editingRowIndex là null hoặc một giá trị mặc định khác nếu cần
            editingColumnName: null, // Khởi tạo editingColumnName là null hoặc một giá trị mặc định khác nếu cần
            editingValue: '', // Khởi tạo editingValue là một chuỗi trống
            nonEditableColumns: [14], // Chỉ số của các cột có thể sửa 
            reasonMessage: '',


            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,


        }
        this.currentTodos = this.currentTodos.bind(this)

    }
    componentDidMount() {

        this._isMounted = true

        Promise.all([this.getData(), this.isBcryptPermission()]).then(() => {


        });

    }
    componentWillUnmount() {
        this._isMounted = false
    }
    async isBcryptPermission(dataListAccount) {
        const { tokenObj } = this.props;

        let permission = '';
        let userName = '';

        if (dataListAccount) {
            for (let value of dataListAccount) {
                if (tokenObj.id === value.id) {
                    const isPermission = await bcrypt.compare(value.accountPermission, tokenObj.accountPermission);
                    if (isPermission) {

                        permission = value.accountPermission;
                        userName = tokenObj.accountUserName;
                        break; // Không cần duyệt các phần tử khác nữa nếu đã tìm thấy quyền
                    }
                }
            }
        }
        if (this._isMounted) {
            this.setState({
                permission: permission,
                userName: userName,
            });
        }
    }








    currentTodos = (dataRequest) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataRequest.length;
        return dataRequest && dataRequest.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
    }




    getData = async () => {
        this._isMounted = true
        try {


            const [dataRequest, dataMember, dataNotification, dataListAccount] = await Promise.all([
                getdataRequest(),
                getdataMember(),
                getdataNotification(),

            ]);





            if (dataListAccount) {
                // Gọi hàm isBcryptPermission để xử lý quyền
                await this.isBcryptPermission(dataListAccount.rows);
            }
            const { tokenObj } = this.props || [];

            if (dataRequest) {
                if (this._isMounted) {
                    const filteredData = dataRequest.rows.filter(value => {

                        // const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
                        return value.requestTransferStatus === 'Chờ duyệt' && parseInt(value.requestTransferComplete) === 0
                    });
                    this.sortByDate(filteredData)

                }
            }

            if (dataMember) {

                dataMember.rows.map((value) => {

                    if (value.memberCode === tokenObj.accountCode) {
                        const isPermission = bcrypt.compareSync(value.memberPermission, tokenObj.accountPermission)
                        const memberName = value.memberName
                        const departmentApproveDate = value.memberDepartment
                        if (isPermission) {
                            if (this._isMounted) {
                                this.setState({
                                    permission: value.memberPermission,
                                    memberName: memberName,
                                    departmentApproveDate: departmentApproveDate
                                })
                            }

                        }
                    }

                    // const member = res.find(value => value.memberCode === tokenObj.accountCode);

                })

                let id = randomId();
                const isDuplicateitemCode = (id) => {
                    return dataMember.rows.some(item => item.id === id);
                };

                // Kiểm tra và tạo itemCode mới nếu trùng lặp
                while (isDuplicateitemCode(id)) {
                    id = randomId();
                }
                if (this._isMounted) {
                    this.setState({
                        dataMember: dataMember.rows,
                        idApproveReturn: id,
                        idApproveDate: id,

                    })
                }

            }

            if (dataNotification) {
                if (this._isMounted) {
                    this.setState({ dataNotification: dataNotification.rows })
                }
            }
            // Sau khi tất cả dữ liệu đã được cập nhật, gọi updateNewRowDataListFromDataSet
            // this.updateNewRowDataListFromDataSet();
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error occurred while fetching data:", error);
        }




    }

    // Hàm tìm chuỗi con giống nhau trong một chuỗi và một mảng các chuỗi
    findCommonSubstring = (str, arr) => {
        let commonSubstring = '';
        arr.forEach(substr => {
            if (str.includes(substr) && substr.length > commonSubstring.length) {
                commonSubstring = substr;
            }
        });
        return commonSubstring;
    };
    sortByDate = (dataRequest) => {
        const groupedData = {};
        let orderedGroups;
        dataRequest.forEach(item => {
            const key = item.requestDateCreated;
            if (!groupedData[key]) {
                groupedData[key] = [];
            }
            groupedData[key].push(item);
        });
        orderedGroups = Object.keys(groupedData).sort((a, b) => {
            // So sánh chuỗi bằng cách tìm chuỗi con giống nhau
            const commonSubstrA = this.findCommonSubstring(a, Object.keys(groupedData));
            const commonSubstrB = this.findCommonSubstring(b, Object.keys(groupedData));

            // Nếu có chuỗi con giống nhau, sắp xếp lại theo thứ tự chuỗi con đó
            if (commonSubstrA !== commonSubstrB) {
                return commonSubstrA.localeCompare(commonSubstrB);
            }

            // Nếu không có chuỗi con giống nhau, sắp xếp theo thứ tự bình thường
            return a.localeCompare(b);
        });
        // Kết hợp các nhóm đã sắp xếp lại thành một mảng duy nhất
        let sortedData = [];
        orderedGroups.forEach(key => {
            sortedData = sortedData.concat(groupedData[key]);
        });

        if (this._isMounted) {

            this.setState({
                // dataRequestTeamp: dataRequest,
                dataRequest: sortedData.reverse(),
                dataRequestTeamp: sortedData.reverse(),

                // totalPage: sortedData.length
            });
        }



    }
    checkPermissionApprove = (pointApprove, value) => {
        const { permission, departmentApproveDate, memberName, dataRequest } = this.state;
        if (permission === 'Thành viên kho' || permission === 'Thành viên thu mua' || permission === 'Lãnh đạo') {

            //  thành viên thu mua sẽ không thấy đơn trong mục này
            return true;
        } else if (permission === 'Thành viên' && value.requestTransferMaker === memberName &&
            value.requestTransferDepartment === departmentApproveDate) {
            //  thành viên sẽ thấy đơn của mình tạo , khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        }
        else if ((permission === 'Trưởng phòng' &&
            value.requestTransferDepartment === departmentApproveDate && parseInt(pointApprove[0]) === 0 && parseInt(pointApprove[1]) === 0)
        ) {

            //  trưởng phòng sẽ thấy đơn tạo của bộ phận mình , duyệt đơn
            return false;
        }
        else if (
            (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' && parseInt(pointApprove[0]) === 1 && parseInt(pointApprove[1]) === 0)
        ) {

            //  trưởng phòng sẽ thấy đơn tạo của bộ phận mình , duyệt đơn
            return false;
        }
        else if ((permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' && parseInt(pointApprove[0]) === 0 && parseInt(pointApprove[1]) === 0)
            && departmentApproveDate === value.requestTransferDepartment
        ) {
            //  trưởng phòng sẽ thấy đơn tạo của bộ phận mình , duyệt đơn
            return false;
        }
        else {

            return true;
        }
    }


    // Function to handle opening the modal
    openModal = (value, pointApprove) => {
        this.setState({ showModal: true, modalValue: value, modalPointApprove: pointApprove });
    }

    // Function to handle closing the modal
    closeModal = () => {
        this.setState({ showModal: false });
    }

    // Function to handle confirming and closing the modal
    handleConfirm = () => {
        const { modalValue, modalPointApprove } = this.state;
        // console.log(modalValue, 'value');

        // alert("Confirmed! Message: " + this.state.reasonMessage);
        this.handleUpdateApproveReturn(modalValue, modalPointApprove)
        this.closeModal();
    }

    // Function to handle input change in the textarea
    handleInputChange = (event) => {
        this.setState({ reasonMessage: event.target.value });
    }



    // pageination
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
    }


    // xử lý click double 
    handleDoubleClick = (rowIndex, columnName, value) => {
        if (value === null) {
            value = ''
        }
        // Cập nhật trạng thái khi double click vào ô
        this.setState({
            editingRowIndex: rowIndex,
            editingColumnName: columnName,
            editingValue: value
        });
        this.focusOnTextarea();
    };

    focusOnTextarea = () => {
        // Tìm thẻ textarea trong DOM và tập trung vào nó
        const textarea = document.querySelector('.editTextarea textarea');
        if (textarea) {
            textarea.focus();
        }
    }



    handleUpdateApproved = (value, pointApprove) => {
        const { dataApproveDate, departmentApproveDate, memberName, reasonMessage, idApproveDate, dataRequest, dataNotification } = this.state;
        // const permissionIndex = this.state.permissionMapping[this.state.permission];
        const { permission } = this.state;
        let amountApproved = '', notificationPointApprovedExport = 0
        let flagApprove = false, flagNotApprove = false;





        if (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' && parseInt(pointApprove[0]) === 1
        ) {
            pointApprove[1] = 1;
            notificationPointApprovedExport = 2

        }
        else if (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' && parseInt(pointApprove[0]) === 0
            && departmentApproveDate === value.requestTransferDepartment
        ) {
            pointApprove[0] = 1;
            pointApprove[1] = 1;
            notificationPointApprovedExport = 2

        }
        else if (permission === 'Trưởng phòng' && parseInt(pointApprove[0]) === 0 && departmentApproveDate !== 'Kế toán' &&
            departmentApproveDate === value.requestTransferDepartment) {
            //    duyệt đơn khác bộ phận kế toán nhưng duyệt chờ bộ phận khác duyệt trước pointApprove[1])===1
            pointApprove[0] = 1;
            notificationPointApprovedExport = 1
        }
        else {
            flagNotApprove = true;

        }




        // Kết thúc vòng lặp sau khi cập nhật điểm duyệt




        if (flagNotApprove) {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Người trước chưa duyệt!</i></div>);
        }
        else {

            const { id } = value;

            const idRequest = id;
            let requestTransferStatus = parseInt(pointApprove[1]) === 1 ? 'Đã duyệt' : 'Chờ duyệt'
            let requestTransferComplete = 0;
            if (requestTransferStatus === 'Đã duyệt') {
                requestTransferComplete = 1
            }
            const requestDateUpdate = UpdateDateTime()
            axios.post('/addApproveDateTransferExport', { id: idApproveDate, warehouseItemsCode: value.warehouseItemsCode, requestTransferDepartment: departmentApproveDate, requestTransferMaker: memberName, requestDateUpdate, idRequest })
                .catch(error => {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Duyệt đơn thất bại!</i></div>);
                });
            axios.post('/updateAppremovedRequestTransferExport', {
                id, requestTransferPointApprove: pointApprove.join(','), requestTransferAmountApproved: value.requestTransferAmountApproved,
                requestTransferStatus, requestDateUpdate, requestTransferReason: reasonMessage, requestTransferComplete,
            }).then((res) => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Duyệt đơn thành công!</i></div>);

                const dataNotifi = dataNotification.length > 0 && dataNotification.filter(item => item.idRequest === id) || []
                if (dataNotifi.length > 0) {

                    return axios.post('/updateNotificationPointInto', {
                        idRequest: dataNotifi[0].idRequest, status: requestTransferStatus, pointApprovedExport: notificationPointApprovedExport, isRead: 0, dateCreated: UpdateDateTime()
                    }).catch(error => {
                        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            <i>Duyệt đơn thất bại!</i></div>);
                    });
                }
                this.getData();
            }).catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Duyệt đơn thất bại!</i></div>);
            });
        }
    }

    handleUpdateApproveReturn = (value, pointApprove) => {
        const { dataApproveDate, departmentApproveDate, memberName, idApproveReturn, reasonMessage, dataNotification } = this.state;
        // const permissionIndex = this.state.permissionMapping[this.state.permission];
        // let flagApprove = false, flagNotApprove = false;
        const { permission } = this.state;


        if (permission === 'Trưởng phòng' && departmentApproveDate === value.requestTransferDepartment) {
            pointApprove[0] = -1;
        } else if (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán') {
            pointApprove[1] = -1;
        }

        //  if (flagApprove) {
        //     toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
        //         <i>Bạn đã duyệt đơn này rồi!</i></div>);
        // } 
        // else {
        const { id } = value;

        let requestTransferStatus = 'Từ chối'


        // const idApproveDate = idApprove
        const idRequest = id;
        const warehouseItemsCode = value.warehouseItemsCode;
        const requestDateUpdate = UpdateDateTime()

        axios.post('/addApproveDateTransferExport', { id: idApproveReturn, warehouseItemsCode, requestTransferDepartment: departmentApproveDate, requestTransferMaker: memberName, requestDateUpdate, idRequest })
        // axios.post('/updateAppe', { id: id, warehouseItemsCode, department: departmentApproveDate, orderApprove: memberName, dateUpdate, idRequest })

        axios.post('/updateAppremovedRequestTransferExport', {
            id, requestTransferPointApprove: pointApprove.join(','),
            requestTransferStatus, requestDateUpdate, requestTransferReason: reasonMessage, requestTransferComplete: 0
        }).then((res) => {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />

                <i>Duyệt trả đơn thành công!</i></div>);
            const dataNotifi = dataNotification.length > 0 && dataNotification.filter(item => item.idRequest === id) || []
            if (dataNotifi.length > 0) {

                return axios.post('/updateNotificationPointInto', {
                    idRequest: dataNotifi[0].idRequest, status: requestTransferStatus, pointApprovedExport: -1, isRead: 0, dateCreated: UpdateDateTime()
                }).catch(error => {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Duyệt đơn thất bại!</i></div>);
                });
            }
            this.getData();

        }).catch(error => {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Duyệt trả đơn thất bại!</i></div>);
        });
        // }
    }

    arrayApproveted = (approveted, pointApprove) => {
        const pushArrayApprove = [];
        if (approveted && pointApprove) {
            for (let i = 0; i < approveted.length; i++) {

                pushArrayApprove.push(
                    <div key={i} className={parseInt(pointApprove[i]) === 1 ? 'approve-request backgournd-approve col-md-2' : 'approve-request col-md-2'}>{approveted[i]}</div>
                )
            }
        }
        return pushArrayApprove;
    }


    // rule
    handleKeyPress = (event) => {
        const keyCode = event.keyCode || event.which;
        const allowedCharacters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        if (!allowedCharacters.includes(String.fromCharCode(keyCode))) {
            event.preventDefault();
        }
    }


    calculateIntoMoney = (requestTransferAmountApproved, requestTransferUnitPrice) => {
        return parseFloat(requestTransferAmountApproved) * parseFloat(requestTransferUnitPrice);
    };

    handleChange = (event, rowIndex, columnName) => {
        const { dataRequest } = this.state;
        const newValue = event.target.value;

        // Cập nhật giá trị mới cho cột tương ứng
        const newDataRequest = dataRequest.map((row, index) => {
            if (index === rowIndex) {
                return { ...row, [columnName]: newValue };
            }
            return row;
        });
        // Tính toán giá trị mới cho cột intoMoney
        if (columnName === 'requestTransferAmountApproved') {
            const updatedDataRequest = newDataRequest.map((row, index) => {
                if (index === rowIndex) {
                    const requestTransferIntoMoney = this.calculateIntoMoney(row.requestTransferAmountApproved, row.requestTransferUnitPrice);

                    return { ...row, requestTransferIntoMoney };
                }
                return row;
            });
            this.setState({ dataRequest: updatedDataRequest, editingValue: newValue });
        } else {
            this.setState({ dataRequest: newDataRequest, editingValue: newValue });
        }

    };
    handleSave = () => {
        const { editingValue, editingRowIndex, editingColumnName, dataRequest } = this.state;
        if (editingColumnName === 'requestTransferAmountApproved' && editingValue === '') {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Số lượng duyệt không được để trống!</i></div>);
            return;
        }

        const newData = [...dataRequest]

        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        if (rowData) {
            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
            const pushDataRequest = [];
            newData.map((value) => {
                if (idUpdate === value.id) {
                    pushDataRequest.push(value)
                }
            })

            this.setState({
                dataRequest: pushDataRequest,
                editingRowIndex: null,
                editingColumnName: null,
                editingValue: '',
            })
        }
    };


    handleKeyDown = event => {

        if (event.key === 'Enter') {
            this.handleSave();
        } else if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {

            this.handleCancelEdit();

        }
    };
    handleCancelEdit = (requestTransferAmount) => {
        let { editingValue, editingColumnName, dataRequestTeamp, editingRowIndex } = this.state;
        editingValue = requestTransferAmount
        const newData = [...dataRequestTeamp]

        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        if (rowData) {
            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
            const pushDataRequest = [];
            newData.map((value) => {
                if (idUpdate === value.id) {
                    pushDataRequest.push(value)
                }
            })
            this.setState({
                dataRequest: pushDataRequest,
                editingRowIndex: null,
                editingColumnName: null,
                editingValue: '',
            })
        }

    };
    showFormRow = () => {

        const { permission, editingRowIndex, editingColumnName, editingValue, nonEditableColumns, dataRequest } = this.state;

        if (dataRequest) {

            const filteredData = dataRequest.filter(value => {
                const pointApprove = value.requestTransferPointApprove !== null ? value.requestTransferPointApprove.split(',') : '';
                return !this.checkPermissionApprove(pointApprove, value)
            });
            const currentTodos = this.currentTodos(filteredData)


            return currentTodos.map((row, rowIndex) => {

                return (
                    <tr key={rowIndex}>
                        {Object.entries(row).map(([columnName, cellValue], colIndex) => {

                            if (columnName === 'warehouseCode' || columnName === 'id' || columnName === 'warehouseItemsCode' ||
                                columnName === 'requestTransferPointApprove' || columnName === 'requestTransferDepartment' ||
                                columnName === 'requestTransferNotes' || columnName === 'requestTransferAmountExport' ||
                                columnName === 'requestTransferWarehouseResidual' || columnName === 'requestDateVouchers' ||
                                columnName === 'requestTransferReason' || columnName === 'requestTransferPending' || columnName === 'requestIdHistory' ||
                                columnName === 'requestTransferComplete' || columnName === 'requestTransferTotalAmountExport'

                            ) {
                                return null; // Bỏ qua cột không cần thiết
                            } else {
                                return (
                                    <td
                                        key={columnName}
                                        onDoubleClick={() => this.handleDoubleClick(rowIndex, columnName, cellValue)}
                                    >
                                        {permission === 'Trưởng phòng' && editingRowIndex === rowIndex && editingColumnName === columnName && nonEditableColumns.includes(colIndex) ? (

                                            <div className="editTextarea">
                                                <textarea
                                                    value={editingValue}
                                                    onChange={(e) => this.handleChange(e, rowIndex, columnName)}
                                                    onKeyDown={this.handleKeyDown}
                                                    onKeyPress={this.handleKeyPress}

                                                />
                                                {editingValue.length === 0 || (editingRowIndex === rowIndex && editingColumnName === columnName) ? (
                                                    <div>
                                                        <i onClick={this.handleSave} className="bx bx-send" title="Lưu" />
                                                        <i onClick={() => this.handleCancelEdit(row.requestTransferAmount)} className="bx bxs-message-square-x" title="Hủy bỏ" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        )

                                            : columnName === 'requestTransferApprove' ? ( // Kiểm tra nếu columnName là 'orderApprove'
                                                <div style={{ display: 'inline-flex' }}>
                                                    {this.arrayApproveted(cellValue.split(','), row.requestTransferPointApprove.split(','))}
                                                </div>
                                            )
                                                : columnName === 'requestTransferStatus' ? ( // Kiểm tra nếu columnName là 'statusOrder'
                                                    <span className={cellValue === 'Chờ duyệt' ? 'statusYellow' : cellValue === 'Đã duyệt' ? 'statusGreen' : 'statusRed'}>
                                                        {cellValue}
                                                    </span>
                                                )
                                                    : columnName === 'requestTransferIntoMoney' ? (
                                                        // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                        <span>
                                                            {parseFloat(row.requestTransferIntoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                        </span>
                                                    )
                                                        : columnName === 'requestTransferAmount' ? (
                                                            // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                            <span>
                                                                {parseFloat(row.requestTransferAmount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                            </span>
                                                        )
                                                            : columnName === 'requestTransferAmountApproved' ? (
                                                                // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                                <span>
                                                                    {parseFloat(row.requestTransferAmountApproved).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                </span>
                                                            )
                                                                : columnName === 'requestTransferUnitPrice' ? (
                                                                    // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                                    <span>
                                                                        {parseFloat(row.requestTransferUnitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                    </span>
                                                                )
                                                                    : (
                                                                        <span>{cellValue}</span>
                                                                    )}
                                    </td>
                                );
                            }
                        })}
                        {this.renderActions(row, rowIndex)}
                    </tr>
                );
            });
        }
    }

    renderActions = (row, rowIndex) => {
        const { permission } = this.state;
        const approveted = row.requestTransferApprove !== null ? row.requestTransferApprove.split(',') : '';
        const pointApprove = row.requestTransferPointApprove !== null ? row.requestTransferPointApprove.split(',') : '';
        const isMemberOrLeader = permission === 'Trưởng phòng';

        if (isMemberOrLeader) {
            return (
                <td>
                    <div id='popup'>
                        {/* Modal */}
                        {this.state.showModal && (
                            <div id="confirmModal" className="modal">
                                <div className="modal-content">
                                    <span className="close" onClick={this.closeModal}>&times;</span>
                                    <h2>Lý do</h2>
                                    <p>Có thể để trống phần này gửi đi!</p>
                                    <textarea
                                        value={this.state.reasonMessage}
                                        onChange={this.handleInputChange}
                                        placeholder="Điền lý do vào mục này..."
                                    />
                                    <div className="button-container">
                                        <button onClick={this.closeModal}>Hủy bỏ</button>
                                        <button onClick={() => this.handleConfirm()}>Gửi đi</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <img onClick={() => this.handleUpdateApproved(row, pointApprove, rowIndex)} title='Đồng ý duyệt' src='../icons/color/check.png' />
                            <img onClick={() => this.openModal(row, pointApprove)} title='Từ chối duyệt' src='../icons/color/remove.png' />
                        </div>
                    </div>
                </td>
            )
        }

    };

    render() {
        const { permission } = this.state;
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        {/* <RequestInto/> */}
                    </div>
                    <div className="head">
                        <h3>Danh mục xuất đơn chưa duyệt</h3>

                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr className={permission !== 'Trưởng phòng' ? 'approve-action' : ''}>


                                    {/* <th><i className='bx bxs-flag-checkered'></i></th> */}
                                    <th >Từ Kho</th>
                                    <th >Đến Kho</th>
                                    <th >Người tạo</th>
                                    <th >Người duyệt</th>
                                    <th >Tên hàng</th>
                                    <th >Đơn vị tính</th>
                                    <th >Số lượng</th>
                                    <th >Số lượng được duyệt</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Thành tiền (VND)</th>
                                    <th >Trạng thái</th>
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                    {permission === 'Trưởng phòng' &&

                                        <th >Hành động</th>
                                    }



                                </tr>
                            </thead>
                            <tbody>


                                {this.showFormRow()}


                            </tbody>
                        </table>
                    </div>
                    <div className="pagination">

                        <Pagination
                            activePage={this.state.currentPage}
                            itemsCountPerPage={this.state.newsPerPage}
                            totalItemsCount={
                                this.state.dataRequest.length !== 0
                                    ? this.state.totalPage
                                    : 0
                            }
                            pageRangeDisplayed={5} // show page
                            // firstPageText ={'Đầu'}
                            onChange={this.handlePageChange.bind(this)}
                        />

                    </div>

                </div>

            </div >
        );
    }
}

export default RequestListNotApprove;