import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
// import { UpdateDateTime } from '../../UpdateDateTime.jsx';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';
// import { toast } from 'react-toastify';
// import { randomId } from '../../RandomId/randomId.jsx'
import Pagination from "react-js-pagination";
// import { UpdateDateTime } from '../../UpdateDateTime';
// import { connect } from 'react-redux';
import RequestAmountOrder from './RequestAmountOrder';


const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)


class RequestListIntoAll extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],


            // show reason approve not
            showModal: false,

            // pagination
            currentPage: 1,
            newsPerPage: 4, // show 5 product
            totalPage: 0,
            // request order count
            countRequestNotApprove: 0,
            countRequestApproved: 0,
            countRequestApproveReturn: 0,
            countRequestAll: 0,

        }
        this._isMounted = false
        this.currentTodos = this.currentTodos.bind(this)

    }
    componentDidMount() {

        this._isMounted = true

        Promise.all([this.getData()]).then(() => {


        });

    }
    componentWillUnmount() {
        this._isMounted = false

    }
    componentDidUpdate = (prevProps, prevState) => {

        const { currentDate } = this.props;
        if (currentDate && currentDate !== prevProps.currentDate) {

            this.getData()
        }
    }



    currentTodos = (dataRequest) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataRequest.length;
        return dataRequest && dataRequest.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
    }



    handleClickOutside = (event) => {
        if (!event.target.closest('.bx')) {
            this.setState({ isShowApproveDateName: false });
        }
    }
    getData = async () => {

        this._isMounted = true
        try {

            const [dataRequest,] = await Promise.all([
                getdataRequest(),


            ]);


            if (dataRequest) {
                const { currentDate, currentDay } = this.props;

                if (this._isMounted) {

                    this.sortByDate(dataRequest.rows, currentDate, currentDay)

                }
            }

        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error occurred while fetching data:", error);
        }




    }
    formatDateTime = (dateTimeStr) => {
        // Tách ngày và giờ từ chuỗi
        if (!dateTimeStr) {
            // Nếu dateTimeStr là null hoặc undefined, trả về null
            return null;
        }
        let [datePart, timePart] = dateTimeStr.split(' - ');

        // Tách ngày, tháng, năm
        let [day, month, year] = datePart.split('/').map(Number);

        // Tách giờ, phút và AM/PM
        let [time, period] = timePart.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        // Điều chỉnh giờ theo AM/PM
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        // Tạo đối tượng Date
        return new Date(year, month - 1, day, hours, minutes);
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
    sortByDate = (dataRequest, currentDate, currentDay) => {

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


            // console.log(currentDay,'b');
            // const date = new Date();
            // const sevenDaysAgo = new Date(date); // Tạo một bản sao của ngày hiện tại
            // sevenDaysAgo.setDate(date.getDate() - 30); // Lùi ngày hiện tại về 7 ngày

            // const weekdayFormat = UpdateDateTime(sevenDaysAgo) //fomat 
            // const dayFormat = UpdateDateTime(date) // format

            // const currentDay =  this.formatDateTime(dayFormat) // current
            // const weekdayCurent = this.formatDateTime(weekdayFormat) //current

            // Lọc dữ liệu theo khoảng thời gian từ ngày hiện tại đến 7 ngày trước đó
            const filteredData = sortedData.filter(item => {
                const itemDate = this.formatDateTime(item.dateCreated);

                return itemDate >= currentDate && itemDate <= currentDay;
            });

            // const filteredData = dataRequest.filter(item => item.dateCreated === date); // Lọc dữ liệu theo ngày hiện tại
            const countRequestNotApprove = filteredData.filter(item => item.statusOrder === 'Chờ duyệt').length || 0
            const countRequestApproved = filteredData.filter(item => item.statusOrder === 'Đã duyệt').length || 0
            const countRequestApproveReturn = filteredData.filter(item => item.statusOrder === 'Từ chối').length || 0
            const countRequestAll = filteredData.length
            // console.log(countRequestAll, 'countRequestAll');
            this.setState({
                // dataRequestTeamp: dataRequest,
                dataRequest: filteredData,
                countRequestNotApprove,
                countRequestApproved,
                countRequestApproveReturn,
                countRequestAll,
                // totalPage: filteredData.length
            });
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


    // pageination
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
    }

    showFormRow = () => {
        const { dataRequest } = this.state;
        if (dataRequest) {
            const currentTodos = this.currentTodos(dataRequest)
            return currentTodos.map((value, key) => {
                return (
                    <tr key={key} >


                        <td >{value.orderName}</td>

                        <td >{parseFloat(value.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.unitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.intoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{value.dateCreated}</td>
                        <td >
                            <span className=
                                {value.statusOrder === 'Chờ duyệt' ? 'statusYellow' : value.statusOrder === 'Đã duyệt' ? 'statusGreen' : 'statusRed'}>
                                {value.statusOrder}
                            </span>
                        </td>
                        <td >{value.department}</td>
                    </tr>
                )

            })
        }
    }


    render() {
        const { countRequestNotApprove, countRequestApproved, countRequestApproveReturn, countRequestAll, } = this.state;
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        {/* <RequestInto/> */}
                    </div>
                    <div className="head">
                        <h3>Đơn yêu cầu</h3>

                        {/* <i className="bx bx-filter" /> */}
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>

                                    <th >Tên hàng</th>
                                    <th >Số lượng</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Thành tiền (VND)</th>
                                    <th >Ngày tạo</th>
                                    <th >Trạng thái</th>
                                    <th >Bộ phận</th>

                                </tr>
                            </thead>
                            <tbody>
                                {this.showFormRow()}
                            </tbody>
                        </table>
                    </div>
                    {this.state.dataRequest.length > 0 &&

                        <div className="pagination">

                            <Pagination
                                activePage={this.state.currentPage}
                                itemsCountPerPage={this.state.newsPerPage}
                                totalItemsCount={
                                    this.state.dataRequest.length !== 0
                                        ? this.state.totalPage
                                        : 0
                                }
                                pageRangeDisplayed={4} // show page
                                // firstPageText ={'Đầu'}
                                onChange={this.handlePageChange.bind(this)}
                            />

                        </div>
                    }
                </div>

                <RequestAmountOrder
                    countRequestNotApprove={countRequestNotApprove}
                    countRequestApproved={countRequestApproved}
                    countRequestApproveReturn={countRequestApproveReturn}
                    countRequestAll={countRequestAll}
                />
            </div >
        );
    }
}

export default RequestListIntoAll
