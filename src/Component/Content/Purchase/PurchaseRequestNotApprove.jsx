import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime.jsx';

import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId.jsx';
import Pagination from "react-js-pagination";
import bcrypt from 'bcryptjs';
import Select from 'react-select';
import PurchaseFormMenu from './PurchaseFormMenu.jsx';

const getdataRequest = () => axios.get('/getRequest').then((res) => res.data)
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataApproveOrder = () => axios.get('/getApproveOrder').then((res) => res.data)
const getdataSupplier = () => axios.get('/getSupplier').then((res) => res.data)
const getdataNotification = () => axios.get('/getNotification').then((res) => res.data)

class PurchaseRequestNotApprove extends Component {
    constructor(props) {
        super(props);
        this.state = {

            dataRequestTemp: [],
            dataRequest: [],
            dataMember: [],
            dataApproveDate: [],
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
            // selectedSupplierName: [],
            supplierNames: [],
            dataSupplier: [],
            selectedOptions: [],
            menuIsOpen: {}, // Ban đầu là đối tượng trống
            // filteredSuppliers: [], // Danh sách nhà cung cấp đã lọc
            // selectedSupplier: '', // Nhà cung cấp được chọn

            permissionBlock: ['Thành viên', 'Thành viên kho', 'Admin', 'Trưởng phòng'],
            userName: '',

            // show reason approve not
            showModal: false,
            reasonMessage: '',
            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,

            editingRowIndex: null, // Khởi tạo editingRowIndex là null hoặc một giá trị mặc định khác nếu cần
            editingColumnName: null, // Khởi tạo editingColumnName là null hoặc một giá trị mặc định khác nếu cần
            editingValue: '', // Khởi tạo editingValue là một chuỗi trống
            nonEditableColumns: [9], // Chỉ số của các cột có thể sửa 

        }
        this.currentTodos = this.currentTodos.bind(this)
        this._isMounted = false
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
            this.setState({ isShowApproveDateName: false });
        }
    }

    getData = async () => {
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

                    this.sortByDate(dataRequest.rows)
                    // const currentTodos = this.currentTodos(filteredData);

                    // this.setState({
                    //     dataRequest: currentTodos,
                    //     // totalPage: dataRequest.length,
                    // })
                }
            }



            if (dataSupplier) {
                const supplierNames = dataSupplier.rows.map(supplier => ({ value: supplier.supplierName, label: supplier.supplierName }));
                if (this._isMounted) {
                    this.setState({
                        dataSupplier: dataSupplier.rows.reverse(),
                        supplierNames: supplierNames,
                        // supplierNamesTeamp: supplierNames,
                    })
                }

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
                            // const goToBackPermission = this.checkPermissionLock(value.memberPermission, departmentApproveDate)
                            // if (!goToBackPermission) {
                            //     return window.history.back()
                            // }
                        }
                    }

                    // const member = res.find(value => value.memberCode === tokenObj.accountCode);

                })
                if (this._isMounted) {
                    this.setState({
                        dataMember: dataMember.rows,
                    })
                }

            }
            if (dataApproveDate) {

                let id = randomId();
                const isDuplicateitemCode = (id) => {
                    return dataApproveDate.rows.some(item => item.id === id);
                };

                // Kiểm tra và tạo itemCode mới nếu trùng lặp
                while (isDuplicateitemCode(id)) {
                    id = randomId();
                }
                if (this._isMounted) {
                    this.setState({

                        idApproveReturn: id,
                        idApproveDate: id,
                    })
                }
            }

            if (dataNotification) {

                if (this._isMounted) {
                    this.setState({
                        dataNotification: dataNotification.rows,

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

    checkIdRandom = () => {
        let id = randomId();
        const { dataApproveDate } = this.state;
        const isDuplicateitemCode = (id) => {
            return dataApproveDate.some(item => item.id === id);
        };

        // Kiểm tra và tạo itemCode mới nếu trùng lặp
        while (isDuplicateitemCode(id)) {
            id = randomId();
        }
        return id
    }
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
        const filteredData = sortedData.filter(value => {

            const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
            return value.statusOrder === 'Chờ duyệt' && parseInt(pointApprove[0]) === 0
        });
        // const currentTodos = this.currentTodos(filteredData)
        if (this._isMounted) {

            this.setState({
                dataRequestTemp: filteredData,
                dataRequest: filteredData,

                // totalPage: currentTodos.length
            });
        }



    }



    // xử lý click double 
    handleDoubleClick = (rowIndex, columnName, value) => {
        // Cập nhật trạng thái khi double click vào ô
        this.setState({
            editingRowIndex: rowIndex,
            editingColumnName: columnName,
            editingValue: value
        });
        this.focusOnTextarea();
    };

    focusOnTextarea = () => {
        // Tìm thẻ textarea trong DOM và tập trung vào nó
        const textarea = document.querySelector('.editTextarea textarea');
        if (textarea) {
            textarea.focus();
        }
    }
    calculateIntoMoney = (amount, unitPrice) => {
        return parseFloat(amount) * parseFloat(unitPrice);
    };


    // handleChangeSupplierName = (selectedOption, id) => {
    //     const { dataRequest } = this.state;
    //     // Tìm đối tượng trong dataRequest có id tương ứng với id được chọn
    //     const selectedDataIndex = dataRequest.findIndex(item => item.id === id);

    //     // Kiểm tra xem đã tìm thấy đối tượng hay không
    //     if (selectedDataIndex !== -1) {
    //         // Sao chép mảng dataRequest để thay đổi một cách an toàn
    //         const updatedDataRequest = [...dataRequest];
    //         // Cập nhật supplierName vào đối tượng đã tìm thấy
    //         updatedDataRequest[selectedDataIndex].orderSupplierName = selectedOption.value; // Lưu ý: selectedOption chứa giá trị được chọn từ dropdown
    //         // Cập nhật lại state cho dataRequest
    //         this.setState({
    //             dataRequest: updatedDataRequest,

    //         });

    //     } else {
    //         toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
    //             <i>Không tìm thấy nhà cung cấp!</i></div>)
    //     }
    // }

    handleChangeSupplierName = (selectedOption, id) => {
        const updatedDataRequest = this.state.dataRequest.map(item => {
            if (item.id === id) {
                return { ...item, orderSupplierName: selectedOption.value };
            }
            return item;
        });

        // this.setState({
        //     selectedOption,
        //     dataRequest: updatedDataRequest
        // });
        const updatedSelectedOptions = {
            ...this.state.selectedOptions,
            [id]: selectedOption
        };

        this.setState({
            dataRequest: updatedDataRequest,
            selectedOptions: updatedSelectedOptions
        });
    };



    handleChange = (event, rowIndex, columnName) => {
        const { dataRequest } = this.state;
        const newValue = event.target.value;

        // Cập nhật giá trị mới cho cột tương ứng
        const newDataRequest = dataRequest.map((row, index) => {
            if (index === rowIndex) {
                return { ...row, [columnName]: newValue };
            }
            return row;
        });

        // Tính toán giá trị mới cho cột intoMoney
        if (columnName === 'unitPrice' || columnName === 'amount') {
            const updatedDataRequest = newDataRequest.map((row, index) => {
                if (index === rowIndex) {
                    const intoMoney = this.calculateIntoMoney(row.amount, row.unitPrice);
                    return { ...row, intoMoney };
                }
                return row;
            });
            this.setState({ dataRequest: updatedDataRequest, editingValue: newValue });
        } else {
            this.setState({ dataRequest: newDataRequest, editingValue: newValue });
        }
    };

    handleKeyPress = event => {
        // console.log('Key pressed:', event.key);
        if (event.key === 'Enter') {
            this.handleSave()
        } else if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {

            this.handleCancelEdit();
        }
    };
    handleKeyDown = event => {
        if (event.key === 'Enter') {
            this.handleSave();
        } else if (event.key === 'Escape' || event.keyCode === 27 || event.which === 27) {
            this.handleCancelEdit();
        }
    };
    handleSave = () => {
        const { editingValue, editingRowIndex, editingColumnName, dataRequest, } = this.state;

        const newData = [...dataRequest]

        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];

        const idUpdate = rowData.id;
        const updatedDateTime = UpdateDateTime();
        if (rowData) {
            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
            const pushDataRequest = [];
            newData.map((value) => {
                if (idUpdate === value.id) {

                    value.dateUpdate = updatedDateTime; // Thêm giá trị thời gian cập nhật mới vào object
                    value.unitPrice = editingValue; // Thêm giá trị thời gian cập nhật mới vào object
                    pushDataRequest.push(value)
                }
            })
            if (this._isMounted) {

                this.setState({
                    dataRequest: newData,
                    editingRowIndex: null,
                    editingColumnName: null,
                    editingValue: '',
                })
            }
            // Thực hiện lưu dữ liệu dưới dạng axios
            // axios.post('/updatedataRequestList', {
            //     pushDataRequest
            // }).then(response => {
            //     // Xử lý sau khi lưu thành công
            //     if (this._isMounted) {

            //         this.setState({
            //             editingRowIndex: null,
            //             editingColumnName: null,
            //             editingValue: '',

            //         });
            //     }

            //     toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
            //         <i>Sửa thành công</i></div>)
            // }).catch(error => {
            //     // Xử lý khi có lỗi xảy ra
            //     toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
            //         <i>Sửa thất bại!</i></div>)
            // });

            // Sau khi lưu, cập nhật lại trạng thái để không hiển thị thẻ <textarea>

        }
    };
    handleCancelEdit = () => {
        this.setState({ editingRowIndex: null, editingColumnName: null, editingValue: '' });
    };


    // approvedOrder = (idRequest) => {
    //     const { idRequestTeamp, flagPositionDetailApprove } = this.state;
    //     if (idRequestTeamp === idRequest && flagPositionDetailApprove) {
    //         this.setState({
    //             flagPositionDetailApprove: false,
    //             idRequest: idRequest,
    //             idRequestTeamp: ''
    //         })
    //     } else {

    //         this.setState({
    //             flagPositionDetailApprove: true,
    //             idRequest: idRequest,
    //             idRequestTeamp: idRequest
    //         })
    //     }

    // }

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
    // checkPermissionApprove = (pointApprove) => {
    //     const { permission } = this.state;
    //     if (!pointApprove) return false;

    //     const permissions = {
    //         'Thành viên thu mua': [parseInt(pointApprove[0])],
    //         'Lãnh đạo': [parseInt(pointApprove[3])]
    //     };

    //     if (permissions.hasOwnProperty(permission)) {

    //         return permissions[permission].includes(1);
    //     } else {

    //         return false;
    //     }
    // }
    checkPermissionLock = (permission, departmentApproveDate) => {
        // const { permission, departmentApproveDate } = this.state;


        const permissionBlock = ['Thành viên', 'Thành viên kho', 'Admin', 'Trưởng phòng'];
        if (permission && departmentApproveDate) {

            if (permissionBlock.includes(permission)) {
                return false;
            }

            else if (permission === 'Trưởng phòng' && departmentApproveDate !== 'Kế toán') {
                return false;
            } else {
                return true
            }

            // return true;
        }

    }
    handleUpdateApproved = (value, pointApprove, index) => {
        if (value.orderSupplierName) {
            const { dataApproveDate, departmentApproveDate, memberName, reasonMessage, dataRequest, dataNotification } = this.state;
            const promises = [];

            const { permission } = this.state;

            if (permission === 'Lãnh đạo') {
                pointApprove[3] = 1;
            } else if (permission === 'Thành viên thu mua') {
                pointApprove[0] = 1;
            }

            const { id } = value;
            let statusOrder = parseInt(pointApprove[3]) === 1 ? 'Đã duyệt' : 'Chờ duyệt';
            let orderComplete = statusOrder === 'Đã duyệt' ? 1 : 0;

            const orderPointApprove = pointApprove.join(',');
            const idRequest = id;
            const orderCode = value.orderCode;
            const dateUpdate = UpdateDateTime();
            const idApproveDate = this.checkIdRandom()
            const promise = axios.post('/addApproveDate', { id: idApproveDate, orderCode, department: departmentApproveDate, orderApprove: memberName, dateUpdate, idRequest })
                .then(() => {
                    return axios.post('/updateAppremovedRequest', {
                        id, orderSupplierName: value.orderSupplierName, orderPointApprove, statusOrder, dateUpdate, reasonMessage, orderComplete
                    });
                })
                .then(() => {
                    // toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    //     <i>Duyệt đơn thành công!</i></div>);

                    const updatedDataRequest = [...this.state.dataRequest];
                    updatedDataRequest[index].orderSupplierName = '';
                    updatedDataRequest[index].orderComplete = orderComplete;
                    updatedDataRequest[index].statusOrder = statusOrder;
                    updatedDataRequest[index].orderPointApprove = orderPointApprove;
                    const updateDateRequestFil = updatedDataRequest.filter(item => item.id !== value.id)
                    // console.log(updateDateRequestFil, 'updatedDataRequest');
                    if (this._isMounted) {
                        this.setState({
                            dataRequest: updateDateRequestFil
                        });
                    }

                    const dataNotifi = dataNotification.length > 0 && dataNotification.filter(item => item.idRequest === id) || []

                    if (dataNotifi.length > 0) {

                        return axios.post('/updateNotificationPointInto', {
                            idRequest: dataNotifi[0].idRequest, status: 'Chờ duyệt', pointApprovedInto: 1, isRead: 0, dateCreated: UpdateDateTime()
                        });
                    }


                    promises.push(promise);
                    // this.getData();
                })
                .catch(error => {
                    promises.push(Promise.resolve(null));
                    // toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    //     <i>Duyệt đơn thất bại!</i></div>);
                });

            Promise.all(promises).then(results => {
                // Kiểm tra kết quả của tất cả các promise
                const isSuccess = results.every(result => result !== null);

                if (isSuccess) {
                    //Nottification 


                    // Hiển thị thông báo thành công nếu tất cả các promise đều thành công
                    toast(<div className="advertise"><i className="fa fa-check-circle" aria-hidden="true" />
                        <i>Duyệt đơn thành công!</i></div>);
                    // this.setState({ isPrev: true })
                } else {
                    // Hiển thị thông báo thất bại nếu có ít nhất một promise thất bại
                    toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                        <i>Duyệt thất bại!</i></div>);
                }
            });

        } else {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Nhà cung cấp không được bỏ trống!</i></div>);
        }

    };




    handleUpdateApproveReturn = (value, pointApprove) => {
        const { dataApproveDate, departmentApproveDate, memberName, reasonMessage, dataNotification } = this.state;
        // const permissionIndex = this.state.permissionMapping[this.state.permission];
        // let flagApprove = false, flagNotApprove = false;
        const { permission } = this.state;
        const promises = []
        for (let i = 0; i < pointApprove.length; i++) {
            if (permission === 'Thành viên thu mua') {
                pointApprove[0] = -1;
            }
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
        const orderComplete = 0
        const idApproveReturn = this.checkIdRandom()
        const promise = axios.post('/addApproveDate', { id: idApproveReturn, orderCode, department: departmentApproveDate, orderApprove: memberName, dateUpdate, idRequest })
            .then(() => {
                return axios.post('/updateAppremovedRequest', { id, orderSupplierName: value.orderSupplierName, orderPointApprove, statusOrder, dateUpdate, reasonMessage, orderComplete })
                // axios.post('/updateAppe', { id: id, orderCode, department: departmentApproveDate, orderApprove: memberName, dateUpdate, idRequest })
                
            })
            .then(() => {

                const dataNotifi = dataNotification.length > 0 && dataNotification.filter(item => item.idRequest === id) || []
                if (dataNotifi.length > 0) {

                    return axios.post('/updateNotificationPointInto', {
                        idRequest: dataNotifi[0].idRequest, status: 'Từ chối', pointApprovedInto: -1, isRead: 0, dateCreated: dateUpdate
                    });
                }
                promises.push(promise);
                this.getData();
            })
            
            .catch(error => {
                promises.push(Promise.resolve(null));
                // toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                //     <i>Duyệt trả đơn thất bại!</i></div>);
            });
        Promise.all(promises).then(results => {
            // Kiểm tra kết quả của tất cả các promise
            const isSuccess = results.every(result => result !== null);

            if (isSuccess) {
                //Nottification 


                // Hiển thị thông báo thành công nếu tất cả các promise đều thành công
                toast(<div className="advertise"><i className="fa fa-check-circle" aria-hidden="true" />
                    <i>Duyệt đơn thành công!</i></div>);
                // this.setState({ isPrev: true })
            } else {
                // Hiển thị thông báo thất bại nếu có ít nhất một promise thất bại
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Duyệt thất bại!</i></div>);
            }
        });
        // }
    }

    // pageination currentpage
    handlePageChange(currentPage) {
        this.setState({
            currentPage: currentPage,
        });
    }

    handleInputChange = (inputValue, id) => {
        this.setState({
            menuIsOpen: {
                ...this.state.menuIsOpen,
                [id]: inputValue.length > 0
            }
        });
    };

    showFormRow = () => {
        const { dataRequest, editingRowIndex, editingColumnName, editingValue, nonEditableColumns, supplierNames, selectedOptions } = this.state;
        if (dataRequest) {

            // const filteredData = dataRequest.filter(value => {

            //     const pointApprove = value.orderPointApprove !== null ? value.orderPointApprove.split(',') : '';
            //     return !this.checkPermissionApprove(pointApprove);
            // });

            const currentTodos = this.currentTodos(dataRequest)
            return currentTodos.map((row, rowIndex) => {

                return (
                    <tr key={rowIndex}>
                        {Object.entries(row).map(([columnName, cellValue], colIndex) => {

                            if (columnName === 'id' || columnName === 'orderCode' || columnName === 'idHistory' ||
                                columnName === 'orderNotes' || columnName === 'warehouseAreaName' ||
                                columnName === 'orderPointApprove' || columnName === 'department' ||
                                columnName === 'orderReason' || columnName === 'orderComplete') {
                                return null; // Bỏ qua cột không cần thiết
                            } else {
                                return (
                                    <td
                                        key={columnName}
                                        onDoubleClick={() => this.handleDoubleClick(rowIndex, columnName, cellValue)}
                                    >
                                        {editingRowIndex === rowIndex && editingColumnName === columnName && nonEditableColumns.includes(colIndex) ? (
                                            <div className="editTextarea">
                                                <textarea
                                                    value={editingValue}
                                                    onChange={(e) => this.handleChange(e, rowIndex, columnName)}
                                                    onKeyDown={this.handleKeyDown}
                                                />
                                                {editingValue.length === 0 || (editingRowIndex === rowIndex && editingColumnName === columnName) ? (
                                                    <div>
                                                        <i onClick={this.handleSave} className="bx bx-send" title="Lưu" />
                                                        <i onClick={this.handleCancelEdit} className="bx bxs-message-square-x" title="Hủy bỏ" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        )
                                            : columnName === 'orderSupplierName' ? ( // Kiểm tra nếu columnName là 'orderApprove'
                                                <div style={{ minWidth: '200px', width: 'auto' }} className='select-supplier'>

                                                    {Array.isArray(supplierNames) && supplierNames.length > 0 && (
                                                        <Select
                                                            onChange={(selectedOption) => this.handleChangeSupplierName(selectedOption, row.id)}
                                                            onInputChange={(inputValue) => this.handleInputChange(inputValue, row.id)}
                                                            name={columnName} placeholder="Chọn nhà cung cấp" options={supplierNames}
                                                            // value={selectedOptions[rowIndex] ||
                                                            // {
                                                            //     value: filteredData[rowIndex].orderSupplierName && filteredData[rowIndex].orderSupplierName,
                                                            //     label: filteredData[rowIndex].orderSupplierName && filteredData[rowIndex].orderSupplierName
                                                            // }}

                                                            value={selectedOptions[row.id] ||
                                                                (row.orderSupplierName
                                                                    ? {
                                                                        value: row.orderSupplierName,
                                                                        label: row.orderSupplierName
                                                                    }
                                                                    : '')}
                                                            menuIsOpen={this.state.menuIsOpen[row.id] || false}
                                                        />
                                                    )}
                                                </div>
                                            )
                                                : columnName === 'orderApprove' ? ( // Kiểm tra nếu columnName là 'orderApprove'
                                                    <div style={{ display: 'inline-flex' }}>
                                                        {this.arrayApproveted(cellValue.split(','), row.orderPointApprove.split(','))}
                                                    </div>
                                                )
                                                    : columnName === 'statusOrder' ? ( // Kiểm tra nếu columnName là 'statusOrder'
                                                        <span className={cellValue === 'Chờ duyệt' ? 'statusYellow' : cellValue === 'Đã duyệt' ? 'statusGreen' : 'statusRed'}>
                                                            {cellValue}
                                                        </span>
                                                    )
                                                        : columnName === 'intoMoney' ? (
                                                            // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                            <span>
                                                                {parseFloat(row.amount * row.unitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                            </span>
                                                        )
                                                            : columnName === 'amount' ? (
                                                                // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                                <span>
                                                                    {parseFloat(row.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                </span>
                                                            )
                                                                : columnName === 'unitPrice' ? (
                                                                    // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                                    <span>
                                                                        {parseFloat(row.unitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                    </span>
                                                                )
                                                                    : (
                                                                        <span>{cellValue}</span>
                                                                    )}
                                    </td>
                                );
                            }
                        })}
                        {this.renderActions(row, rowIndex)}
                    </tr>
                );
            });
        }
    };

    renderActions = (row, rowIndex) => {
        const { permission } = this.state;
        const approveted = row.orderApprove !== null ? row.orderApprove.split(',') : '';
        const pointApprove = row.orderPointApprove !== null ? row.orderPointApprove.split(',') : '';
        const isMemberOrLeader = permission === 'Thành viên thu mua';

        return (
            <td>
                {isMemberOrLeader && (
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
                        {
                            permission === 'Thành viên thu mua' &&
                            <div>
                                <img onClick={() => this.handleUpdateApproved(row, pointApprove, rowIndex)} title='Đồng ý duyệt' src='../icons/color/check.png' />
                                <img onClick={() => this.openModal(row, pointApprove)} title='Từ chối duyệt' src='../icons/color/remove.png' />
                            </div>
                        }
                    </div>
                )}
            </td>
        );
    };

    render() {
        const { isAddingRow, isDisableAddRow, permission, dataRequest, editingRowIndex } = this.state;



        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <PurchaseFormMenu />
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
                                    <th >Nhà cung cấp</th>
                                    {/* <th >Mã hàng</th> */}
                                    <th >Người tạo</th>
                                    <th >Người duyệt</th>
                                    <th >Tên hàng</th>
                                    <th >Đơn giá (VND)</th>
                                    <th >Số lượng</th>
                                    <th >Thành tiền (VND)</th>
                                    <th >Đơn vị tính</th>
                                    <th >Trạng thái</th>
                                    {/* <th >Bộ phận</th> */}
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                    {
                                        permission === 'Thành viên thu mua' &&
                                        <th >
                                            Hành động
                                        </th>
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
                                this.state.dataRequest !== null
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

export default PurchaseRequestNotApprove;