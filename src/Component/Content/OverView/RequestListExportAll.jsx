import axios from 'axios';
import React, { Component } from 'react';

import Pagination from "react-js-pagination";
import RequestAmountOrder from './RequestAmountOrder';

const getdataRequest = () => axios.get('/getRequestTransfer').then((res) => res.data)


class RequestListExportAll extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // dataTeamp: null,
            dataRequest: [],
            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,

            // request order count
            countRequestNotApprove: 0,
            countRequestApproved: 0,
            countRequestApproveReturn: 0,
            countRequestAll: 0,

        }
        this.currentTodos = this.currentTodos.bind(this)
    }
    componentDidMount() {
        this._isMounted = true
        Promise.all([this.getData()]).then(() => {

        });

    }
    componentDidUpdate = (prevProps, prevState) => {

        const { currentDate } = this.props;
        if (currentDate && currentDate !== prevProps.currentDate) {

            this.getData()
        }
    }
    componentWillUnmount() {
        this._isMounted = false

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

            const [dataRequest] = await Promise.all([
                getdataRequest(),


            ]);

            if (dataRequest) {
                const { currentDate, currentDay } = this.props;
                if (this._isMounted) {
                    this.sortByDate(dataRequest.rows, currentDate, currentDay)

                }
            }

            // Sau khi tất cả dữ liệu đã được cập nhật, gọi updateNewRowDataListFromDataSet
            // this.updateNewRowDataListFromDataSet();
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error occurred while fetching data:", error);
        }




    }
    // format date
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

            const filteredData = sortedData.filter(item => {
                const itemDate = this.formatDateTime(item.requestDateCreated);

                return itemDate >= currentDate && itemDate <= currentDay;
            });

            // const filteredData = dataRequest.filter(item => item.dateCreated === date); // Lọc dữ liệu theo ngày hiện tại
            const countRequestNotApprove = filteredData.filter(item => item.requestTransferStatus === 'Chờ duyệt').length || 0
            const countRequestApproved = filteredData.filter(item => item.requestTransferStatus === 'Đã duyệt').length || 0
            const countRequestApproveReturn = filteredData.filter(item => item.requestTransferStatus === 'Từ chối').length || 0
            const countRequestAll = filteredData.length
            this.setState({
                // dataRequestTeamp: dataRequest,
                dataRequest: filteredData,
                countRequestNotApprove,
                countRequestApproved,
                countRequestApproveReturn,
                countRequestAll,
                // totalPage: sortedData.length
            });
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
                        <td >{value.requestTransferFromWarehouse}</td>
                        <td >{value.requestTransferToWarehouse}</td>
                        <td >{value.requestTransferMaker}</td>

                        <td >{value.requestTransferItemsName}</td>

                        <td >
                            <span className={parseInt(value.requestTransferComplete) >= 1 ? 'statusGreen' : 'statusYellow'} >
                                {value.requestTransferStatus}
                            </span>
                        </td>

                        <td >{value.requestDateCreated}</td>
                        <td >{parseFloat(value.requestTransferAmountApproved).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{value.requestTransferAmountExport !== null && parseFloat(value.requestTransferAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.requestTransferUnitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.requestTransferIntoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>


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
                        <h3>Danh mục xuất Tất cả đơn</h3>


                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>


                                    {/* <th><i className='bx bxs-flag-checkered'></i></th> */}
                                    <th >Từ Kho</th>
                                    <th >Đến Kho</th>
                                    <th >Người tạo</th>

                                    <th >Tên hàng</th>

                                    <th >Trạng thái</th>
                                    <th >Ngày tạo</th>
                                    <th >Số lượng được duyệt</th>
                                    <th >Số lượng thực xuất</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Thành tiền (VND)</th>




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
                                pageRangeDisplayed={5} // show page
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

export default RequestListExportAll
