import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
// import { UpdateDateTime } from '../../UpdateDateTime.jsx';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// import bcrypt from 'bcryptjs';
import Pagination from 'react-js-pagination';
import { connect } from 'react-redux';
import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
// import PurchaseFormMenu from './PurchaseFormMenu.jsx';
import { dataSearch, dataSearchValue, isDataSearch, searchDatetimeEnd, searchDatetimeStart } from '../../../StoreRcd.jsx';

const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataApproveOrder = () => axios.get('/getApproveOrder').then((res) => res.data)
const getdataRequestHistory = () => axios.get('/getRequestHistory').then((res) => res.data)

const fontName = 'Arial';
const fontFile = '../font/arial.ttf'; // Đường dẫn đến tập tin font chữ
const fontEncoding = 'Unicode'; // Bảng mã của font chữ
class RequestHistoryInto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataMember: [],
            dataApproveDate: [],
            dataRequestHistory: [],
            memberName: '',
            departmentApproveDate: '',

            idRequest: '',
            idRequests: [],
            idHistory: '',
            idRequestTeamp: '',

            dataLoaded: false,
            isDisableAddRow: false,
            // list addrow

            flagPositionDetailApprove: false,

            isShowApproveDateName: false,
            // permission
            permission: '',

            // Pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,
            // datepicker search
            isSearchDateTime: false

        };
        this.currentTodos = this.currentTodos.bind(this)
        this._isMounted = false
    }
    componentDidMount() {
        this._isMounted = true
        Promise.all([this.getData(),]).then(() => {


        });

        document.addEventListener('click', this.handleClickOutside);
    }

    componentWillUnmount() {
        this._isMounted = false
        document.removeEventListener('click', this.handleClickOutside);
        this.props.getDataSearch([])
        this.props.getDatasearchValue([])
        this.props.is_DataSearch(false)

        this.props.SearchDateTimeStart('')
        this.props.SearchDateTimeEnd(new Date().toISOString())
    }
    getData = async () => {
        this._isMounted = true
        try {
            const { tokenObj } = this.props || {}

            const [dataRequest, dataMember, dataApproveDate, dataRequestHistory] = await Promise.all([
                getdataRequest(),
                getdataMember(),
                getdataApproveOrder(),
                getdataRequestHistory(),

                // getdataItemsList(),
                // getdataIntoWarehouse(),

            ]);


            if (dataRequest) {
                if (this._isMounted) {

                    this.sortByDate(dataRequest.rows)
                }
            }


            if (dataMember) {

                if (this._isMounted) {

                    this.setState({ dataMember: dataMember.rows, dataLoaded: true })
                }
            }
            if (dataApproveDate) {
                if (this._isMounted) {

                    this.setState({ dataApproveDate: dataApproveDate.rows, dataLoaded: true })
                }
            }


            if (dataRequestHistory) {
                if (this._isMounted) {

                    this.setState({ dataRequestHistory: dataRequestHistory.rows, dataLoaded: true })
                }
            }

        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error occurred while fetching data:", error);
        }


    }

    // getData = () => {
    //     const { tokenObj } = this.props || [];
    //     getdataRequest().then((res) => {
    //         if (res) {
    //             this.sortByDate(res)
    //         }
    //     })
    //     getdataApproveOrder().then((res) => {
    //         if (res) {
    //             if (this._isMounted) {

    //                 this.setState({ dataApproveDate: res.reverse() })
    //             }
    //         }
    //     })
    //     getdataRequestHistory().then((res) => {
    //         if (res) {
    //             if (this._isMounted) {

    //                 this.setState({ dataRequestHistory: res.reverse() })
    //             }
    //         }
    //     })
    //     getdataMember().then((res) => {
    //         if (res) {
    //             res.map((value) => {
    //                 if (value.memberCode === tokenObj.accountCode) {
    //                     const isPermission = bcrypt.compareSync(value.memberPermission, tokenObj.accountPermission)
    //                     const memberName = value.memberName
    //                     const departmentApproveDate = value.memberDepartment
    //                     if (isPermission) {
    //                         if (this._isMounted) {

    //                             this.setState({
    //                                 permission: value.memberPermission,
    //                                 memberName: memberName,
    //                                 departmentApproveDate: departmentApproveDate
    //                             })
    //                         }
    //                     }
    //                 }
    //             })
    //             if (this._isMounted) {

    //                 this.setState({ dataMember: res.reverse() })
    //             }
    //         }
    //     })
    // }

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
            const key = item.dateCreated;
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
            const filteredData = sortedData.filter(value => {

                const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
                return !this.checkPermissionApprove(pointApprove, value)
            });
            this.props.getDataSearch(filteredData)
            this.setState({
                // dataRequestTeamp: dataRequest,
                dataRequest: filteredData,
                dataLoaded: true,
                // totalPage: sortedData.length
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


    // search filter time date
    formSearchDateTime = () => {
        if (!this.state.isSearchDateTime) {
            this.props.SearchDateTimeStart('')
            this.props.SearchDateTimeEnd(new Date().toISOString())
        }
        this.setState({ isSearchDateTime: !this.state.isSearchDateTime })
    }

    searchDateTime = () => {
        const { dataRequest } = this.state;
        const { dateTimeStart, dateTimeEnd } = this.props

        const dataSearchDate = SearchDate(dataRequest, dateTimeStart, dateTimeEnd);
        this.props.getDatasearchValue(dataSearchDate)
        this.props.is_DataSearch(true)

    }


    checkPermissionApprove = (pointApprove, value) => {
        const { permission, department, memberName, } = this.props;

        if (!pointApprove) return false;



        if (permission === 'Thành viên thu mua' && (parseInt(pointApprove[0]) === 1 || parseInt(pointApprove[0]) === -1)) {
            return false;
        }
        else if ((permission !== 'Lãnh đạo' && permission !== 'Admin' && permission !== 'Trưởng phòng' && permission !== 'Thành viên thu mua') &&
            value.orderMaker === memberName && value.department === department) {
            //  thành viên sẽ thấy đơn của mình tạo , khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        }
    
        else if (permission === 'Trưởng phòng' &&
            value.department === department && department !== 'Kế toán' &&
            (parseInt(pointApprove[1]) === 1 || parseInt(pointApprove[1]) === -1)) {
            //  trưởng phòng sẽ thấy đơn tạo của bộ phận mình , và thu mua đã được duyệt 
            return false;
        }
        else if (permission === 'Trưởng phòng' && department === 'Kế toán' &&
            (parseInt(pointApprove[2]) === -1 || parseInt(pointApprove[2]) === 1)) {


            //  trưởng phòng kế toán sẽ thấy đơn người trước đã duyệt hết, sau đó tới chính mình duyệt
            return false;
        }


        else if (permission === 'Lãnh đạo' && (parseInt(pointApprove[3]) === -1 || parseInt(pointApprove[3]) === 1)) {
            return false;
        }
        else {
            return true;
        }
    }



    checkDataIdHistory = (idRequest) => {
        const { dataRequestHistory, dataRequest } = this.state;
        let matchedIdHistory = null;
        let matchedIdHistorys = []; // Initialize an array to store the matched idHistorys

        // Lặp qua từng phần tử trong dataRequest để tìm idHistory trùng khớp
        dataRequest.forEach((request) => {
            const requestIdHistory = request.idHistory;

            if (requestIdHistory !== null) {
                // Lặp qua từng phần tử trong dataRequestHistory để so sánh idHistory
                dataRequestHistory.forEach((history) => {
                    if (history.idHistory === requestIdHistory) {
                        // Lấy idRequests từ phần tử history và kiểm tra idRequest
                        const idHistorys = history.idRequests !== null ? history.idRequests.split(',') : [];

                        if (idHistorys.includes(idRequest)) {
                            matchedIdHistory = history.idHistory;
                            matchedIdHistorys = idHistorys; // Assign the matched idHistorys array
                            return; // Exit the inner loop once a match is found
                        }
                    }
                });
            }
        });

        // Return an object with matchedIdHistory and idHistorys (renamed to matchedIdHistorys)
        return {
            matchedIdHistory,
            idHistorys: matchedIdHistorys
        };
    }


    approvedOrder = (idRequest) => {
        const { idRequestTeamp, flagPositionDetailApprove, } = this.state;
        if (idRequestTeamp === idRequest && flagPositionDetailApprove) {

            if (this._isMounted) {

                this.setState({
                    flagPositionDetailApprove: false,
                    idRequest: idRequest,
                    idRequestTeamp: '',
                    idHistory: '',
                    idRequests: '',
                })
            }
        } else {
            if (this._isMounted) {
                const idHistory = this.checkDataIdHistory(idRequest)

                this.setState({
                    flagPositionDetailApprove: true,
                    idRequest: idRequest,
                    idRequestTeamp: idRequest,
                    idRequests: idHistory.idHistorys,
                    idHistory: idHistory.matchedIdHistory,
                })
            }
        }

    }
    arrayApproveted = (approveted, pointApprove) => {
        const pushArrayApprove = [];
        if (approveted && pointApprove) {
            for (let i = 0; i < approveted.length; i++) {

                pushArrayApprove.push(
                    <div key={i} className={
                        parseInt(pointApprove[i]) === 1 ?
                            'approve-request backgournd-approve col-md-2' :
                            parseInt(pointApprove[i]) === -1 ?
                                'approve-request backgournd-approve-return col-md-2' : 'approve-request col-md-2'
                    }>
                        {approveted[i]}
                    </div>
                )
            }
        }
        return pushArrayApprove;
    }

    // pageination
    handlePageChange(currentPage) {
        if (this._isMounted) {

            this.setState({
                currentPage: currentPage,
            });
        }
    }
  
    showFormRow = () => {
        const { dataRequest, idRequestTeamp } = this.state;

        if (dataRequest) {
            let currentTodos = []
          
            const { isDataSearch, dataSearchValue } = this.props;
            if (isDataSearch) {

                currentTodos = this.currentTodos(dataSearchValue)

            } else {
                currentTodos = this.currentTodos(dataRequest)

            }

            return currentTodos.map((value, key) => {
                const approveted = value.orderApprove !== null ? value.orderApprove.split(',') : ''
                const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : ''
                return (


                    <tr key={key} >
                        {value.statusOrder === 'Đã duyệt' || value.statusOrder === 'Từ chối' ?

                            <td className='flagDate' ><input onClick={() => this.approvedOrder(value.id)}
                                onChange={() => { }}
                                checked={idRequestTeamp === value.id}  // Kiểm tra xem checkbox có được chọn hay không
                                style={{ cursor: 'pointer' }} type="checkbox" name="" id=""
                            />
                            </td>
                            : <td className='flagDate'><span></span></td>

                        }
                        {/* <td>{key + 1}</td> */}
                        <td >{value.orderCode}</td>
                        <td >{value.orderMaker}</td>
                        <td style={{ minWidth: '150px' }}>
                            {this.arrayApproveted(approveted, pointApprove)}

                        </td>
                        <td >{value.orderName}</td>
                        <td >{value.unit}</td>
                        <td >{parseFloat(value.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.unitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.intoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td ><span className=
                            {value.statusOrder === 'Chờ duyệt' ? 'statusYellow' : value.statusOrder === 'Đã duyệt' ? 'statusGreen' : 'statusRed'}>
                            {value.statusOrder}
                        </span>
                        </td>
                        <td >{value.department}</td>
                        <td >{value.dateCreated}</td>
                        <td >{value.dateUpdate}</td>

                        {

                            value.statusOrder === 'Từ chối' &&
                            <td>{value.orderReason}</td>
                        }


                    </tr>
                )
                // }
                // else {
                //     return
                // }
            })
        }
    }

    showPurchaseDatePrint = () => {
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

    // dataApproveDate PDO
    showApproveDate = () => {
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

    handleClickOutside = (event) => {
        if (!event.target.closest('.bx')) {
            if (this._isMounted) {  // Kiểm tra trước khi cập nhật state
                this.setState({ isShowApproveDateName: false });
            }
        }
    }

    // export pdf 
    handleExportPDF = () => {
        const {  dataRequest, idRequests } = this.state;
   
        const dataRequestExportPDF = dataRequest.filter(row => parseInt(row.orderComplete) === 2 && idRequests.includes(row.id)) || [];

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
                row.dateUpdate,
            ];
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
            body: data || '',
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
                // Lưu trữ giá trị của supplierNames vào biến tạm thời trước khi xuất file PDF

                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Xuất file PDF thành công!</i></div>)
                this.setState({

                    dataRequestExportPDF: [],
                    idRequestTeamp: '',
                    idRequest: '',

                })
                // this.getData()

            })
            .catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Lỗi xuất file PDF kiểm tra lại thông tin!</i></div>)
            });


    }


    showPDFPrint = () => {
        return (


            // <div style={{ display: 'flex', alignItems: 'center' }}>
            <img style={{ width: '25px', cursor: 'pointer' }} onClick={() => this.handleExportPDF()} title='Xuất file PDF' src='../icons/color/pdf-download.png' />
            // </div>

        )
    }

    // tải lại dữ liệu
    refreshData = () => {
        this.props.is_DataSearch(false)
        this.props.getDatasearchValue([])

    }

    render() {
        const { flagPositionDetailApprove, isShowApproveDateName, isSearchDateTime, idHistory, dataLoaded } = this.state;
        const { permission } = this.props || ''
        if (!dataLoaded) return <div className='leader'></div>

        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>

                    </div>
                    <div className="head">
                        <h3>{
                            (permission !== 'Trưởng phòng' && permission !== 'Lãnh đạo' && permission !== 'Admin')
                                ? 'Lịch sử đơn đã tạo của bạn'
                                : 'Lịch sử đơn đã duyệt của bạn'
                        }
                        </h3>

                        <div
                            style={
                                flagPositionDetailApprove ? { display: 'inline-flex', marginRight: '25px' }
                                    // : flagPositionDetailApprove && idHistory ? { display: 'inline-flex', marginRight: '50px' }
                                    : { display: 'inline-flex' }
                            }
                        >


                            <div className='pickerTime'>

                                {isSearchDateTime && <FilterTime />}
                                {isSearchDateTime && <i onClick={() => this.searchDateTime()} title='Tìm' className='bx bx-send' />}
                            </div>
                            <div className='pickerTimeBtn'>

                                {!isSearchDateTime ? <i onClick={() => this.formSearchDateTime()} className="bx bx-search" />
                                    : <i style={{ marginLeft: '15px' }} onClick={() => this.formSearchDateTime()} className='bx bx-message-square-x' />
                                }
                            </div>
                        </div>
                        {
                            flagPositionDetailApprove &&
                            <div className='view-approved' >
                                {!isShowApproveDateName &&

                                    <i style={{ fontSize: '20px' }}
                                        onClick={() => this.setState({ isShowApproveDateName: !isShowApproveDateName })} title='xem chi tiết người duyệt' className='bx bxs-user-pin' />
                                }
                                {isShowApproveDateName &&


                                    <table

                                        border={1} className='table-data history-view-approved'>


                                        <tbody style={{ border: 'none' }}>

                                            {this.showApproveDate()}
                                            {this.showPurchaseDatePrint()}

                                        </tbody>
                                    </table>
                                }
                            </div>



                        }

                        <i className="bx bx-filter" />
                        <i title='tải lại dữ liệu' onClick={() => this.refreshData()} className='bx bx-refresh' />
                    </div>



                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>

                                    <th className='flagDate' ><i className='bx bxs-flag-checkered'></i></th>
                                    <th >Mã hàng</th>
                                    <th >Người tạo</th>
                                    <th >Người duyệt</th>
                                    <th >Tên hàng</th>
                                    <th >Đơn vị tính</th>
                                    <th >Số lượng</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Thành tiền (VND)</th>
                                    <th >Trạng thái</th>
                                    <th >Bộ phận</th>
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                    <th > Lý do </th>

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
                                this.state.dataRequest !== null
                                    ? this.state.totalPage
                                    : 0
                            }
                            pageRangeDisplayed={5} // show page
                            // firstPageText ={'Đầu'}
                            onChange={this.handlePageChange.bind(this)}
                        />

                    </div>
                    {idHistory &&
                        <div className='exportPDF'>
                            <div  >

                                <span title='ghi chú' className="tipClick">
                                    <a href="#tooltip">®</a>
                                    <strong className="tooltipT">
                                        <p>Mã này dùng trong tìm kiếm đễ lọc danh sách, được tạo khi thu mua xuất file! </p>

                                        <span><a href="#closeTooltip">✕</a></span>
                                        {/* <span className="arrow" /> */}
                                    </strong>

                                    <b> Mã PDF: </b>
                                    <span style={{ color: 'red' }}> {idHistory}</span>
                                </span>

                            </div>
                            <span title='ghi chú' className="tipClick">
                                <a href="#tooltip">®</a>
                                <strong className="tooltipT">
                                    <p>Thu mua đã xuất file PDF, có thể tải xuống! </p>

                                    <span><a href="#closeTooltip">✕</a></span>
                                    {/* <span className="arrow" /> */}
                                </strong>
                                <b> Xuất file PDF: </b>
                                <img style={{ width: '25px', cursor: 'pointer' }} onClick={() => this.handleExportPDF()} title='Xuất file PDF' src='../icons/color/pdf-download.png' />
                            </span>
                        </div>
                    }
                </div>
            </div >
        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        permission: state.allReducer.permission,
        department: state.allReducer.department,
        memberName: state.allReducer.memberName,

        dataSearchValue: state.allReducer.dataSearchValue,
        isDataSearch: state.allReducer.isDataSearch,

        dateTimeEnd: state.allReducer.dateTimeEnd,
        dateTimeStart: state.allReducer.dateTimeStart,

    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getDataSearch: (action_dataSearch) => {
            dispatch(dataSearch(action_dataSearch))
        },
        getDatasearchValue: (action_dataSearchValue) => {
            dispatch(dataSearchValue(action_dataSearchValue))
        },
        is_DataSearch: (action_isDataSearch) => {
            dispatch(isDataSearch(action_isDataSearch))
        },
        SearchDateTimeStart: (act_search_datetime) => {
            dispatch(searchDatetimeStart(act_search_datetime))
        },
        SearchDateTimeEnd: (act_search_datetime) => {
            dispatch(searchDatetimeEnd(act_search_datetime))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(RequestHistoryInto)
