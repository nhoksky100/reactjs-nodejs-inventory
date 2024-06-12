import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
// import { UpdateDateTime } from '../../UpdateDateTime.jsx';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom.js';
// import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
// import Select from 'react-select'
// import RequestInto from './RequestInto.jsx';
const getdataRequest = () => axios.get('/getRequestTransfer').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataTransferExportApprover = () => axios.get('/getTransferExportApprover').then((res) => res.data)

class RequestListReturn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataMember: [],
            dataTransferExportApprove: [],

            departmentApproveDate: '',
            memberName: '',
            idRequest: '',
            idRequestTeamp: '',
            idApproveReturn: '',

            permission: '',
            userName: '',

            flagPositionDetailApprove: false,
            isShowApproveDateName: false,

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
        document.addEventListener('click', this.handleClickOutside);
    }
    componentWillUnmount() {
        this._isMounted = false
        document.addEventListener('click', this.handleClickOutside);
    }

    handleClickOutside = (event) => {
        if (!event.target.closest('.bx')) {
            if (this._isMounted) {  // Kiểm tra trước khi cập nhật state
                this.setState({ isShowApproveDateName: false });
            }
        }
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


            const [dataRequest, dataMember, dataTransferExportApprove, dataListAccount] = await Promise.all([
                getdataRequest(),
                getdataMember(),
                getdataTransferExportApprover(),
            ]);





            if (dataListAccount) {
                // Gọi hàm isBcryptPermission để xử lý quyền
                await this.isBcryptPermission(dataListAccount.rows);
            }
            const { tokenObj } = this.props || [];

            if (dataRequest) {
                if (this._isMounted) {
                    const filteredData = dataRequest.rows.filter(value => {

                        // const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
                        return value.requestTransferStatus === 'Từ chối'
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

            if (dataTransferExportApprove) {
                if (this._isMounted) {
                    this.setState({ dataTransferExportApprove: dataTransferExportApprove.rows })
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

    approvedOrder = (idRequest) => {
        const { idRequestTeamp, flagPositionDetailApprove, } = this.state;
        if (idRequestTeamp === idRequest && flagPositionDetailApprove) {
            if (this._isMounted) {
                this.setState({
                    flagPositionDetailApprove: false,
                    idRequest: idRequest,
                    idRequestTeamp: '',

                })
            }
        } else {
            if (this._isMounted) {
                this.setState({
                    flagPositionDetailApprove: true,
                    idRequest: idRequest,
                    idRequestTeamp: idRequest,

                })
            }
        }

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



    showFormRow = () => {
        const { dataRequest,idRequestTeamp } = this.state;
        if (dataRequest) {
            const currentTodos = this.currentTodos(dataRequest)
            return currentTodos.map((value, key) => {

                const approveted = value.requestTransferApprove !== null ? value.requestTransferApprove.split(',') : ''
                const pointApprove = value.requestTransferPointApprove !== null ? value.requestTransferPointApprove.split(',') : ''
                return (
                    <tr key={key} >
                           <td className='flagDate' ><input onClick={() => this.approvedOrder(value.id)}
                                onChange={() => { }}
                                checked={idRequestTeamp === value.id}  // Kiểm tra xem checkbox có được chọn hay không
                                style={{ cursor: 'pointer' }} type="checkbox" name="" id=""
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
                        <td >{value.requestTransferAmountExport !== null && parseFloat(value.requestTransferAmountExport).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.requestTransferUnitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                        <td >{parseFloat(value.requestTransferIntoMoney).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>

                        <td >
                            <span className='statusRed' >
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


    render() {

        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        {/* <RequestInto/> */}
                    </div>
                    <div className="head">
                        <h3>Danh mục xuất đơn từ chối</h3>
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

                </div>

            </div >
        );
    }
}

export default RequestListReturn;