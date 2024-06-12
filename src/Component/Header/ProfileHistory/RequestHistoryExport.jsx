import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';

// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';

// import { randomId } from '../RandomId/randomId'
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
import { connect } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { UpdateDateTime } from '../../UpdateDateTime.jsx';

import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
import { dataSearch, dataSearchValue, isDataSearch, searchDatetimeEnd, searchDatetimeStart } from '../../../StoreRcd.jsx';

const fontName = 'Arial';
const fontFile = '../font/arial.ttf'; // Đường dẫn đến tập tin font chữ
const fontEncoding = 'Unicode'; // Bảng mã của font chữ

const getdataRequest = () => axios.get('/getRequestTransfer').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataRequestTransferHistory = () => axios.get('/getRequestTransferHistory').then((res) => res.data)
const getdataTransferExportApprover = () => axios.get('/getTransferExportApprover').then((res) => res.data)

class RequestHistoryExport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataMember: [],
            dataRequestTransferHistory: [],
            dataTransferExportApprove: [],
            memberName: '',
            departmentApproveDate: '',
            idRequest: '',
            idRequestTeamp: '',
            idHistory: '',
            idRequestTransfers: [],
            // approved check
            flagPositionDetailApprove: false,
            isShowApproveDateName: false,
            permission: '',
            userName: '',


            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,

            // datepicker search
            isSearchDateTime: false

        }
        this.currentTodos = this.currentTodos.bind(this)

    }
    componentDidMount() {

        this._isMounted = true

        Promise.all([this.getData(), this.isBcryptPermission()]).then(() => {


        });
        document.addEventListener('click', this.handleClickOutside);
    }
    componentWillUnmount() {
        this._isMounted = false
        this.props.getDataSearch([])
        this.props.getDatasearchValue([])
        this.props.is_DataSearch(false)

        this.props.SearchDateTimeStart('')
        this.props.SearchDateTimeEnd(new Date().toISOString())
        document.addEventListener('click', this.handleClickOutside);
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



    handleClickOutside = (event) => {
        if (!event.target.closest('.bx')) {
            if (this._isMounted) {  // Kiểm tra trước khi cập nhật state
                this.setState({ isShowApproveDateName: false });
            }
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


            const [dataRequest, dataMember, dataRequestTransferHistory, dataTransferExportApprove, dataListAccount] = await Promise.all([
                getdataRequest(),
                getdataMember(),
                getdataRequestTransferHistory(),
                getdataTransferExportApprover()
            ]);





            if (dataListAccount) {
                // Gọi hàm isBcryptPermission để xử lý quyền
                await this.isBcryptPermission(dataListAccount.rows);
            }
            const { tokenObj } = this.props || [];

            if (dataRequest) {
                if (this._isMounted) {
                    this.sortByDate(dataRequest.rows)

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

                // let id = randomId();
                // const isDuplicateitemCode = (id) => {
                //     return dataMember.some(item => item.id === id);
                // };

                // // Kiểm tra và tạo itemCode mới nếu trùng lặp
                // while (isDuplicateitemCode(id)) {
                //     id = randomId();
                // }
                if (this._isMounted) {
                    this.setState({
                        dataMember: dataMember.rows,


                    })
                }

            }
            if (dataRequestTransferHistory) {

                if (this._isMounted) {
                    this.setState({
                        dataRequestTransferHistory: dataRequestTransferHistory.rows.reverse(),

                    })
                }
            }
            if (dataTransferExportApprove) {

                if (this._isMounted) {
                    this.setState({
                        dataTransferExportApprove: dataTransferExportApprove.rows.reverse(),

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
            const filteredData = sortedData.filter(value => {

                const pointApprove = value.requestTransferPointApprove !== null ? value.requestTransferPointApprove.split(',') : '';
                return !this.checkPermissionApprove(pointApprove, value)
            });
            this.props.getDataSearch(filteredData)
            this.setState({
                // dataRequestTeamp: dataRequest,
                dataRequest: filteredData,

                // totalPage: sortedData.length
            });
        }



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

    approvedOrder = (idRequest) => {
        const { idRequestTeamp, flagPositionDetailApprove, } = this.state;

        if (idRequestTeamp === idRequest && flagPositionDetailApprove) {

            if (this._isMounted) {

                this.setState({
                    flagPositionDetailApprove: false,
                    idRequest: idRequest,
                    idRequestTeamp: '',
                    idHistory: '',
                    idRequestTransfers: '',
                })
            }
        } else {
            if (this._isMounted) {
                const idHistory = this.checkDataIdHistory(idRequest)

                this.setState({
                    flagPositionDetailApprove: true,
                    idRequest: idRequest,
                    idRequestTeamp: idRequest,
                    idRequestTransfers: idHistory.idHistorys,
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


    showApproveDate = () => {
        const { dataTransferExportApprove, idRequest } = this.state;
        if (dataTransferExportApprove) {
            return dataTransferExportApprove.map((value, key) => {
                if (value.idRequest === idRequest) {


                    return (
                        <tr key={key}>

                            <td>{value.requestTransferMaker}</td>
                            <td>{value.requestDateUpdate}</td>
                        </tr>
                    )
                }
            })
        }
    }

    showPurchaseDatePrint = () => {
        const { idRequest, dataTransferExportApprove } = this.state;
        if (dataTransferExportApprove) {
            let flagPrint = false;
            return dataTransferExportApprove.map((value, key) => {
                if (value.idRequest === idRequest && !flagPrint) {
                    flagPrint = true
                    return (
                        <tr key={key}>
                            <td>Warehouse In</td>
                            <td className='datePrint'  >{value.datePrint ? value.datePrint : ''}</td>
                        </tr>

                    )
                }
            })
        }
    }


    checkPermissionApprove = (pointApprove, value) => {
        const { permission, department, memberName, } = this.props;

        if (!pointApprove) return false;
        if ((permission !== 'Lãnh đạo' && permission !== 'Admin' && permission !== 'Trưởng phòng') &&
            value.requestTransferMaker === memberName && value.requestTransferDepartment === department) {
            //  thành viên sẽ thấy đơn của mình tạo , khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        }

        else if (permission === 'Trưởng phòng' &&
            value.requestTransferDepartment === department && department !== 'Kế toán' &&
            (parseInt(pointApprove[0]) === 1 || parseInt(pointApprove[0]) === -1)) {
            //  trưởng phòng sẽ thấy đơn tạo của bộ phận mình , và thu mua đã được duyệt 
            return false;
        }
        else if (permission === 'Trưởng phòng' && department === 'Kế toán' &&
            (parseInt(pointApprove[1]) === -1 || parseInt(pointApprove[1]) === 1)) {


            //  trưởng phòng kế toán sẽ thấy đơn người trước đã duyệt hết, sau đó tới chính mình duyệt
            return false;
        }
        else {
            return true;
        }
    }



    checkDataIdHistory = (idRequest) => {
        const { dataRequestTransferHistory, dataRequest } = this.state;

        let matchedIdHistory = null;
        let matchedIdHistorys = []; // Initialize an array to store the matched idHistorys

        // Lặp qua từng phần tử trong dataRequest để tìm idHistory trùng khớp
        dataRequest.forEach((request) => {
            const requestIdHistory = request.requestIdHistory;


            if (requestIdHistory !== null) {
                // Lặp qua từng phần tử trong dataRequestTransferHistory để so sánh idHistory
                dataRequestTransferHistory.forEach((history) => {
                    if (history.idHistory === requestIdHistory) {
                        // Lấy idRequestTransfers từ phần tử history và kiểm tra idRequest
                        const idHistorys = history.idRequestTransfers !== null ? history.idRequestTransfers.split(',') : [];

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


    // pageination
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
    }




    handleExportPDF = () => {
        const { idRequestTransfers, dataRequest, idRequestTeamp } = this.state;
        // Lọc ra các phần tử có idRequest tương ứng với giá trị mong muốn

        if (!idRequestTeamp) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Chọn dòng cần xuất file PDF!</i></div>)
            return
        }
        const dateUpdate = UpdateDateTime()

        // cập nhật ngày hiện tại in 
        const dataRequestExportPDF = dataRequest.filter(row => parseInt(row.requestTransferComplete) === 2 && idRequestTransfers.includes(row.id)) || [];
        // Gán giá trị idHistory cho các phần tử được lọc

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

        pdf.save('danh_sach_hang_xuat_duyet.pdf', { returnPromise: true })


            .catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Lỗi xuất file PDF kiểm tra lại thông tin!</i></div>)
            });


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
                const approveted = value.requestTransferApprove !== null ? value.requestTransferApprove.split(',') : ''
                const pointApprove = value.requestTransferPointApprove !== null ? value.requestTransferPointApprove.split(',') : ''
                return (
                    <tr key={key} >
                        {value.requestTransferStatus === 'Đã duyệt' || value.requestTransferStatus === 'Từ chối' ?

                            <td className='flagDate' ><input onClick={() => this.approvedOrder(value.id)}
                                onChange={() => { }}
                                checked={idRequestTeamp === value.id}  // Kiểm tra xem checkbox có được chọn hay không
                                style={{ cursor: 'pointer' }} type="checkbox" name="" id=""
                            />
                            </td>
                            : <td className='flagDate'><span></span></td>

                        }
                        <td >{value.requestTransferFromWarehouse}</td>
                        <td >{value.requestTransferToWarehouse}</td>
                        <td >{value.requestTransferMaker}</td>
                        <td style={{ padding: '15px' }}>
                            {this.arrayApproveted(approveted, pointApprove)}

                        </td>
                        <td >{value.requestTransferItemsName}</td>
                        <td >{value.requestTransferUnit}</td>
                        <td >{parseFloat(value.requestTransferAmountApproved).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{value.requestTransferAmountExport !== null && parseFloat(value.requestTransferAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.requestTransferUnitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.requestTransferIntoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>

                        <td >
                            <span className={parseInt(value.requestTransferComplete) >= 1 ? 'statusGreen' : 'statusYellow'} >
                                {value.requestTransferStatus}
                            </span>
                        </td>

                        <td >{value.requestDateCreated}</td>
                        <td >{value.requestDateUpdate}</td>

                    </tr>
                )

            })
        }
    }

    // tải lại dữ liệu
    refreshData = () => {
        this.props.is_DataSearch(false)
        this.props.getDatasearchValue([])

    }

    render() {
        const { isSearchDateTime, idHistory, flagPositionDetailApprove, isShowApproveDateName } = this.state;
        const { permission } = this.props || ''
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        {/* <RequestInto/> */}
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


                                    <th className='flagDate'><i className='bx bxs-flag-checkered'></i></th>
                                    <th >Từ Kho</th>
                                    <th >Đến Kho</th>
                                    <th >Người tạo</th>
                                    <th >Người duyệt</th>
                                    <th >Tên hàng</th>
                                    <th >Đơn vị tính</th>
                                    <th >Số lượng được duyệt</th>
                                    <th >Số lượng thực xuất</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Thành tiền (VND)</th>
                                    <th >Trạng thái</th>
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>



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
                    {idHistory &&
                        <div className='exportPDF'>
                            <div  >

                                <span title='ghi chú' className="tipClick">
                                    <a href="#tooltip">®</a>
                                    <strong className="tooltipT">
                                        <p>Mã này dùng trong tìm kiếm đễ lọc danh sách, được tạo khi 'chuyển kho' xuất file! </p>

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
                                    <p>Kho đã xuất file PDF, có thể tải xuống! </p>

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
export default connect(mapStateToProps, mapDispatchToProps)(RequestHistoryExport)

