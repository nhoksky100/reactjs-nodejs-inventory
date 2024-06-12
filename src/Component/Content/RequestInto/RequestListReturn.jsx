import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
// import { UpdateDateTime } from '../../UpdateDateTime.jsx';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';
// import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import Pagination from 'react-js-pagination';
// import RequestInto from './RequestInto.jsx';
const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataApproveOrder = () => axios.get('/getApproveOrder').then((res) => res.data)

class RequestListReturn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataMember: [],
            dataApproveDate: [],
            memberName: '',
            departmentApproveDate: '',
            idRequest: '',
            idRequestTeamp: '',
            flagPositionDetailApprove: false,
            isShowApproveDateName: false,
            permission: '',
            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,
        }
        this.currentTodos = this.currentTodos.bind(this)
        this._isMounted = false
    }
    componentDidMount() {

        this._isMounted = true
        this.getData()
        document.addEventListener('click', this.handleClickOutside);
    }
    componentWillUnmount() {
        this._isMounted = false
        document.removeEventListener('click', this.handleClickOutside);
    }


    handleClickOutside = (event) => {
        if (!event.target.closest('.bx')) {
            if (this._isMounted) {  // Kiểm tra trước khi cập nhật state
                this.setState({ isShowApproveDateName: false });
            }
        }
    }
    getData = () => {
        this._isMounted = true
        const { tokenObj } = this.props || [];
        getdataRequest().then((res) => {
            if (res) {

                this.sortByDate(res.rows)
            }
        })
        getdataApproveOrder().then((res) => {
            if (res) {
                if (this._isMounted) {
                    this.setState({ dataApproveDate: res.rows.reverse() })
                }
            }
        })
        getdataMember().then((res) => {
            if (res) {
                res.rows.map((value) => {
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
                })
                if (this._isMounted) {
                    this.setState({ dataMember: res.rows.reverse() })
                }
            }
        })
    }

    currentTodos = () => {
        const { currentPage, newsPerPage, dataRequest } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        // this.state.totalPage = dataRequest.length;
        return dataRequest && dataRequest.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
    }

    // pageination currentpage
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
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
        let pushDataRule = []
        sortedData.map((value) => {
            if (value.statusOrder === 'Từ chối') {
                pushDataRule.push(value)
            }
        })

        if (this._isMounted) {

            this.setState({
                // dataRequestTeamp: dataRequest,
                dataRequest: pushDataRule.reverse(),

                totalPage: pushDataRule.length
            });
        }



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
    arrayApproveted = (approveted, pointApprove) => {
        const pushArrayApprove = [];
        if (approveted && pointApprove) {
            for (let i = 0; i < approveted.length; i++) {
                // let className = 'approve-request col-md-2';
                // if (parseInt(pointApprove[i]) === 1) {
                //     className += ' background-approve';
                // } else if (parseInt(pointApprove[i]) === -1) {
                //     className += ' background-approve-return';
                // }
                // console.log(className, 'className');
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

    showFormRow = () => {
        const { dataRequest, idRequestTeamp, } = this.state;

        if (dataRequest.length !== 0) {
            const currentTodos = this.currentTodos()
            // console.log(currentTodos, 'currentTodos');
            return currentTodos.map((value, key) => {
                const approveted = value.orderApprove !== null ? value.orderApprove.split(',') : ''
                const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : ''

                // if (value.statusOrder === 'Từ chối') {
                return (
                    <tr key={key} >
                        <td>
                            <input onClick={() => this.approvedOrder(value.id)}
                                onChange={() => { }}
                                checked={idRequestTeamp === value.id}  // Kiểm tra xem checkbox có được chọn hay không
                                style={{ cursor: 'pointer' }} type="checkbox" name="" id="" title='hiển thị chi tiết người duyệt'
                            />
                        </td>

                        {/* <td >{key + 1}</td> */}
                        <td >{value.orderCode}</td>
                        <td >{value.orderMaker}</td>
                        <td style={{ minWidth: '150px' }} >
                            {this.arrayApproveted(approveted, pointApprove)}

                        </td>
                        <td >{value.orderName}</td>
                        <td >{value.unit}</td>
                        <td >{parseFloat(value.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.unitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.intoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >
                            <span className='statusRed'
                            // {value.statusOrder === 'Chờ duyệt' ? 'statusYellow' : value.statusOrder === 'Đã duyệt' ? 'statusGreen' : 'statusRed'}
                            >
                                {value.statusOrder}
                            </span>
                        </td>
                        <td >{value.department}</td>
                        <td >{value.dateCreated}</td>
                        <td >{value.dateUpdate}</td>
                        <td >{value.orderReason}</td>


                    </tr>
                )

                // }

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
                        <h3>Danh mục đơn từ chối</h3>
                        {
                            this.state.flagPositionDetailApprove &&
                            <div className='view-approved'>
                                {!this.state.isShowApproveDateName &&

                                    <i style={{ fontSize: '20px' }} onClick={() => this.setState({ isShowApproveDateName: !this.state.isShowApproveDateName })} title='xem chi tiết người duyệt' className='bx bxs-user-pin' />
                                }
                                {this.state.isShowApproveDateName &&

                                   
                                    <table border={1} style={{ borderRadius: '10px' }} className='table-data  history-view-approved'>


                                        <tbody style={{ border: 'none' }}>

                                            {this.showApproveDate()}
                                            {/* <tr>
                                                <td>PUR In</td>
                                                <td style={{ justifyContent: 'center' }} >------</td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                    
                                }
                            </div>



                        }
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>


                                    <th><i className='bx bxs-flag-checkered'></i></th>

                                    {/* <th >STT</th> */}
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
                                    <th >Lý do</th>



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

export default RequestListReturn;