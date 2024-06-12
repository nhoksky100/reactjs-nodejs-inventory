import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';

// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';

// import { randomId } from '../../RandomId/randomId.jsx'
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
import { connect } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { dataSearch } from '../../../StoreRcd';
// import { UpdateDateTime } from '../../UpdateDateTime.jsx';

// import FilterTime from '../../FilterTime.jsx';
// import { SearchDate } from '../../SearchDate.jsx';

const fontName = 'Arial';
const fontFile = '../font/arial.ttf'; // Đường dẫn đến tập tin font chữ
const fontEncoding = 'Unicode'; // Bảng mã của font chữ

const getdataRequestHistory = () => axios.get('/getRequestHistory').then((res) => res.data)
const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)

class RequestHistoryPDFInto extends Component {
    constructor(props) {
        super(props);
        this.state = {

            dataPDFRequestInto: [],
            dataRequest: [],

            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,


        }
        this._isMounted = true
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


            const [dataRequest, dataPDFRequestInto] = await Promise.all([
                getdataRequest(),
                getdataRequestHistory(),

            ]);

            const { tokenObj } = this.props || [];

            if (dataRequest) {

                if (this._isMounted) {
                    this.setState({
                        dataRequest: dataRequest.rows,

                    })
                }
            }

            if (dataPDFRequestInto) {

                if (this._isMounted) {
                    this.sortByDate(dataPDFRequestInto.rows)

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
        const { dataRequest } = this.state;

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
                const dataPDF = dataRequest.filter(item => item.idHistory === value.idHistory);

                // Kiểm tra từng phần tử trong dataPDF với điều kiện phân quyền
                const hasPermission = dataPDF.every(item => {
                    const result = !this.checkPermissionApprove(item);

                    return result;
                });

                // Nếu tất cả phần tử trong dataPDF đều thỏa mãn điều kiện phân quyền, giữ lại value
                return hasPermission;
            });

            this.setState({
                dataPDFRequestInto: filteredData,
            });
        }
    }

    checkPermissionApprove = (value) => {
        const { permission, department, memberName } = this.props;

        if ((permission !== 'Lãnh đạo' && permission !== 'Admin' && permission !== 'Trưởng phòng') &&
            value.orderMaker === memberName && value.department === department) {
            // thành viên sẽ thấy đơn của mình tạo, khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        } else if (permission === 'Trưởng phòng' &&
            value.department === department && department !== 'Kế toán') {
            // trưởng phòng sẽ thấy đơn tạo của bộ phận mình, và thu mua đã được duyệt
            return false;
        } else if (permission === 'Trưởng phòng' && department === 'Kế toán') {
            // trưởng phòng kế toán sẽ thấy đơn người trước đã duyệt hết, sau đó tới chính mình duyệt
            return false;
        } else if (permission === 'Lãnh đạo') {
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




    exportPDFInto = (idRequests) => {
        // caseRequest 2

        idRequests = idRequests !== null ? idRequests.split(',') : []
        const { dataRequest } = this.state;

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
        }) || []

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






    showFormRow = () => {
        const { dataPDFRequestInto } = this.state;
        if (dataPDFRequestInto.length > 0) {
            const currentTodos = this.currentTodos(dataPDFRequestInto)
            return currentTodos.map((value, key) => {

                return (
                    <tr key={key}>

                        <td>{value.idHistory}</td>
                        <td>{value.idRequests}</td>

                        <td>{value.dateCreated}</td>
                        <td>
                            <img style={{ width: '50px', cursor: 'pointer' }} onClick={() => this.exportPDFInto(value.idRequests)} title='Xuất file PDF' src='../icons/color/pdf-download.png' />

                        </td>
                    </tr>
                )
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
                                this.state.dataPDFRequestInto.length !== 0
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
export default connect(mapStateToProps, mapDispatchToProps)(RequestHistoryPDFInto)
