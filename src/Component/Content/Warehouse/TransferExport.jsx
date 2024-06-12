import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime.jsx';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';
import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// import { connect } from 'react-redux';
import jsPDF from 'jspdf';
// import Select from 'react-select'
// import RequestInto from './RequestInto.jsx';
const getdataRequest = () => axios.get('/getRequestTransfer').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)

const fontName = 'arial';
const fontFile = '../font/arial.ttf'; // Đường dẫn đến tập tin font chữ
const fontEncoding = 'Unicode'; // Bảng mã của font chữ

class TransferExport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataRequestTeamp: [],
            dataMember: [],

            memberName: '',
            departmentApproveDate: '',

            idHistory: '',
            permission: '',
            userName: '',

            editingRowIndex: null, // Khởi tạo editingRowIndex là null hoặc một giá trị mặc định khác nếu cần
            editingColumnName: null, // Khởi tạo editingColumnName là null hoặc một giá trị mặc định khác nếu cần
            editingValue: '', // Khởi tạo editingValue là một chuỗi trống
            nonEditableColumns: [15], // Chỉ số của các cột có thể sửa 
            reasonMessage: '',
            checkedIds: [],
            selectedDate: new Date(),
            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,

            sortOrder: 'asc', // Thứ tự sắp xếp: 'asc' (tăng dần) hoặc 'desc' (giảm dần)

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
        this._isMounted = true
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


            const [dataRequest, dataMember, dataListAccount] = await Promise.all([
                getdataRequest(),
                getdataMember(),


            ]);


            if (dataListAccount) {
                // Gọi hàm isBcryptPermission để xử lý quyền
                await this.isBcryptPermission(dataListAccount.rows);
            }
            const { tokenObj } = this.props || [];

            if (dataRequest) {
                if (this._isMounted) {

                    let id = randomId();
                    let countId = 0;
                    const isDuplicateitemCode = (id) => {

                        return dataRequest.rows.some(item => item.idHistory === id);
                    };

                    // Kiểm tra và tạo itemCode mới nếu trùng lặp
                    while (isDuplicateitemCode(id) && countId < 20) {

                        countId++;
                        id = randomId();
                    }
                    this.setState({
                        idHistory: id,

                    })

                    const filteredData = dataRequest.rows.filter(value => {

                        // const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
                        return value.requestTransferStatus === 'Đã duyệt' && parseInt(value.requestTransferComplete) === 2 &&
                            parseInt(value.requestTransferTotalAmountExport === null ? 0 : value.requestTransferTotalAmountExport) < parseInt(value.requestTransferAmountApproved)
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


                if (this._isMounted) {
                    this.setState({
                        dataMember: dataMember.rows,
                    })
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
        orderedGroups = Object.keys(groupedData).sort((b, a) => {
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
                dataRequest: sortedData,
                dataRequestTeamp: sortedData,

                // totalPage: sortedData.length
            });
        }



    }



    // sort by
    handleHeaderClick = (columnName) => {
        let { dataRequest, dataRequestTeamp, sortOrder } = this.state;
        // let { isDataSearch } = this.props

        // const { dataSearchValue } = this.props || []
        // if (isDataSearch) {
        //     dataRequestTeamp = dataSearchValue
        //     dataRequest = dataSearchValue
        // }

        // Nhóm các phần tử theo giá trị của cột columnName
        const groupedData = {};
        let orderedGroups;
        dataRequest.forEach(item => {
            const key = item[columnName];
            if (!groupedData[key]) {
                groupedData[key] = [];
            }
            groupedData[key].push(item);
        });
        if (columnName !== 'requestTransferAmount' && columnName !== 'requestTransferAmountApproved' && columnName !== 'requestTransferTotalAmountExport' &&
            columnName !== 'requestTransferAmountExport' && columnName !== 'requestTransferWarehouseResidual' && columnName !== 'requestTransferUnitPrice' &&
            columnName !== 'requestTransferIntoMoney'
        ) {

            // Sắp xếp các nhóm theo thứ tự bạn mong muốn
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


        } else {

            // Sắp xếp các nhóm theo thứ tự bạn mong muốn (ở đây là đảo ngược giá trị của key)
            orderedGroups = Object.keys(groupedData).sort((a, b) => parseInt(b) - parseInt(a));

        }

        // Kết hợp các nhóm đã sắp xếp lại thành một mảng duy nhất
        let sortedData = [];
        orderedGroups.forEach(key => {
            sortedData = sortedData.concat(groupedData[key]);
        });

        if (sortOrder === 'asc') {

            this.setState({
                dataRequestTeamp: dataRequest,
                dataRequest: sortedData,
                isSort: true,
                sortOrder: 'desc', // Đảo ngược sắp xếp mỗi khi click để giữ cho cụm có thứ tự giảm dần
            });
        } else {
            this.setState({
                dataRequest: dataRequestTeamp,
                sortOrder: 'asc',
                isSort: true
            })
        }
        // this.props.is_DataSearch(false)
    };



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


    calculateIntoMoney = (requestTransferAmountExport, requestTransferUnitPrice) => {
        return parseFloat(requestTransferAmountExport) * parseFloat(requestTransferUnitPrice);
    };


    handleChange = (isValue, rowIndex, columnName) => {
        const { dataRequest } = this.state;

        // Kiểm tra nếu newValue là kiểu Date
        const newValue = isValue instanceof Date ? UpdateDateTime(isValue) : isValue === null ? null : isValue.target.value; // Lấy giá trị ngày từ sự kiện hoặc từ trường nhập


        // Cập nhật giá trị mới cho cột tương ứng
        const newDataRequest = dataRequest.map((row, index) => {
            if (index === rowIndex) {
                return { ...row, [columnName]: newValue };
            }
            return row;
        });
        // Tính toán giá trị mới cho cột intoMoney
        if (columnName === 'requestTransferAmountExport') {
            const updatedDataRequest = newDataRequest.map((row, index) => {
                if (index === rowIndex) {
                    const requestTransferIntoMoney = this.calculateIntoMoney(row.requestTransferAmountExport, row.requestTransferUnitPrice);

                    return { ...row, requestTransferIntoMoney };
                }
                return row;
            });

            this.setState({ dataRequest: updatedDataRequest, editingValue: newValue });
        } else {

            this.setState({ dataRequest: newDataRequest, editingValue: newValue, selectedDate: isValue });
        }

    };
    // // select id ,chọn nhiều id 
    // handleCheckboxChange = (id) => {
    //     const { checkedIds } = this.state;
    //     const index = checkedIds.indexOf(id);
    //     if (index === -1) {
    //         this.setState(prevState => ({
    //             checkedIds: [...prevState.checkedIds, id]
    //         }));
    //     } else {
    //         this.setState(prevState => ({
    //             checkedIds: prevState.checkedIds.filter(itemId => itemId !== id)
    //         }));
    //     }
    // }

    // isChecked = (id) => {
    //     const { checkedIds } = this.state;
    //     return checkedIds.includes(id);
    // }


    handleSave = () => {
        const { editingValue, editingRowIndex, editingColumnName, dataRequest, dataRequestTeamp } = this.state;


        const newData = [...dataRequest]
        const newDataTeamp = [...dataRequestTeamp]
        const rowDataTeamp = newDataTeamp[editingRowIndex];
        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        let requestTransferTotalAmountExport = rowDataTeamp.requestTransferTotalAmountExport || 0;
        requestTransferTotalAmountExport = requestTransferTotalAmountExport === null || isNaN(requestTransferTotalAmountExport) ? 0 : requestTransferTotalAmountExport

        if (rowData) {
            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            rowData['requestTransferTotalAmountExport'] = (editingValue === '' || isNaN(editingValue)) ? requestTransferTotalAmountExport
                : parseInt(requestTransferTotalAmountExport) + parseInt(editingValue); // cập nhật giá trị vào cột  
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
    handleCancelEdit = (requestTransferAmountExport) => {
        let { editingValue, editingColumnName, dataRequestTeamp, editingRowIndex } = this.state;
        const newData = [...dataRequestTeamp]

        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        editingValue = rowData[editingColumnName]
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


    handleCheckboxChange = (id) => {
        const { checkedIds } = this.state;
        const index = checkedIds.indexOf(id);
        if (index === -1) {
            this.setState(prevState => ({
                checkedIds: [...prevState.checkedIds, id]
            }));
        } else {
            this.setState(prevState => ({
                checkedIds: prevState.checkedIds.filter(itemId => itemId !== id)
            }));
        }
    }

    isChecked = (id) => {
        const { checkedIds } = this.state;
        return checkedIds.includes(id);
    }

    showFormRow = () => {

        const { permission, editingRowIndex, editingColumnName, editingValue, nonEditableColumns, dataRequest, selectedDate } = this.state;

        if (dataRequest) {


            const currentTodos = this.currentTodos(dataRequest)


            return currentTodos.map((row, rowIndex) => {

                return (
                    <tr key={rowIndex}>
                        <td>
                            <input
                                onClick={() => this.handleCheckboxChange(row.id)}
                                onChange={() => { }}
                                checked={this.isChecked(row.id)}  // Sử dụng hàm isChecked để kiểm tra trạng thái checkbox
                                style={{ cursor: 'pointer' }}
                                type="checkbox"
                                name=""
                                id=""
                                title='tích chọn dòng cần in PDF'
                            />
                        </td>
                        {Object.entries(row).map(([columnName, cellValue], colIndex) => {

                            if (columnName === 'warehouseCode' || columnName === 'id' || columnName === 'warehouseItemsCode' ||
                                columnName === 'requestTransferPointApprove' || columnName === 'requestTransferDepartment' ||
                                columnName === 'requestTransferNotes' || columnName === 'requestTransferMaker' ||
                                columnName === 'requestTransferApprove' || columnName === 'requestTransferStatus' ||
                                columnName === 'requestTransferReason' || columnName === 'requestIdHistory' || columnName === 'requestTransferPending' ||
                                columnName === 'requestTransferComplete' || columnName === 'requestDateUpdate' || columnName === 'requestTransferAmount'

                            ) {
                                return null; // Bỏ qua cột không cần thiết
                            } else {
                                return (

                                    <td
                                        key={columnName}
                                        onDoubleClick={() => this.handleDoubleClick(rowIndex, columnName, cellValue)}
                                    >
                                        {permission === 'Thành viên kho' && editingRowIndex === rowIndex && editingColumnName === columnName
                                            && columnName !== 'requestDateVouchers' && nonEditableColumns.includes(colIndex) ? (

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
                                                        <i onClick={() => this.handleCancelEdit(row.requestTransferAmountExport)} className="bx bxs-message-square-x" title="Hủy bỏ" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        )


                                            : columnName === 'requestTransferIntoMoney' ? (
                                                // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                <span>
                                                    {parseFloat(row.requestTransferIntoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                </span>
                                            )
                                                : columnName === 'requestTransferTotalAmountExport' ? (
                                                    // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                    <span>
                                                        {row.requestTransferTotalAmountExport !== null && parseFloat(row.requestTransferTotalAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                    </span>
                                                )
                                                    : columnName === 'requestTransferAmountExport' ? (
                                                        // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                        <span>
                                                            {row.requestTransferAmountExport !== null && parseFloat(row.requestTransferAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                        </span>
                                                    )
                                                        : columnName === 'requestTransferWarehouseResidual' ? (
                                                            // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                            <span>
                                                                {row.requestTransferWarehouseResidual !== null ? parseFloat(row.requestTransferWarehouseResidual).toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0}
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
                                                                    : columnName === 'requestDateVouchers' ? (
                                                                        // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                                        <div className='datepicker'>


                                                                            <DatePicker
                                                                                id="datepicker"
                                                                                selected={selectedDate}
                                                                                onChange={(e) => this.handleChange(e, rowIndex, columnName)}
                                                                                dateFormat="dd/MM/yyyy" // Định dạng ngày tháng

                                                                            />
                                                                        </div>
                                                                    )
                                                                        : (
                                                                            <span>{cellValue}</span>
                                                                        )}
                                    </td>
                                );
                            }
                        })}

                    </tr>
                );
            });
        }
    }

    handleExportPDF = () => {
        const { checkedIds, dataRequest, idHistory, dataNotification } = this.state;
        // Lọc ra các phần tử có idRequest tương ứng với giá trị mong muốn

        if (checkedIds.length === 0) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Chọn ít nhất một dòng để xuất file PDF!</i></div>)
            return;
        }
        const dateUpdate = UpdateDateTime()

        // cập nhật ngày hiện tại in 
        const dataRequestIds = dataRequest.filter(row => checkedIds.includes(row.id));
        // Gán giá trị idHistory cho các phần tử được lọc

        const dataRequestExportPDF = dataRequestIds.map(row => {
            let requestTransferPending = row.requestTransferPending === null ? 0 : row.requestTransferPending
            if (parseInt(requestTransferPending) !== 1) {
                if (checkedIds.includes(row.id)) {
                    return { ...row, idHistory: idHistory };
                }
            }

            return row;
        });


        dataRequestExportPDF.forEach(row => {
            row.requestDateUpdate = dateUpdate
        })
        // const pdf = new jsPDF();
        // kiểm tra nhà cung cấp có chưa


        // Tính tổng của requestTransferIntoMoney
        const totalRequestTransferIntoMoney = dataRequestExportPDF.reduce((total, row) => {
            return total + parseFloat(row.requestTransferIntoMoney);
        }, 0);
        // Tạo một mảng chứa các dòng dữ liệu cho bảng


        const data = dataRequestExportPDF.length !== 0 && dataRequestExportPDF.map(row => {
            return [

                row.requestTransferFromWarehouse,
                row.requestTransferToWarehouse,
                row.requestTransferItemsName,
                row.requestTransferUnit,
                row.warehouseItemsCode,
                parseFloat(row.requestTransferAmountApproved).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                parseFloat(row.requestTransferTotalAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                parseFloat(row.requestTransferAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                parseFloat(row.requestTransferUnitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                parseFloat(row.requestTransferIntoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 }),

                // của số lượng xuất để trống là ______
            ] || []
        });





        // Thêm font vào tài liệu PDF (nếu cần)
        const fontSize = 8; // Đặt kích thước chữ
        // Sử dụng kích thước của giấy A4
        const pageWidth = 300; // Chiều rộng của giấy A4
        const pageHeight = 357; // Chiều cao của giấy A4

        // Tạo một đối tượng PDF mới với kích thước giấy A4
        const pdf = new jsPDF({
            orientation: 'portrait', // Chiều cao lớn hơn chiều rộng (portrait)
            unit: 'mm', // Đơn vị là millimet
            format: [pageWidth, pageHeight] // Kích thước trang giấy A4
            // format: 'a4' // Kích thước trang giấy A4
        });
        pdf.addFont(fontFile, fontName, fontEncoding);

        // Sử dụng font đã thêm vào khi vẽ text
        pdf.setFont(fontName); // Đặt font cho văn bản là font đã thêm vào
        // Tiêu đề
        pdf.text('Transfer From Requisition tiêu đề', pageWidth / 2, 30, { align: 'center' });



        pdf.setFontSize(16);

        // Thiết lập màu nền cho các ô trong body của bảng
        pdf.setFillColor(255, 255, 255); // Đặt màu nền là màu trắng (hoặc màu khác tùy ý)
        const ids = dataRequestExportPDF.map(row => row.id);
        const requestTransferMaker = dataRequestExportPDF.map(row => row.requestTransferMaker);
        const requestDateVouchers = dataRequestExportPDF.map(row => row.requestDateVouchers);

        // console.log(requestTransferMaker, 'requestTransferMaker');
        // console.log(ids, 'ids');
        // Đường dẫn của hình ảnh
        const imagePath = '../icons/color/pdf-file.png';

        // Thiết lập vị trí và kích thước của hình ảnh
        const imageX = 20; // Vị trí X
        const imageY = 20; // Vị trí Y
        const imageWidth = 10; // Chiều rộng
        const imageHeight = 10; // Chiều cao

        // Thêm hình ảnh vào tài liệu PDF
        pdf.addImage(imagePath, 'PNG', imageX, imageY, imageWidth, imageHeight);

        // Vẽ border tròn cho hình ảnh
        // pdf.circle(imageX + imageWidth / 2, imageY + imageHeight / 2, imageWidth / 2);
        // pdf.setLineWidth(1);
        // pdf.stroke();


        // Thiết lập bảng tiêu đề
        const tableOptionsTitle = {
            startY: 40,
            body: [

                ['Chuyển ID', ids[0], '', '', '', 'Ghi Chú', '', '', '', '', 'Người In', requestTransferMaker[0]],
                ['Ngày Chuyển', requestDateVouchers[0] || dateUpdate, '', '', '', '', '', '', '', '', 'Ngày In', dateUpdate]
            ],
            margin: { top: 20, left: 5, right: 5 },
            styles: { font: fontName, fontSize: fontSize },
            headStyles: {
                fontStyle: 'bold',
                halign: 'center',
                textColor: [0, 0, 0], // Màu chữ (đen)
                // lineWidth: 1, // Độ dày của border
                lineColor: [205, 205, 205] // Màu của border
            },

            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 40 },
                2: { cellWidth: 10 },
                3: { cellWidth: 20 },
                4: { cellWidth: 10 },
                5: { cellWidth: 60 },
                6: { cellWidth: 10 },
                7: { cellWidth: 10 },
                8: { cellWidth: 10 }, // Thêm định dạng chiều rộng cho cột 8
                9: { cellWidth: 10 }, // Thêm định dạng chiều rộng cho cột 9
                10: { cellWidth: 30 }, // Thêm định dạng chiều rộng cho cột 10
                11: { cellWidth: 50 } // Thêm định dạng chiều rộng cho cột 11
                // 5: { cellWidth: 200 }
            },

        };



        // Thiết lập border cho toàn bộ bảng
        pdf.autoTable(tableOptionsTitle);
        pdf.setFillColor(255, 255, 255); // Đặt màu nền là màu trắng (hoặc màu khác tùy ý)

        pdf.setLineWidth(1); // Độ dày của border top
        pdf.setDrawColor(205, 205, 205); // Màu của border top
        pdf.line(5, 59.5, pageWidth - 5, 59.5); // Vẽ border top từ (5, 80) đến (560, 80)
        pdf.line(5, 40, pageWidth - 5, 40); // Vẽ border top từ (5, 80) đến (560, 80)


        // Thêm một dòng trống
        // pdf.text('', 10, 150);




        // Thêm hàng mới chứa tổng thành tiền vào body của bảng
        const totalRow = ['', '', '', '', '', '', '', '', 'Tổng', totalRequestTransferIntoMoney.toLocaleString('en-US', { maximumFractionDigits: 0 })];
        data.push(totalRow);

        const tableOptions = {
            startY: 60,

            head: [
                // [dataRequestExportPDF[0].requestTransferFromWarehouse, '', '', '', '', ''], // Thêm một cột mới ở đầu tiên
                ['Từ kho', 'Đến kho', 'Tên hàng', 'Đơn vị tính', 'Mã hàng', 'Số lượng duyệt', 'Tổng số lượng xuất', 'Số lượng xuất', 'Đơn giá', 'Thành tiền']
            ],
            body: [
                // [dataRequestExportPDF[0].requestTransferFromWarehouse || '', '', '', '', '', ''], // Dòng chứa requestTransferFromWarehouse
                ...data, // Dữ liệu từ dataRequestExportPDF


            ],
            margin: { top: 20, left: 5, right: 5 },
            styles: { font: fontName, fontSize: fontSize }, // Sử dụng font đã tải và kích thước chữ đã đặt
            encoding: fontEncoding, // Sử dụng encoding mặc định
            columnStyles: {
                0: { cellWidth: 30, halign: 'center' },
                1: { cellWidth: 40, halign: 'center', },
                2: { cellWidth: 60, halign: 'center', },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 30, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' },
                6: { cellWidth: 20, halign: 'center' },
                7: { cellWidth: 20, halign: 'center' },
                8: { cellWidth: 20, halign: 'center' },
                9: { cellWidth: 30, halign: 'center' },



            },
            autoSize: 'wrap',
            headStyles: {
                // fontStyle: 'bold', // Chữ in đậm
                halign: 'center' // Căn giữa
            },
            rowHeight: 40, // Điều chỉnh chiều cao của các hàng trong bảng

        };


        const lineWidth = 2; // Độ dày của đường kẻ
        const fontSizeTextValue = 12; // Kích thước chữ
        pdf.setFontSize(fontSizeTextValue);
        // const text1 = "nguoi duyet 1";
        // const text2 = "nguoi duyet 2";
        // // Tính toán kích thước của từng đoạn văn bản
        // const text1Width = pdf.getStringUnitWidth(text1) * fontSizeTextValue / pdf.internal.scaleFactor;
        // const text2Width = pdf.getStringUnitWidth(text2);

        // // Tính toán vị trí của đoạn văn bản thứ nhất
        // const text1X = tableOptions.margin.left + 50; // Cách bên trái 100 điểm
        // const text1Y = pageHeight-50; // Cách bên trên 200 điểm
        // // const text1Y = tableOptions.startY + tableOptions.rowHeight * data.length + 400; // Cách bên trên 200 điểm

        // // Thêm văn bản thứ nhất vào tài liệu PDF

        // pdf.text(text1, text1X, text1Y);

        // // Tính toán vị trí của đoạn văn bản thứ hai để đặt cạnh đoạn văn bản thứ nhất
        // const text2X = text1X + text2Width + 150; // Cách bên trái 100 điểm so với văn bản thứ nhất
        // const text2Y = text1Y; // Giữ cùng một vị trí Y

        // // Thêm văn bản thứ hai vào tài liệu PDF
        // pdf.text(text2, text2X, text2Y);

        const text3 = "_________";
        const text4 = "_________";


        // Tính toán kích thước của từng đoạn văn bản
        const text3Width = pdf.getStringUnitWidth(text3) * fontSizeTextValue / pdf.internal.scaleFactor;
        const text4Width = pdf.getStringUnitWidth(text4);

        // Tính toán vị trí của đoạn văn bản thứ ba
        const text3X = tableOptions.margin.left + 50; // Cách bên trái 100 điểm
        const text3Y = pageHeight - 48; // Cách trên 100 điểm so với văn bản thứ nhất
        // const text3Y = tableOptions.startY + tableOptions.rowHeight * data.length + 405; // Cách trên 100 điểm so với văn bản thứ nhất
        // Vẽ đường kẻ dưới văn bản thứ ba
        pdf.setLineWidth(lineWidth); // Độ dày của đường kẻ
        // pdf.line(text3X, text3Y + 2, text3X + text3Width, text3Y + 2); // Vẽ đường kẻ dưới văn bản thứ ba

        // Thêm văn bản thứ ba vào tài liệu PDF
        pdf.text(text3, text3X, text3Y);

        // Tính toán vị trí của đoạn văn bản thứ tư để đặt cạnh đoạn văn bản thứ hai
        const text4X = text3X + text4Width + 150; // Cách bên trái 400 điểm so với văn bản thứ ba
        const text4Y = text3Y; // Giữ cùng một vị trí Y với văn bản thứ ba
        // Vẽ đường kẻ dưới văn bản thứ tư
        pdf.setLineWidth(lineWidth); // Độ dày của đường kẻ
        // pdf.line(text4X, text4Y + 2, text4X + text4Width, text4Y + 2);
        // Thêm văn bản thứ tư vào tài liệu PDF
        pdf.text(text4, text4X, text4Y);

        const text5 = "Xuất bởi";
        const text6 = "Duyệt bởi";


        // Tính toán kích thước của từng đoạn văn bản
        const text5Width = pdf.getStringUnitWidth(text3) * fontSizeTextValue / pdf.internal.scaleFactor;
        const text6Width = pdf.getStringUnitWidth(text4);

        // Tính toán vị trí của đoạn văn bản thứ ba
        const text5X = tableOptions.margin.left + 50; // Cách bên trái 100 điểm
        const text5Y = pageHeight - 42; // Cách trên 100 điểm so với văn bản thứ nhất
        // const text5Y = tableOptions.startY + tableOptions.rowHeight * data.length + 420; // Cách trên 100 điểm so với văn bản thứ nhất

        // Thêm văn bản thứ ba vào tài liệu PDF
        pdf.text(text5, text5X, text5Y);

        // Tính toán vị trí của đoạn văn bản thứ tư để đặt cạnh đoạn văn bản thứ hai
        const text6X = text5X + text6Width + 150; // Cách bên trái 400 điểm so với văn bản thứ ba
        const text6Y = text5Y; // Giữ cùng một vị trí Y với văn bản thứ ba

        // Thêm văn bản thứ tư vào tài liệu PDF
        pdf.text(text6, text6X, text6Y);
        pdf.setLineWidth(lineWidth); // Độ dày của đường kẻ


        // Vẽ bảng vào PDF
        pdf.autoTable(tableOptions);
        // pending status


        let flagRequestTransferWarehouseResidual = false;
        dataRequestExportPDF.forEach(item => {
            let requestTransferWarehouseResidual = parseInt(item.requestTransferWarehouseResidual)
            let requestTransferAmountExport = parseInt(item.requestTransferAmountExport)
            if (requestTransferWarehouseResidual - requestTransferAmountExport >= 0) {
                item.requestTransferWarehouseResidual = requestTransferWarehouseResidual - requestTransferAmountExport
            } else {

                flagRequestTransferWarehouseResidual = true
                return
            }
        })
        if (flagRequestTransferWarehouseResidual) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Số lượng xuất vượt mứt số lượng tồn hoặc đang bỏ trống!</i></div>)
            return
        } else {
            // lọc data pending là 1 (là những mặt hàng xuất thiếu không đủ yêu cầu nên lưu lại)
            const dataPending = dataRequestExportPDF.filter(item => parseInt(item.requestTransferPending) === 1) || []
            const newCheckedIds = []; // Mảng mới để lưu các id không trùng

            if (dataPending.length > 0) {
                dataPending.forEach(item => {
                    // Kiểm tra nếu checkedIds không chứa item.id
                    if (!checkedIds.includes(item.id)) {
                        // Thêm item.id vào mảng mới
                        newCheckedIds.push(item.id);
                    }
                });
            }
            pdf.save('danh_sach_hang_xuat_duyet.pdf', { returnPromise: true })

            axios.post('/updateRequestTransferExportApprove', { dataRequestExportPDF })
                .then(res => {
                    this.setState({
                        dataRequestExportPDF: [],
                        idHistory: randomId(),
                        checkedIds: []
                    });
                    // let requestTransferComplete = 2; requestTransferWarehouseResidual
                    return axios.post('/updateWarehouseResidual', { dataRequestExportPDF });
                })
                .then(() => {
                    return axios.post('/updateRequestTransferExport', { dataRequestExportPDF });
                })
                .then(() => {
                    if (newCheckedIds.length > 0) {
                        //nếu check id không trùng với data đã pending thì thêm vào id mới
                        return axios.post('/intoRequestTransferExportHistory', { idHistory, idRequestTransfers: newCheckedIds.join(','), caseRequest: 1, dateCreated: UpdateDateTime() });
                    }
                })
                .then(() => {
                    // Tạo một mảng chứa các promises từ các yêu cầu axios.post
                    const notificationPromises = dataRequestExportPDF.map(item => {
                        const dataNotifi = dataNotification.length > 0 && dataNotification.filter(notif => notif.idRequest === item.id) || [];
                        if (dataNotifi.length > 0) {
                            return axios.post('/updateNotificationPointInto', {
                                idRequest: dataNotifi[0].idRequest,
                                status: 'Đã duyệt',
                                pointApprovedExport: 3,
                                isRead: 0,
                                dateCreated: UpdateDateTime()
                            })
                        }
                        return Promise.resolve(); // Trả về một promise đã được giải quyết nếu không cần cập nhật thông báo
                    });

                    // Sử dụng Promise.all để chờ tất cả các yêu cầu hoàn thành
                    return Promise.all(notificationPromises);
                })
                .then(() => {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Xuất file PDF thành công!</i></div>);

                    this.getData();
                })
                .catch(error => {
                    console.error('An error occurred during updates', error);
                    // Xử lý lỗi
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Đã xảy ra lỗi khi cập nhật dữ liệu!</i></div>);
                });


        }

    }


    render() {

        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>

                    </div>
                    <div className="head">
                        <h3>Danh mục chuyển kho</h3>
                        <div>

                            <img style={{ width: '50px', cursor: 'pointer' }} onClick={() => this.handleExportPDF()} title='Xuất file PDF' src='../icons/color/pdf-file.png' />
                        </div>
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>


                                    <th><i className='bx bxs-flag-checkered'></i></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferFromWarehouse')}  >Từ Kho  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferToWarehouse')}  >Đến Kho  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferItemsName')}  >Tên hàng  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferUnit')}  >Đơn vị tính  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferAmountApproved')}  >Số lượng được duyệt <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferTotalAmountExport')}  >Tổng số lượng xuất  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferAmountExport')}  >Số lượng xuất  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferWarehouseResidual')}  >Số lượng tồn  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferUnitPrice')}  >Đơn giá (VND)  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferIntoMoney')}  >Thành tiền (VND)  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestDateCreated')}  >Ngày tạo  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestDateVouchers')}  >Ngày chứng từ  <i className='bx bx-sort sort' /></th>





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

export default TransferExport;