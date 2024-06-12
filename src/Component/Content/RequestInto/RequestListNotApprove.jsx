import axios from 'axios';
import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime.jsx';

import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
import Select from 'react-select'
import { connect } from 'react-redux';

const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataApproveOrder = () => axios.get('/getApproveOrder').then((res) => res.data)
const getdataSupplier = () => axios.get('/getSupplier').then((res) => res.data)
const getdataNotification = () => axios.get('/getNotification').then((res) => res.data)

class RequestListNotApprove extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataRequest: [],
            dataMember: [],
            dataApproveDate: [],
            dataSupplier: [],
            dataNotification: [],
            memberName: '',
            departmentApproveDate: '',
            idRequest: '',
            idRequestTeamp: '',
            idApproveReturn: '',
            idApproveDate: '',
            flagPositionDetailApprove: false,
            isShowApproveDateName: false,
            permission: '',
            userName: '',

            // show reason approve not
            showModal: false,
            reasonMessage: '',
            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,
            // supplierNames nhà cung cấp 
            supplierNames: [],
        }
        this._isMounted = false
        this.currentTodos = this.currentTodos.bind(this)
        this.handleChangeSupplierName = this.handleChangeSupplierName.bind(this)
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

    // Function to handle opening the modal
    openModal = (value, pointApprove) => {
        this.setState({ showModal: true, modalValue: value, modalPointApprove: pointApprove });
    }

    // Function to handle closing the modal
    closeModal = () => {
        this.setState({ showModal: false });
    }

    // Function to handle confirming and closing the modal
    handleConfirm = () => {
        const { modalValue, modalPointApprove } = this.state;
        // console.log(modalValue, 'value');

        // alert("Confirmed! Message: " + this.state.reasonMessage);
        this.handleUpdateApproveReturn(modalValue, modalPointApprove)
        this.closeModal();
    }

    // Function to handle input change in the textarea
    handleInputChange = (event) => {
        this.setState({ reasonMessage: event.target.value });
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
            if (this._isMounted) {  // Kiểm tra trước khi cập nhật state
                this.setState({ isShowApproveDateName: false });
            }
        }
    }
    getData = async () => {

        this._isMounted = true
        try {

            const [dataRequest, dataSupplier, dataApproveDate, dataMember, dataNotification, dataListAccount] = await Promise.all([
                getdataRequest(),
                getdataSupplier(),
                getdataApproveOrder(),
                getdataMember(),
                getdataNotification(),

            ]);





            if (dataListAccount) {
                // Gọi hàm isBcryptPermission để xử lý quyền
                await this.isBcryptPermission(dataListAccount.rows);
            }
            const { tokenObj } = this.props || [];

            if (dataRequest) {

                if (this._isMounted) {
                    const {permission, departmentApproveDate, memberName}=this.props;
                    const filteredData = dataRequest.rows.filter(value => {

                        const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
                        return value.statusOrder === 'Chờ duyệt' && parseInt(value.orderComplete) === 0
                       
                    });
                    this.sortByDate(filteredData)
                    // Tính chỉ số của phần tử đầu tiên trên trang hiện tại
                    // const currentTodos = this.currentTodos(filteredData);

                    // this.setState({
                    //     dataRequest: currentTodos,
                    //     totalPage: dataRequest.length,
                    // })
                }
            }



            if (dataSupplier) {
                const supplierNames = dataSupplier.rows.map(supplier => ({ value: supplier.supplierName, label: supplier.supplierName }));

                this.setState({
                    dataSupplier: dataSupplier.rows.reverse(),
                    supplierNames: supplierNames,
                    // supplierNamesTeamp: supplierNames,
                })
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
                        idApproveReturn: id,
                        idApproveDate: id,
                    })
                }

            }
            if (dataNotification) {
                if (this._isMounted) {
                    this.setState({ dataNotification: dataNotification.rows })
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
            const key = item.dateUpdate;
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

            this.setState({
                // dataRequestTeamp: dataRequest,
                dataRequest: sortedData,

                // totalPage: sortedData.length
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

                pushArrayApprove.push(
                    <div key={i} className={parseInt(pointApprove[i]) === 1 ? 'approve-request backgournd-approve col-md-2' : 'approve-request col-md-2'}>{approveted[i]}</div>
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
    checkPermissionApprove = ( pointApprove, value) => {
        const { permission, departmentApproveDate, memberName } = this.state;
        // const { permission, departmentApproveDate, memberName } = this.props;
        
        if (!pointApprove) return false;

    


        if (permission === 'Thành viên thu mua') {
            //  thành viên thu mua sẽ không thấy đơn trong mục này
            return true;
        } else if (permission === 'Thành viên' && value.orderMaker === memberName &&
            value.department === departmentApproveDate) {
            //  thành viên sẽ thấy đơn của mình tạo , khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        }
        else if (permission === 'Thành viên kho' && value.orderMaker === memberName &&
            value.department === departmentApproveDate) {
            //  thành viên kho sẽ thấy đơn của mình tạo , khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        }
        else if (permission === 'Trưởng phòng' &&
            value.department === departmentApproveDate && parseInt(pointApprove[0]) === 1 && parseInt(pointApprove[1]) === 0) {
            //  trưởng phòng sẽ thấy đơn tạo của bộ phận mình , và thu mua đã được duyệt 
            return false;
        }
        else if (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' &&
            parseInt(pointApprove[0]) === 1 && parseInt(pointApprove[1]) === 1 && parseInt(pointApprove[2]) === 0) {


            //  trưởng phòng kế toán sẽ thấy đơn người trước đã duyệt hết, sau đó tới chính mình duyệt
            return false;
        }
        else if (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' && departmentApproveDate === value.orderMaker &&
            parseInt(pointApprove[0]) === 1 && parseInt(pointApprove[2]) === 0) {
            // trưởng phòng kế toán sẽ thấy đơn của bộ phận kế toán tạo đơn và thu mua đã duyệt   

            return false;
        }

        else if (permission === 'Lãnh đạo') {
            return false;
        }
        else {
            return true;
        }
    }


    handleUpdateApproved = (value, pointApprove) => {
        const { dataApproveDate, departmentApproveDate, memberName, reasonMessage, dataNotification, idApproveDate } = this.state;
        // const permissionIndex = this.state.permissionMapping[this.state.permission];
        const { permission } = this.state;
        let notificationPointApprovedInto = 1;
        let flagApprove = false, flagNotApprove = false;
        // dataNotification


        if (permission === 'Lãnh đạo') {
            notificationPointApprovedInto = 4
            pointApprove[3] = 1;
        } else if (parseInt(pointApprove[0]) === 0) {
            flagNotApprove = true
        } else {

            if (parseInt(pointApprove[0]) === 1) {
                if ((permission === 'Trưởng phòng' && parseInt(pointApprove[1]) === 0 && departmentApproveDate !== 'Kế toán'
                    && departmentApproveDate === value.department)) {
                    notificationPointApprovedInto = 2
                    pointApprove[1] = 1; // Bước 1

                } else if (permission === 'Trưởng phòng' && departmentApproveDate !== 'Kế toán' &&
                    departmentApproveDate !== value.department) {
                    flagApprove = true

                } else if (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' &&
                    departmentApproveDate === value.department) {
                    //    duyệt đơn cùng bộ phận kế toán
                    pointApprove[1] = 1;
                    pointApprove[2] = 1;
                    notificationPointApprovedInto = 3


                } else if (permission === 'Trưởng phòng' && departmentApproveDate === 'Kế toán' && parseInt(pointApprove[1]) === 1 &&
                    departmentApproveDate !== value.department) {
                    //    duyệt đơn khác bộ phận kế toán nhưng duyệt chờ bộ phận khác duyệt trước pointApprove[1])===1
                    pointApprove[2] = 1;
                    notificationPointApprovedInto = 3


                }
                else {
                    flagNotApprove = true;

                }




                // Kết thúc vòng lặp sau khi cập nhật điểm duyệt


            }
        }
        if (flagNotApprove) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Người trước chưa duyệt!</i></div>);
        }
        else if (flagApprove) {

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Duyệt sai đơn!</i></div>);
        }
        else {

            const { id } = value;
            const allApproved = pointApprove.every(point => parseInt(point) === 1);
            let statusOrder = allApproved || parseInt(pointApprove[3]) === 1 ? 'Đã duyệt' : 'Chờ duyệt';
            let orderComplete = 0;
            if (statusOrder === 'Đã duyệt') {
                orderComplete = 1
            }
            const orderPointApprove = pointApprove.join(',');

            const idRequest = id;
            const orderCode = value.orderCode;
            const dateUpdate = UpdateDateTime()
            axios.post('/addApproveDate', { id: idApproveDate, orderCode, department: departmentApproveDate, orderApprove: memberName, dateUpdate, idRequest })
                .catch(error => {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Duyệt đơn thất bại!</i></div>);
                });
            axios.post('/updateAppremovedRequest', { id, orderSupplierName: value.orderSupplierName, orderPointApprove, statusOrder, dateUpdate, reasonMessage, orderComplete }).then((res) => {
                const dataNotifi = dataNotification.length > 0 && dataNotification.filter(item => item.idRequest === id) || []
                if (dataNotifi.length > 0) {

                    return axios.post('/updateNotificationPointInto', {
                        idRequest: dataNotifi[0].idRequest, status: statusOrder, pointApprovedInto: notificationPointApprovedInto, isRead: 0, dateCreated: UpdateDateTime()
                    }).catch(error => {
                        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            <i>Duyệt đơn thất bại!</i></div>);
                    });
                }
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Duyệt đơn thành công!</i></div>);

                this.getData();
            }).catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Duyệt đơn thất bại!</i></div>);
            });
        }
    }

    handleUpdateApproveReturn = (value, pointApprove) => {
        const { dataApproveDate, departmentApproveDate, memberName, idApproveReturn, reasonMessage, dataNotification } = this.state;
        // const permissionIndex = this.state.permissionMapping[this.state.permission];
        // let flagApprove = false, flagNotApprove = false;
        const { permission } = this.state;

        for (let i = 0; i < pointApprove.length; i++) {
            if (permission === 'Thành viên thu mua') {
                pointApprove[0] = -1;
            } else if (permission === 'Trưởng phòng') {
                pointApprove[1] = -1;
            }
            // else if (permission === 'Trưởng phòng kế toán') {
            //     pointApprove[2] = -1;
            // }
            else if (permission === 'Lãnh đạo') {
                pointApprove[3] = -1;
            }



        };

        //  if (flagApprove) {
        //     toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
        //         <i>Bạn đã duyệt đơn này rồi!</i></div>);
        // } 
        // else {
        const { id } = value;

        let statusOrder = 'Từ chối'
        const orderPointApprove = pointApprove.join(',');

        // const idApproveDate = idApprove
        const idRequest = id;
        const orderCode = value.orderCode;
        const dateUpdate = UpdateDateTime()
        const orderComplete = 0;
        axios.post('/addApproveDate', { id: idApproveReturn, orderCode, department: departmentApproveDate, orderApprove: memberName, dateUpdate, idRequest })
            .catch(error => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Duyệt đơn thất bại!</i></div>);
            });
        // axios.post('/updateAppe', { id: id, orderCode, department: departmentApproveDate, orderApprove: memberName, dateUpdate, idRequest })

        axios.post('/updateAppremovedRequest', {
            id, orderSupplierName: value.orderSupplierName, orderPointApprove,
            statusOrder, dateUpdate, reasonMessage, orderComplete
        }).then((res) => {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />

                <i>Duyệt trả đơn thành công!</i></div>);
            const dataNotifi = dataNotification.length > 0 && dataNotification.filter(item => item.idRequest === id) || []
            if (dataNotifi.length > 0) {

                return axios.post('/updateNotificationPointInto', {
                    idRequest: dataNotifi[0].idRequest, status: statusOrder, pointApprovedInto: -1, isRead: 0, dateCreated: UpdateDateTime()
                }).catch(error => {
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Duyệt đơn thất bại!</i></div>);
                });
            }
            this.getData();

        }).catch(error => {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Duyệt trả đơn thất bại!</i></div>);
        });
        // }
    }

    // pageination
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
    }

    // permission Lãnh đạo supplier ?
    handleChangeSupplierName = (selectedOption, id) => {
        // Tìm đối tượng trong dataRequest có id tương ứng với id được chọn
        const selectedDataIndex = this.state.dataRequest.findIndex(item => item.id === id);

        // Kiểm tra xem đã tìm thấy đối tượng hay không
        if (selectedDataIndex !== -1) {
            // Sao chép mảng dataRequest để thay đổi một cách an toàn
            const updatedDataRequest = [...this.state.dataRequest];
            // Cập nhật supplierName vào đối tượng đã tìm thấy
            updatedDataRequest[selectedDataIndex].orderSupplierName = selectedOption.value; // Lưu ý: selectedOption chứa giá trị được chọn từ dropdown

            // Cập nhật lại state cho dataRequest
            this.setState({
                dataRequest: updatedDataRequest
            });
        } else {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Không tìm thấy nhà cung cấp!</i></div>)
        }
    }

    showFormRow = () => {
        const { dataRequest, idRequestTeamp, permission, currentPage, newsPerPage, supplierNames } = this.state;
        if (dataRequest) {
            const filteredData = dataRequest.filter(value => {

                const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
                return !this.checkPermissionApprove(pointApprove, value)
            });
            const currentTodos = this.currentTodos(filteredData)
            // Tính chỉ số của phần tử đầu tiên trên trang hiện tại
            // const indexOfFirstNews = (currentPage - 1) * newsPerPage;
            // let countRow = 0; // Biến đếm chỉ số của dòng
            // console.log(filteredData,'filteredData');
            return currentTodos.map((value, key) => {

                const approveted = value.orderApprove !== null ? value.orderApprove.split(',') : ''
                const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : ''

                if (value.idSave) {
                    return
                } else {


                    // countRow++;
                    // const rowNumber = indexOfFirstNews + countRow;

                    return (
                        <tr key={key} >
                            {/* <td>
                                <input onClick={() => this.approvedOrder(value.id)}
                                    checked={idRequestTeamp === value.id}  // Kiểm tra xem checkbox có được chọn hay không
                                    style={{ cursor: 'pointer' }} type="checkbox" name="" id="" title='hiển thị chi tiết người duyệt'
                                />
                            </td> */}

                            {/* <td >{rowNumber}</td> */}
                            {/* <td >{value.orderCode}</td> */}
                            <td >
                                {permission === 'Lãnh đạo' && pointApprove[3] === 1 ?
                                    (<div style={{ minWidth: '200px', width: 'auto' }} className='select-supplier'>

                                        {Array.isArray(supplierNames) && supplierNames.length > 0 && (
                                            <Select onChange={(selectedOption) => this.handleChangeSupplierName(selectedOption, value.id)} name='selectSupplierName' placeholder="Chọn nhà cung cấp" options={supplierNames} />
                                        )}
                                    </div>)
                                    : value.orderSupplierName
                                }
                            </td>
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
                                <span className='statusYellow'
                                // {value.statusOrder === 'Chờ duyệt' ? 'statusYellow' : value.statusOrder === 'Đã duyệt' ? 'statusGreen' : 'statusRed'}
                                >
                                    {value.statusOrder}
                                </span>
                            </td>
                            <td >{value.department}</td>
                            <td >{value.dateCreated}</td>
                            <td >{value.dateUpdate}</td>
                            {permission !== 'Admin' &&

                                < td >
                                    {permission !== 'Thành viên' && permission !== 'Thành viên kho' && permission !== 'Thành viên thu mua' &&

                                        <div id='popup'>


                                            {/* Modal */}
                                            {this.state.showModal && (
                                                <div id="confirmModal" className="modal">
                                                    <div className="modal-content">
                                                        <span className="close" onClick={this.closeModal}>&times;</span>
                                                        <h2>Lý do</h2>
                                                        <p>Có thể để trống phần này gửi đi!</p>
                                                        <textarea
                                                            value={this.state.reasonMessage}
                                                            onChange={this.handleInputChange}
                                                            placeholder="Điền lý do vào mục này..."
                                                        />
                                                        <div className="button-container">
                                                            <button onClick={this.closeModal}>Hủy bỏ</button>
                                                            <button onClick={() => this.handleConfirm()}>Gửi đi</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            < img onClick={() => this.handleUpdateApproved(value, pointApprove)} title='Đồng ý duyệt' src='../icons/color/check.png' />
                                            <img onClick={() => this.openModal(value, pointApprove)} title='Từ chối duyệt' src='../icons/color/remove.png' />

                                        </div>
                                    }
                                </td>
                            }

                        </tr>
                    )
                }


            })
        }
    }


    render() {
        const { isAddingRow, isDisableAddRow, permission } = this.state;

        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        {/* <RequestInto/> */}
                    </div>
                    <div className="head">
                        <h3>Danh mục đơn chưa duyệt</h3>
                        {
                            this.state.flagPositionDetailApprove &&
                            <div>
                                {!this.state.isShowApproveDateName &&

                                    <i style={{ fontSize: '20px' }} onClick={() => this.setState({ isShowApproveDateName: !this.state.isShowApproveDateName })} title='xem chi tiết người duyệt' className='bx bxs-user-pin' />
                                }
                                {this.state.isShowApproveDateName &&


                                    <table border={1} style={{ borderRadius: '10px' }} className='table-data'>


                                        <tbody style={{ border: 'none' }}>

                                            {this.showApproveDate()}

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


                                    {/* <th><i className='bx bxs-flag-checkered'></i></th> */}

                                    {/* <th >STT</th> */}
                                    {/* <th >Mã hàng</th> */}
                                    <th >Nhà cung cấp</th>
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
                                    {
                                        permission !== 'Admin' &&
                                        (<th >
                                            {permission === 'Thành viên' || permission === 'Thành viên kho' ?
                                                'Lý do' : 'Hành động'}
                                        </th>)
                                    }



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
function mapStateToProps(state) {
    return {
        permission: state.allReducer.permission,
        department: state.allReducer.department,
        memberName: state.allReducer.memberName,


    };
}

function mapDispatchToProps(dispatch) {
    return {
        // isSiderBar: (action_moreSiderbar) => {
        //     dispatch({ type: 'StatusSiderBar', action_moreSiderbar })
        // }
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(RequestListNotApprove);
