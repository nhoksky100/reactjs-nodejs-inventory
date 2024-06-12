import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime.jsx';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
// import stringtoslug from '../../stringtoslug.jsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import bcrypt from 'bcryptjs';
import Select from 'react-select';
import Pagination from 'react-js-pagination';
import PurchaseFormMenu from './PurchaseFormMenu.jsx';
import { randomId } from '../../RandomId/randomId'

const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataApproveOrder = () => axios.get('/getApproveOrder').then((res) => res.data)
const getdataSupplier = () => axios.get('/getSupplier').then((res) => res.data)

const fontName = 'Arial';
const fontFile = '../font/arial.ttf'; // Đường dẫn đến tập tin font chữ
const fontEncoding = 'Unicode'; // Bảng mã của font chữ

class PurchaseRequestListApproved extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataRequestTeamp: [],
            dataRequest: [],
            dataMember: [],
            dataApproveDate: [],
            selectedSupplierName: [],
            dataSupplier: [],
            filteredSuppliers: [], // Danh sách nhà cung cấp đã lọc
            selectedSupplier: '', // Nhà cung cấp được chọn

            idHistory: '',
            memberName: '',
            departmentApproveDate: '',
            idRequest: '',
            idRequestTeamp: '',
            flagPositionDetailApprove: false,
            isShowExport: false,
            permission: '',
            userName: '',

            sortOrder: 'asc', // Thứ tự sắp xếp: 'asc' (tăng dần) hoặc 'desc' (giảm dần)

            // export pdf ,print
            supplierNames: [],
            supplierNamesTeamp: [],
            dataRequestExportPDF: [],
            dataExported: [],

            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,
            checkedIds: []

        }
        this._isMounted = false
        this.currentTodos = this.currentTodos.bind(this)
        // this.handleChangeSupplierName = this.handleChangeSupplierName.bind(this);
    }
    componentDidMount() {
        this._isMounted = true

        Promise.all([this.getData(), this.isBcryptPermission()]).then(() => {


        });
        document.addEventListener('click', this.handleClickOutside);
    }
    componentWillUnmount() {
        this._isMounted = false

        document.removeEventListener('click', this.handleClickOutside);
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
    handleClickOutside = (event) => {
        if (!event.target.closest('.bx')) {
            this.setState({ isShowExport: false });
        }
    }


    getData = async () => {
        try {


            const [dataRequest, dataSupplier, dataApproveDate, dataMember, dataListAccount] = await Promise.all([
                getdataRequest(),
                getdataSupplier(),
                getdataApproveOrder(),
                getdataMember()

            ]);





            if (dataListAccount) {
                // Gọi hàm isBcryptPermission để xử lý quyền
                await this.isBcryptPermission(dataListAccount.rows);
            }
            const { tokenObj } = this.props || [];

            if (dataRequest) {
                if (this._isMounted) {

                    // const currentTodos = this.currentTodos(filteredData);
                    // console.log(currentTodos,'currentTodos');
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
                    if (this._isMounted) {

                        this.setState({

                            idHistory: id
                        });
                    }
                    this.sortByDate(dataRequest.rows)
                }
            }



            if (dataSupplier) {
                const supplierNames = dataSupplier.rows.map(supplier => ({ value: supplier.supplierName, label: supplier.supplierName }));
                if (this._isMounted) {
                    this.setState({
                        dataSupplier: dataSupplier.rows.reverse(),
                        supplierNames: supplierNames,
                        // supplierNamesTeamp: supplierNames,
                    })
                }

            }




            if (dataApproveDate) {
                if (this._isMounted) {
                    this.setState({ dataApproveDate: dataApproveDate.rows })
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
                            // const goToBackPermission = this.checkPermissionLock(value.memberPermission, departmentApproveDate)
                            // if (!goToBackPermission) {
                            //     return window.history.back()
                            // }
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

    // pageination currentpage
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
    }
    currentTodos = (dataRequest) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataRequest.length;
        return dataRequest && dataRequest.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
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
            const key = item.dateUpdate;
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
        const filteredData = sortedData.filter(value => {

            // const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
            return value.statusOrder === 'Đã duyệt' && parseInt(value.orderComplete) === 1
        });
        if (this._isMounted) {

            this.setState({
                // dataSupplierTeamp: dataSupplier,
                dataRequest: filteredData.reverse(),
                totalPage: filteredData.length
            });
        }



    }



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
    // checkPermissionLock = (permission, departmentApproveDate) => {
    //     // const { permission, departmentApproveDate } = this.state;


    //     const permissionBlock = ['Thành viên', 'Thành viên kho', 'Admin', 'Trưởng phòng'];
    //     if (permission && departmentApproveDate) {

    //         if (permissionBlock.includes(permission)) {
    //             return false;
    //         }

    //         else if (permission === 'Trưởng phòng' && departmentApproveDate !== 'Kế toán') {
    //             return false;
    //         } else {
    //             return true
    //         }

    //         // return true;
    //     }

    // }
    approvedOrder = (idRequest) => {
        const { idRequestTeamp, flagPositionDetailApprove } = this.state;
        if (idRequestTeamp === idRequest && flagPositionDetailApprove) {
            if (this._isMounted) {

                this.setState({
                    flagPositionDetailApprove: false,
                    idRequest: idRequest,
                    idRequestTeamp: ''
                })
            }
        } else {
            if (this._isMounted) {

                this.setState({
                    flagPositionDetailApprove: true,
                    idRequest: idRequest,
                    idRequestTeamp: idRequest
                })
            }
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

    // dataApproveDate PDO
    showDataApproveDate = () => {
        const { dataApproveDate, idRequest } = this.state;
        if (dataApproveDate) {
            return dataApproveDate.map((value, key) => {
                if (value.idRequest === idRequest) {


                    return (
                        <tr key={key}>

                            <td>{value.orderApprove}</td>
                            <td>{value.dateUpdate}</td>
                        </tr>
                    )
                }
            })
        }
    }
    showExportPDF = () => {

        const { idRequest, dataApproveDate } = this.state;
        if (dataApproveDate) {
            let flagPrint = false;
            return dataApproveDate.map((value, key) => {
                if (value.idRequest === idRequest && !flagPrint) {
                    flagPrint = true
                    return (
                        <tr key={key}>
                            <td>PUR In</td>
                            <td className='datePrint'  >{value.datePrint ? value.datePrint : ''}</td>
                        </tr>

                    )
                }
            })
        }

    }

    handleChangeSupplierName = (selectedOption, id) => {
        // Tìm đối tượng trong dataRequest có id tương ứng với id được chọn
        const selectedData = this.state.dataRequest.find(item => item.id === id);

        // Kiểm tra xem đã tìm thấy đối tượng hay không
        if (selectedData) {

            // Cập nhật nhacungcap vào đối tượng đã tìm thấy
            selectedData.orderSupplierName = selectedOption.value; // Lưu ý: selectedOption chứa giá trị được chọn từ dropdown
            // Cập nhật lại state
            const newDataRequestExportPDF = [...this.state.dataRequestExportPDF];
            newDataRequestExportPDF.push(selectedData); // Thêm đối tượng đã cập nhật vào mảng mới
            // Cập nhật lại state cho dataRequestExportPDF
            this.setState({
                dataRequestExportPDF: newDataRequestExportPDF
            });
        } else {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Không tìm thấy nhà cung cấp!</i></div>)
        }
    }


    showFormRow = () => {
        const { dataRequest, idRequestTeamp, supplierNames, permission } = this.state;

        if (dataRequest) {
            const currentTodos = this.currentTodos(dataRequest)
            return currentTodos.map((value, key) => {
                // const approveted = value.orderApprove !== null ? value.orderApprove.split(',') : ''
                const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : ''


                return (
                    <tr key={key} >
                        {permission !== 'Lãnh đạo' && permission !== 'Trưởng phòng' &&
                            <td>
                                <input
                                    onClick={() => this.handleCheckboxChange(value.id)}
                                    onChange={() => { }}
                                    checked={this.isChecked(value.id)}  // Sử dụng hàm isChecked để kiểm tra trạng thái checkbox
                                    style={{ cursor: 'pointer' }}
                                    type="checkbox"
                                    name=""
                                    id=""
                                    title='tích chọn dòng cần in PDF'
                                />
                            </td>
                        }

                        {/* <td >{key + 1}</td> */}
                        <td >{value.orderCode}</td>
                        {/* <td >{value.orderMaker}</td> */}
                        {/* <td style={{ minWidth: '150px' }} >
                                {this.arrayApproveted(approveted, pointApprove)}

                            </td> */}
                        <td >{value.orderName}</td>
                        <td >{value.unit}</td>
                        <td >{parseFloat(value.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.unitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.intoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        {/* <td >
                                <span className='statusGreen'
                                // {value.statusOrder === 'Chờ duyệt' ? 'statusYellow' : value.statusOrder === 'Đã duyệt' ? 'statusGreen' : 'statusRed'}
                                >
                                    {value.statusOrder}
                                </span>
                            </td> */}
                        {/* <td >{value.department}</td> */}
                        {/* <td >{value.dateCreated}</td> */}

                        <td >
                            {
                                parseInt(pointApprove[0]) === 0 && parseInt(pointApprove[3]) === 1 ?
                                    (<div style={{ minWidth: '200px', width: 'auto' }} className='select-supplier'>

                                        {Array.isArray(supplierNames) && supplierNames.length > 0 && (
                                            <Select onChange={(selectedOption) => this.handleChangeSupplierName(selectedOption, value.id)} name='selectSupplierName' placeholder="Chọn nhà cung cấp" options={supplierNames} />
                                        )}
                                    </div>)
                                    : value.orderSupplierName
                            }

                        </td>
                        <td >{value.dateUpdate}</td>


                    </tr>
                )



            })
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
        if (columnName !== 'amount' && columnName !== 'intoMoney' && columnName !== 'unitPrice'
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



    handleExportPDF = () => {
        const { checkedIds, dataRequest, idHistory } = this.state;
        // Lọc ra các phần tử có idRequest tương ứng với giá trị mong muốn

        if (!checkedIds) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Chọn dòng cần xuất file PDF!</i></div>)
            return
        }

        // const dataRequestExportPDF = dataRequest.filter(row => row.id === idRequestTeamp) || [];
        const dataRequestIds = dataRequest.filter(row => checkedIds.includes(row.id));
        // Gán giá trị idHistory cho các phần tử được lọc
        const dataRequestExportPDF = dataRequestIds.map(row => {
            if (checkedIds.includes(row.id)) {
                return { ...row, idHistory: idHistory };
            }
            return row;
        });

        // const pdf = new jsPDF();
        // kiểm tra nhà cung cấp có chưa

        if (dataRequestExportPDF.length === 0 || dataRequestExportPDF.some(row => !row.orderSupplierName)) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Chưa chọn nhà cung cấp!</i></div>);
            return;
        }



        // Tạo một mảng chứa các dòng dữ liệu cho bảng
        const data = dataRequestExportPDF.length !== 0 && dataRequestExportPDF.map(row => {
            return [
                row.orderCode,
                row.orderName,
                row.orderNotes,
                parseFloat(row.unitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                parseFloat(row.amount).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                parseFloat(row.intoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' VND',
                row.unit,
                row.orderSupplierName,
                row.dateUpdate = UpdateDateTime()
            ] || []
        });

        // Thêm font vào tài liệu PDF (nếu cần)
        const fontSize = 10; // Đặt kích thước chữ
        const pageWidth = 610; // Đặt chiều rộng của trang
        const pageHeight = 620; // Đặt chiều cao của trang
        // Tạo một đối tượng PDF mới
        const pdf = new jsPDF({
            orientation: 'p', // Chiều rộng lớn hơn chiều cao (landscape)
            unit: 'pt', // Đơn vị là điểm
            format: [pageWidth, pageHeight] // Kích thước trang giấy
        });
        pdf.addFont(fontFile, fontName, fontEncoding);

        const tableOptions = {
            startY: 20,
            head: [['Mã hàng', 'Tên hàng', 'Ghi chú', 'Đơn giá', 'Số lượng', 'Thành tiền', 'Đơn vị tính', 'Nhà cung cấp', 'Ngày cập nhật']],
            body: data,
            margin: { top: 20, left: 5, right: 5 },
            styles: { font: fontName, fontSize: fontSize }, // Sử dụng font đã tải và kích thước chữ đã đặt
            encoding: fontEncoding, // Sử dụng encoding mặc định
            columnStyles: {
                0: { cellWidth: 60, halign: 'center' },
                1: { cellWidth: 80, halign: 'center', },
                2: { cellWidth: 80, halign: 'center', },
                3: { cellWidth: 60, halign: 'center' },
                4: { cellWidth: 60, halign: 'center' },
                5: { cellWidth: 60, halign: 'center' },
                6: { cellWidth: 60, halign: 'center' },
                7: { cellWidth: 80, halign: 'center', },
                8: { cellWidth: 60, halign: 'center' }
            },
            autoSize: 'wrap',
            headStyles: {
                fontStyle: 'bold', // Chữ in đậm
                halign: 'center' // Căn giữa
            }
        };

        // Vẽ bảng vào PDF
        pdf.autoTable(tableOptions);


        pdf.save('danh_sach_hang_duyet.pdf', { returnPromise: true })
            .then(() => {
                axios.post('/updatePurchaseExport', { dataRequestExportPDF })
                    .then(res => {
                        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            <i>Xuất file PDF thành công!</i></div>);
                        this.setState({
                            dataExported: data,
                            dataRequestExportPDF: [],
                            idRequestTeamp: '',
                            idRequest: ''
                        });
                        let orderComplete = 2;
                        axios.post('/updateAppremovedRequestComplete', {idHistory, orderComplete, dataRequestExportPDF });
                        axios.post('/intoRequestHistory', { idHistory, idRequests: checkedIds.join(','), dateCreated: UpdateDateTime() });
                        this.getData();
                    })
                    .catch(error => {
                        console.error('Error during the process:', error);
                        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            <i>Lỗi trong quá trình xuất file PDF, kiểm tra lại thông tin!</i></div>);
                    });
            })
            .catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Lỗi xuất file PDF kiểm tra lại thông tin!</i></div>)
            });


    }


    render() {
        const { permission } = this.state;
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <PurchaseFormMenu />
                    </div>
                    <div className="head">
                        <h3>Danh mục đơn đã duyệt</h3>
                        {permission !== 'Lãnh đạo' && permission !== 'Trưởng phòng' &&
                            <div>

                                <img style={{ width: '50px', cursor: 'pointer' }} onClick={() => this.handleExportPDF()} title='Xuất file PDF' src='../icons/color/pdf-file.png' />
                            </div>
                        }
                        {/* {
                            this.state.flagPositionDetailApprove &&
                            <div>
                                {!this.state.isShowExport &&

                                    <i style={{ fontSize: '20px' }} onClick={() => this.setState({ isShowExport: !this.state.isShowExport })} title='Xem chi tiết người duyệt' className='bx bxs-user-pin' />
                                }
                                {
                                this.state.isShowExport &&


                                    <table border={1} style={{ borderRadius: '10px' }} className='table-data'>


                                        <tbody style={{ border: 'none' }}>

                                            {this.showExportPDF()}

                                        </tbody>
                                    </table>
                                }
                            </div>

                        } */}
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>


                                    {permission !== 'Lãnh đạo' && permission !== 'Trưởng phòng' && <th><i className='bx bxs-flag-checkered'></i></th>}


                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('orderCode')} >Mã hàng  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('orderName')} >Tên hàng  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('unit')}>Đơn vị tính  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('amount')}>Số lượng  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('unitPrice')}>Đơn giá (VND)  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('intoMoney')}>Thành tiền (VND  <i className='bx bx-sort sort' />)</th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('orderSupplierName')}>Nhà cung cấp  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('dateUpdate')}>Ngày cập nhật  <i className='bx bx-sort sort' /></th>



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

export default PurchaseRequestListApproved;