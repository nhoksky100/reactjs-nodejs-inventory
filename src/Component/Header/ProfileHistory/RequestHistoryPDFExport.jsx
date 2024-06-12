import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';

// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';

// import { randomId } from '../../RandomId/randomId.jsx'
import Pagination from "react-js-pagination";
// import bcrypt from 'bcryptjs';
import { connect } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { UpdateDateTime } from '../../UpdateDateTime.jsx';
import { dataSearch } from '../../../StoreRcd.jsx';

// import FilterTime from '../../FilterTime.jsx';
// import { SearchDate } from '../../SearchDate.jsx';

const fontName = 'Arial';
const fontFile = '../font/arial.ttf'; // Đường dẫn đến tập tin font chữ
const fontEncoding = 'Unicode'; // Bảng mã của font chữ

const getdataPDFTransferHistory = () => axios.get('/getRequestTransferHistory').then((res) => res.data)
const getdataRequestTransfer = () => axios.get('/getRequestTransfer').then((res) => res.data)
class RequestHistoryPDFExport extends Component {
    constructor(props) {
        super(props);
        this.state = {

            dataPDFRequestExport: [],
            dataRequestTransfer: [],

            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,


        }
        this._isMounted = false;
        this.currentTodos = this.currentTodos.bind(this)

    }
    componentDidMount() {

        this._isMounted = true

        Promise.all([this.getData()]).then(() => {


        });
        // document.addEventListener('click', this.handleClickOutside);
    }
    componentWillUnmount() {
        this._isMounted = false



        // document.addEventListener('click', this.handleClickOutside);
    }



    // handleClickOutside = (event) => {
    //     if (!event.target.closest('.bx')) {
    //         if (this._isMounted) {  // Kiểm tra trước khi cập nhật state
    //             this.setState({ isShowApproveDateName: false });
    //         }
    //     }
    // }




    currentTodos = (dataPDF) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataPDF.length;
        return dataPDF && dataPDF.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
    }




    getData = async () => {
        this._isMounted = true
        try {


            const [dataRequestTransfer, dataPDFRequestExport] = await Promise.all([
                getdataRequestTransfer(),
                getdataPDFTransferHistory(),

            ]);

            const { tokenObj } = this.props || [];

            if (dataRequestTransfer) {

                if (this._isMounted) {

                    this.setState({
                        dataRequestTransfer: dataRequestTransfer.rows,

                    })
                }
            }

            if (dataPDFRequestExport) {

                if (this._isMounted) {
                    this.sortByDate(dataPDFRequestExport.rows)

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
    sortByDate = (dataPDF) => {
        const groupedData = {};
        const { dataRequestTransfer } = this.state;

        let orderedGroups;
        dataPDF.forEach(item => {
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
                // Lọc các phần tử trong dataRequest có cùng idHistory với value
                const dataPDF = dataRequestTransfer.filter(item => item.requestIdHistory === value.idHistory);

                // Kiểm tra từng phần tử trong dataPDF với điều kiện phân quyền
                const hasPermission = dataPDF.every(item => {
                    const result = !this.checkPermissionApprove(item);

                    return result;
                });

                // Nếu tất cả phần tử trong dataPDF đều thỏa mãn điều kiện phân quyền, giữ lại value
                return hasPermission;
            });

            this.setState({
                // dataPDFTeamp: dataPDF,
                dataPDFRequestExport: filteredData,

                // totalPage: sortedData.length
            });
        }
    }

    checkPermissionApprove = (value) => {

        const { permission, department, memberName } = this.props;

        if ((permission !== 'Lãnh đạo' && permission !== 'Admin' && permission !== 'Trưởng phòng') &&
            value.requestTransferMaker === memberName && value.requestTransferDepartment === department) {

            // thành viên sẽ thấy đơn của mình tạo, khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        } else if (permission === 'Trưởng phòng' &&
            value.requestTransferDepartment === department && department !== 'Kế toán') {
            // trưởng phòng sẽ thấy đơn tạo của bộ phận mình, và thu mua đã được duyệt
            return false;
        } else if (permission === 'Trưởng phòng' && department === 'Kế toán') {
            // trưởng phòng kế toán sẽ thấy đơn người trước đã duyệt hết, sau đó tới chính mình duyệt
            return false;
        } else if (permission === 'Lãnh đạo' || permission === 'Thành viên kho') {
            return false;
        } else {
            return true;
        }
    }


    // pageination
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
    }




    exportPDFTransfer = (idRequests) => {
        //1
        const { dataRequestTransfer } = this.state;

        // cập nhật ngày hiện tại in 
        const dateUpdate = UpdateDateTime()

        // Lọc ra các phần tử có idRequest tương ứng với giá trị mong muốn
        const dataPDFExportPDF = dataRequestTransfer.filter(row => parseInt(row.requestTransferComplete) === 2 && idRequests.includes(row.id)) || [];
        // Gán giá trị idHistory cho các phần tử được lọc

        dataPDFExportPDF.forEach(row => {
            row.requestDateUpdate = dateUpdate
        })

        // Tính tổng của requestTransferIntoMoney
        const totalRequestTransferIntoMoney = dataPDFExportPDF.reduce((total, row) => {
            return total + parseFloat(row.requestTransferIntoMoney);
        }, 0);
        // Tạo một mảng chứa các dòng dữ liệu cho bảng


        const data = dataPDFExportPDF.length !== 0 && dataPDFExportPDF.map(row => {
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
        const ids = dataPDFExportPDF.map(row => row.id);
        const requestTransferMaker = dataPDFExportPDF.map(row => row.requestTransferMaker);
        const requestDateVouchers = dataPDFExportPDF.map(row => row.requestDateVouchers);

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
                // [dataPDFExportPDF[0].requestTransferFromWarehouse, '', '', '', '', ''], // Thêm một cột mới ở đầu tiên
                ['Từ kho', 'Đến kho', 'Tên hàng', 'Đơn vị tính', 'Mã hàng', 'Số lượng duyệt', 'Tổng số lượng xuất', 'Số lượng xuất', 'Đơn giá', 'Thành tiền']
            ],
            body: [
                // [dataPDFExportPDF[0].requestTransferFromWarehouse || '', '', '', '', '', ''], // Dòng chứa requestTransferFromWarehouse
                ...data, // Dữ liệu từ dataPDFExportPDF


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


    exportPDFTransferApproved = (idRequests) => {
        // caseRequest 0
        const { dataRequestTransfer } = this.state;
        // Lọc ra các phần tử có idRequest tương ứng với giá trị mong muốn


        const dataRequestExportPDF = dataRequestTransfer.filter(row => parseInt(row.requestTransferComplete) === 2 && idRequests.includes(row.id));


        // Tạo một mảng chứa các dòng dữ liệu cho bảng


        const data = dataRequestExportPDF.length !== 0 && dataRequestExportPDF.map(row => {
            return [
                // row.requestTransferFromWarehouse,
                row.requestTransferToWarehouse,
                row.warehouseItemsCode,
                row.requestTransferItemsName,
                row.requestTransferUnit,
                parseFloat(row.requestTransferAmountApproved).toLocaleString('en-US', { maximumFractionDigits: 0 }),
                '________'
                // của số lượng xuất để trống là ______
            ] || []
        });

        // Thêm font vào tài liệu PDF (nếu cần)
        const fontSize = 8; // Đặt kích thước chữ
        const pageWidth = 610; // Đặt chiều rộng của trang
        const pageHeight = 620; // Đặt chiều cao của trang
        // Tạo một đối tượng PDF mới
        const pdf = new jsPDF({
            orientation: 'p', // Chiều rộng lớn hơn chiều cao (landscape)
            unit: 'pt', // Đơn vị là điểm
            format: [pageWidth, pageHeight] // Kích thước trang giấy
        });
        pdf.addFont(fontFile, fontName, fontEncoding);

        // Sử dụng font đã thêm vào khi vẽ text
        pdf.setFont(fontName); // Đặt font cho văn bản là font đã thêm vào
        // Lưu trạng thái đồ họa hiện tại
        pdf.saveGraphicsState();

        // Tiêu đề
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 255); // Đặt màu chữ là màu xanh blue
        pdf.setFont('bold'); // Đặt text in đậm
        pdf.text('Tiêu đề', pageWidth / 2, 20, { align: 'center' });
        // Khôi phục trạng thái đồ họa trước đó
        pdf.restoreGraphicsState();

        // Thiết lập màu nền cho các ô trong body của bảng
        pdf.setFillColor(255, 255, 255); // Đặt màu nền là màu trắng (hoặc màu khác tùy ý)

        // Đường dẫn của hình ảnh
        const imagePath = '../icons/color/pdf-file.png';

        // Thiết lập vị trí và kích thước của hình ảnh
        const imageX = 20; // Vị trí X
        const imageY = 20; // Vị trí Y
        const imageWidth = 50; // Chiều rộng
        const imageHeight = 50; // Chiều cao

        // Thêm hình ảnh vào tài liệu PDF
        pdf.addImage(imagePath, 'PNG', imageX, imageY, imageWidth, imageHeight);


        // Thiết lập bảng title
        const tableOptionsTitle = {
            startY: 80,
            body: [

                ['Ngày tạo', '22/4/2024', 'Mô tả', '', '', 'Ghi chú', '', ''],
                ['Ngày Giao', '24/4/2024', '', '', '', '', '', '']
            ],
            margin: { top: 20, left: 20, right: 20 },
            styles: { font: fontName, fontSize: fontSize },
            headStyles: {
                fontStyle: 'bold',
                halign: 'center',
                textColor: [0, 0, 0], // Màu chữ (đen)
                // lineWidth: 1, // Độ dày của border
                lineColor: [205, 205, 205] // Màu của border
            },

            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 80 },
                2: { cellWidth: 50 },
                3: { cellWidth: 50 },
                4: { cellWidth: 100 },
                5: { cellWidth: 200 },
                6: { cellWidth: 10 },
                7: { cellWidth: 20 },
                // 5: { cellWidth: 200 }
            },

        };
        // Thiết lập border cho toàn bộ bảng
        pdf.autoTable(tableOptionsTitle);
        pdf.setFillColor(255, 255, 255); // Đặt màu nền là màu trắng (hoặc màu khác tùy ý)

        pdf.setLineWidth(1); // Độ dày của border top
        pdf.setDrawColor(205, 205, 205); // Màu của border top


        pdf.setLineWidth(3); // Độ dày mới của border

        pdf.line(20, 80, pageWidth - 30, 80); // Vẽ border top của cột
        pdf.line(20, 139, pageWidth - 30, 139); // Vẽ border bottom của cột


        const transferFromWarehouseText = 'Từ kho ' + dataRequestExportPDF[0].requestTransferFromWarehouse;

        // Thêm dòng chứa requestTransferFromWarehouse vào body
        const rowWithTransferFromWarehouse = [transferFromWarehouseText, '', '', '', ''];


        const tableOptions = {
            startY: 140,
            head: [
                // [dataRequestExportPDF[0].requestTransferFromWarehouse, '', '', '', '', ''], // Thêm một cột mới ở đầu tiên
                ['Đến kho', 'Mã hàng', 'Tên hàng', 'Đơn vị tính', 'Số lượng duyệt', 'Số lượng xuất']
            ],
            body: [
                // [{ 'Từ kho' dataRequestExportPDF[0].requestTransferFromWarehouse } || '', '', '', '', ''], // Dòng chứa requestTransferFromWarehouse
                ...data, // Dữ liệu từ dataRequestExportPDF

            ],
            margin: { top: 20, left: 20, right: 20 },
            styles: { font: fontName, fontSize: fontSize }, // Sử dụng font đã tải và kích thước chữ đã đặt
            encoding: fontEncoding, // Sử dụng encoding mặc định
            columnStyles: {
                0: { cellWidth: 90, halign: 'center' },
                1: { cellWidth: 140, halign: 'center', },
                2: { cellWidth: 140, halign: 'center', },
                3: { cellWidth: 50, halign: 'center' },
                4: { cellWidth: 50, halign: 'center' },
                5: { cellWidth: 90, halign: 'center' },


            },
            autoSize: 'wrap',
            headStyles: {
                fontStyle: 'bold', // Chữ in đậm
                halign: 'center', // Căn giữa

            },
            bodyStyles: {
                // textColor: [
                //     [255, 0, 0], // Màu hồng cho dòng đầu tiên
                //     // Các dòng khác giữ nguyên màu chữ
                // ]
                // textColor:[255,0,0]
            },
            rowHeight: 20 // Điều chỉnh chiều cao của các hàng trong bảng
        };

        // Thêm dòng chứa requestTransferFromWarehouse vào body


        tableOptions.body.unshift(rowWithTransferFromWarehouse);


        const lineWidth = 2; // Độ dày của đường kẻ
        const fontSizeTextValue = 10; // Kích thước chữ
        pdf.setFontSize(fontSizeTextValue);


        const text3 = "_________";
        const text4 = "_________";


        // Tính toán kích thước của từng đoạn văn bản
        const text3Width = pdf.getStringUnitWidth(text3) * fontSizeTextValue / pdf.internal.scaleFactor;
        const text4Width = pdf.getStringUnitWidth(text4);

        // Tính toán vị trí của đoạn văn bản thứ ba
        const text3X = tableOptions.margin.left + 50; // Cách bên trái 100 điểm
        const text3Y = pageHeight - 55; // Cách trên 100 điểm so với văn bản thứ nhất
        // const text3Y = tableOptions.startY + tableOptions.rowHeight * data.length + 405; // Cách trên 100 điểm so với văn bản thứ nhất
        // Vẽ đường kẻ dưới văn bản thứ ba
        pdf.setLineWidth(lineWidth); // Độ dày của đường kẻ
        // pdf.line(text3X, text3Y + 2, text3X + text3Width, text3Y + 2); // Vẽ đường kẻ dưới văn bản thứ ba

        // Thêm văn bản thứ ba vào tài liệu PDF
        pdf.text(text3, text3X, text3Y);

        // Tính toán vị trí của đoạn văn bản thứ tư để đặt cạnh đoạn văn bản thứ hai
        const text4X = text3X + text4Width + 400; // Cách bên trái 400 điểm so với văn bản thứ ba
        const text4Y = text3Y; // Giữ cùng một vị trí Y với văn bản thứ ba
        // Vẽ đường kẻ dưới văn bản thứ tư
        pdf.setLineWidth(lineWidth); // Độ dày của đường kẻ
        // pdf.line(text4X, text4Y + 2, text4X + text4Width, text4Y + 2);
        // Thêm văn bản thứ tư vào tài liệu PDF
        pdf.text(text4, text4X, text4Y);

        const text5 = "Xuất hàng bởi";
        const text6 = "Nhận bởi";


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
        const text6X = text5X + text6Width + 400; // Cách bên trái 400 điểm so với văn bản thứ ba
        const text6Y = text5Y; // Giữ cùng một vị trí Y với văn bản thứ ba

        // Thêm văn bản thứ tư vào tài liệu PDF
        pdf.text(text6, text6X, text6Y);
        pdf.setLineWidth(lineWidth); // Độ dày của đường kẻ


        pdf.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30); // Vẽ border top từ (5, 80) đến (560, 80)
        pdf.setLineWidth(2)
        pdf.text(UpdateDateTime(), 20, pageHeight - 20)
        // Vẽ bảng vào PDF
        pdf.autoTable(tableOptions);


        pdf.save('DS_yeu_cau_xuat_da_duyet.pdf', { returnPromise: true })

            .catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Lỗi xuất file PDF kiểm tra lại thông tin!</i></div>)
            });


    }


    showFormRow = () => {
        const { dataPDFRequestExport } = this.state;
        const { permission } = this.props || ''
        if (dataPDFRequestExport.length > 0) {
            const currentTodos = this.currentTodos(dataPDFRequestExport)

            return currentTodos.map((value, key) => {
                let caseRequest = value.caseRequest !== null ? value.caseRequest : 2
                if (parseInt(caseRequest) === 1) {

                    return (
                        <tr key={key}>

                            <td>{value.idHistory}</td>
                            <td>{value.idRequestTransfers}</td>
                            <td>{value.dateCreated}</td>
                            <td>

                                <img style={{ width: '50px', cursor: 'pointer' }} onClick={() => this.exportPDFTransfer(value.idRequestTransfers)} title='Xuất file PDF' src='../icons/color/pdf-download.png' />

                            </td>
                        </tr>
                    )
                }
                else if (permission === 'Thành viên kho' && parseInt(caseRequest) === 0) {
                    return (
                        <tr key={key}>

                            <td>{value.idHistory}</td>
                            <td>{value.idRequestTransfers}</td>
                            <td>{value.dateCreated}</td>
                            <td>

                                <img style={{ width: '50px', cursor: 'pointer' }} onClick={() => this.exportPDFTransferApproved(value.idRequestTransfers)} title='Xuất file PDF 2' src='../icons/color/pdf-download.png' />

                            </td>
                        </tr>
                    )
                }

            })

        }
    }



    render() {

        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        {/* <RequestInto/> */}
                    </div>
                    <div className="head">
                        <h3>Danh mục tệp PDF</h3>

                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    <th >Mã PDF</th>
                                    <th >Mã hàng</th>

                                    <th >Ngày tạo</th>
                                    <th >Tải xuống PDF</th>




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
                                this.state.dataPDFRequestExport.length !== 0
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
const mapStateToProps = (state, ownProps) => {
    return {
        permission: state.allReducer.permission,
        department: state.allReducer.department,
        memberName: state.allReducer.memberName,

    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getDataSearch: (action_dataSearch) => {
            dispatch(dataSearch(action_dataSearch))
        },


    }
}
export default connect(mapStateToProps, mapDispatchToProps)(RequestHistoryPDFExport)
