import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
// import { UpdateDateTime } from '../../../UpdateDateTime.jsx';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';
// import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { UpdateDateTime } from '../../UpdateDateTime';
// import Select from 'react-select'
// import RequestInto from './RequestInto.jsx';
const fontName = 'Arial';
const fontFile = '../font/arial.ttf'; // Đường dẫn đến tập tin font chữ
const fontEncoding = 'Unicode'; // Bảng mã của font chữ
const getdataRequest = () => axios.get('/getRequestTransfer').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)

class TransferExportApproved extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataMember: [],


            memberName: '',
            departmentApproveDate: '',
            idHistory:'',
            idRequest: '',
            idRequestTeamp: '',
            idApproveReturn: '',
            checkedIds: [],
            permission: '',
            userName: '',

            sortOrder: 'asc', // Thứ tự sắp xếp: 'asc' (tăng dần) hoặc 'desc' (giảm dần)
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

            const [dataRequest, dataMember, dataListAccount] = await Promise.all([
                getdataRequest(),
                getdataMember()

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
                        return value.requestTransferStatus === 'Đã duyệt' && parseInt(value.requestTransferComplete) === 1
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
            const key = item.requestDateUpdate;
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

    approvedOrder = (idRequest) => {
        const { idRequestTeamp, flagPositionDetailApprove } = this.state;
        if (idRequestTeamp === idRequest && flagPositionDetailApprove) {
            this.setState({
                flagPositionDetailApprove: false,
                idRequest: idRequest,
                idRequestTeamp: ''
            })
        } else {

            this.setState({
                flagPositionDetailApprove: true,
                idRequest: idRequest,
                idRequestTeamp: idRequest
            })
        }

    }

    handleExportPDF = () => {
        const { checkedIds, dataRequest,idHistory } = this.state;
        // Lọc ra các phần tử có idRequest tương ứng với giá trị mong muốn

        if (checkedIds.length === 0) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Chọn ít nhất một dòng để xuất file PDF!</i></div>)
            return;
        }

        const dataRequestExportPDF = dataRequest.filter(row => checkedIds.includes(row.id));

        // const pdf = new jsPDF();
        // kiểm tra nhà cung cấp có chưa



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

        // pdf.line(5, 80, pageWidth - 30, 80); // Vẽ border top từ (5, 80) đến (560, 80)
        // pdf.line(5, 139.5, pageWidth - 30, 139.5); // Vẽ border top từ (5, 80) đến (560, 80)

        // Tính toán vị trí bắt đầu và kết thúc của cột
        // const columnWidths = [50, 80, 50, 50, 100, 200, 10, 20]; // Độ rộng của từng cột
        // let startX = 20; // Vị trí bắt đầu của cột
        // for (let i = 0; i < columnWidths.length; i++) {
        //     const columnWidth = columnWidths[i];
        //     const endX = startX + columnWidth; // Vị trí kết thúc của cột

        //     // Vẽ border top từ vị trí bắt đầu đến vị trí kết thúc của cột
        //     pdf.setDrawColor(205, 205, 205); // Màu của border top
        //     // Tăng độ dày của border top và bottom lên 5
        //     pdf.setLineWidth(3); // Độ dày mới của border

        //     pdf.line(startX, 80, endX, 80); // Vẽ border top của cột
        //     pdf.line(startX, 139, endX, 139); // Vẽ border bottom của cột

        //     startX = endX; // Di chuyển vị trí bắt đầu sang phải cho cột tiếp theo
        // }
        // Thêm một dòng trống
        // pdf.text('', 10, 150);
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
        // const text1 = "nguoi duyet 1";
        // const text2 = "nguoi duyet 2";
        // // Tính toán kích thước của từng đoạn văn bản
        // const text1Width = pdf.getStringUnitWidth(text1) * fontSizeTextValue / pdf.internal.scaleFactor;
        // const text2Width = pdf.getStringUnitWidth(text2);

        // // Tính toán vị trí của đoạn văn bản thứ nhất
        // const text1X = tableOptions.margin.left + 50; // Cách bên trái 100 điểm
        // const text1Y = pageHeight - 60; // Cách bên trên 200 điểm
        // // const text1Y = tableOptions.startY + tableOptions.rowHeight * data.length + 400; // Cách bên trên 200 điểm

        // // Thêm văn bản thứ nhất vào tài liệu PDF

        // pdf.text(text1, text1X, text1Y);

        // // Tính toán vị trí của đoạn văn bản thứ hai để đặt cạnh đoạn văn bản thứ nhất
        // const text2X = text1X + text2Width + 400; // Cách bên trái 100 điểm so với văn bản thứ nhất
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
            .then(() => {
                // Lưu trữ giá trị của supplierNames vào biến tạm thời trước khi xuất file PDF
                let requestTransferComplete = 2;
                axios.post('/updateAppremovedTransferComplete', { requestTransferComplete, dataRequestExportPDF })
                    .then(res => {

                        this.setState({
                            dataExported: data,
                            dataRequestExportPDF: [],
                            idRequestTeamp: '',
                            idRequest: '',
                            checkedIds: [],
                            idHistory: randomId()
                        });
                        return axios.post('/intoRequestTransferExportHistory', { idHistory, idRequestTransfers: checkedIds.join(','), caseRequest: 0, dateCreated: UpdateDateTime() });

                    })

                    .then(() => {
                        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            <i>Xuất file PDF thành công!</i></div>);
                        this.getData();
                    })



            })
            .catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Lỗi xuất file PDF kiểm tra lại thông tin!</i></div>)
            });


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

    showFormRow = () => {
        const { dataRequest, idRequestTeamp } = this.state;

        if (dataRequest) {
            const currentTodos = this.currentTodos(dataRequest)
            return currentTodos.map((value, key) => {
                if (parseInt(value.requestTransferComplete) === 1 && value.requestTransferStatus === 'Đã duyệt') {
                    const approveted = value.requestTransferApprove !== null ? value.requestTransferApprove.split(',') : ''
                    const pointApprove = value.requestTransferPointApprove !== null ? value.requestTransferPointApprove.split(',') : ''
                    return (
                        <tr key={key} >
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
                            <td >{value.requestTransferFromWarehouse}</td>
                            <td >{value.requestTransferToWarehouse}</td>
                            <td >{value.requestTransferMaker}</td>
                            <td style={{ padding: '15px' }} >
                                {this.arrayApproveted(approveted, pointApprove)}

                            </td>
                            <td >{value.requestTransferItemsName}</td>
                            <td >{value.requestTransferUnit}</td>
                            <td >{parseFloat(value.requestTransferAmountApproved).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                            {/* <td >{value.requestTransferAmountExport !== null && parseFloat(value.requestTransferAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td> */}
                            <td >{parseFloat(value.requestTransferUnitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                            <td >{parseFloat(value.requestTransferIntoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>

                            <td >
                                <span className='statusGreen' >
                                    {value.requestTransferStatus}
                                </span>
                            </td>

                            <td >{value.requestDateCreated}</td>
                            <td >{value.requestDateUpdate}</td>

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

                    <div className="head">
                        <h3>Danh mục xuất đơn đã duyệt</h3>
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
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferMaker')}  >Người tạo  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferApprove')}  >Người duyệt  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferItemsName')}  >Tên hàng  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferUnit')}  >Đơn vị tính  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferAmountApproved')}  >Số lượng được duyệt <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferUnitPrice')}  >Đơn giá (VND)  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferIntoMoney')}  >Thành tiền (VND)  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestTransferStatus')}  >Trạng thái  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestDateCreated')}  >Ngày tạo  <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('requestDateUpdate')}  >Ngày cập nhật  <i className='bx bx-sort sort' /></th>

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

export default TransferExportApproved;