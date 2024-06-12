import axios from 'axios';
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import Pagination from 'react-js-pagination';
import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
import { dataSearch, dataSearchValue, isDataSearch, searchDatetimeEnd, searchDatetimeStart } from '../../../StoreRcd.jsx';

const getdataSupplier = () => axios.get('/getSupplier').then((res) => res.data)
// const getDataEditMember = () => axios.get('/getEditMember').then((res) => res.data)

class Supplier extends Component {
    constructor(props) {
        super(props);
        this.state = {

            isAddingRow: false,
            rowAddIndex: 0,

            dataTeamp: null,
            dataSupplier: [],
            editingRowIndex: null,
            editingColumnName: null,
            editingValue: '',
            nonEditableColumns: [2, 3, 4, 5, 6, 7, 8], // Chỉ số của các cột có thể sửa
            rowStates: [],

            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,
            // datepicker search
            isSearchDateTime: false

        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.currentTodos = this.currentTodos.bind(this)
        this._isMounted = false
    }
    componentDidMount() {
        this._isMounted = true
        this.getData()
    }
    componentWillUnmount() {
        this._isMounted = false

        this.props.getDataSearch([])
        this.props.getDatasearchValue([])
        this.props.is_DataSearch(false)

        this.props.SearchDateTimeStart('')
        this.props.SearchDateTimeEnd(new Date().toISOString())
    }

    getData = () => {
        this._isMounted = true
        getdataSupplier().then((res) => {
            if (res) {
                // const initialRowStates = res.map(value => value.supplierStatus === 'Đang sử dụng');
                this.sortByDate(res.rows)

            }
        })
    }
    currentTodos = (dataSupplier) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataSupplier.length;
        return dataSupplier && dataSupplier.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
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
    sortByDate = (dataSupplier) => {
        const groupedData = {};
        let orderedGroups;
        dataSupplier.forEach(item => {
            const key = item.supplierDateCreated;
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
        const rowStates = sortedData.map(item => item.supplierStatus === 'Đang sử dụng')
        if (this._isMounted) {
            this.props.getDataSearch(sortedData)
            this.setState({
                // dataSupplierTeamp: dataSupplier,
                dataSupplier: sortedData,
                rowStates: rowStates,
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
        const { dataSupplier } = this.state;
        const { dateTimeStart, dateTimeEnd } = this.props

        const dataSearchDate = SearchDate(dataSupplier, dateTimeStart, dateTimeEnd);
        this.props.getDatasearchValue(dataSearchDate)
        this.props.is_DataSearch(true)

    }

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
    handleChange = event => {
        if (this._isMounted) {

            this.setState({ editingValue: event.target.value });
        }
    };

    handleKeyPress = event => {

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
        const { editingValue, editingRowIndex, editingColumnName } = this.state;
        const newData = [...this.state.dataSupplier];
        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        const updatedDateTime = UpdateDateTime();
        if (rowData) {
            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
            const pushDataNewSuplier = [];
            newData.map((value) => {
                if (idUpdate === value.id) {

                    value.supplierDateUpdate = updatedDateTime; // Thêm giá trị thời gian cập nhật mới vào object
                    pushDataNewSuplier.push(value)
                }
            })
            console.log(pushDataNewSuplier, 'pushDataNewSuplier');
            // Thực hiện lưu dữ liệu dưới dạng axios
            axios.post('/updatedataSupplier', {
                pushDataNewSuplier
            }).then(response => {
                // Xử lý sau khi lưu thành công
                if (this._isMounted) {

                    this.setState({
                        editingRowIndex: null,
                        editingColumnName: null,
                        editingValue: ''
                    });
                }
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Sửa thành công</i></div>)
            }).catch(error => {
                // Xử lý khi có lỗi xảy ra
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Sửa thất bại!</i></div>)
            });

            // Sau khi lưu, cập nhật lại trạng thái để không hiển thị thẻ <textarea>

        }
    };

    // update trang thai
    // Function để toggle trạng thái của dòng khi được click
    handleActionState = (key) => {
        const { rowStates, dataSupplier } = this.state;
        const newRowStates = [...rowStates]; // Tạo một bản sao mới của mảng trạng thái
        newRowStates[key] = !newRowStates[key]; // Toggle trạng thái của dòng
        if (this._isMounted) {

            this.setState({ rowStates: newRowStates }); // Cập nhật lại state
        }

        // Cập nhật dữ liệu và gửi xuống server
        const updatedData = [...dataSupplier]; // Tạo một bản sao mới của dữ liệu
        const updatedRow = { ...updatedData[key] }; // Lấy ra dòng cần cập nhật
        updatedRow.supplierStatus = newRowStates[key] ? 'Đang sử dụng' : 'Đang khóa'; // Cập nhật trạng thái
        updatedRow.supplierDateUpdate = UpdateDateTime()
        updatedData[key] = updatedRow; // Đặt lại dòng đã cập nhật vào dữ liệu
        let pushDataNewSuplier = []
        pushDataNewSuplier.push(updatedData[key])

        // console.log(pushDataNewSuplier);

        axios.post('/updatedataSupplier', {
            pushDataNewSuplier
        }).then(response => {
            // Xử lý sau khi lưu thành công
            this.getData()
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Cập nhật trạng thái thành công</i></div>);
        }).catch(error => {
            // Xử lý khi có lỗi xảy ra
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Cập nhật trạng thái không thành công!</i></div>);
        });
    };


    undoClearAddRow = () => {
        const { dataTeamp } = this.state;
        this.setState({ dataSupplier: dataTeamp, isAddingRow: false, });
    }


    handleCancelEdit = () => {
        this.setState({ editingRowIndex: null, editingColumnName: null, editingValue: '' });
    };



    showFormRow = () => {
        const { dataSupplier, editingRowIndex, editingColumnName, editingValue, nonEditableColumns, rowStates } = this.state;
        const { permission } = this.props || ''
        // if (columnName === 'id' || columnName === 'supplierCode' || columnName === 'supplierTotalPurchasePrice' || columnName === 'supplierTotalLiabilities') {
        //     return

        // } 
        if (dataSupplier) {
            let currentTodos = []
            const { isDataSearch, dataSearchValue } = this.props;
            if (isDataSearch) {

                currentTodos = this.currentTodos(dataSearchValue)
            } else {
                currentTodos = this.currentTodos(dataSupplier)
            }
            return currentTodos.map((value, key) => {
                const isDisabled = value.supplierStatus === 'Đang khóa'; // Kiểm tra nếu trạng thái là 'Đang khóa'

                return (
                    <tr key={key}>
                        <td>{value.supplierName}</td>
                        <td>{value.supplierCompany}</td>
                        <td>{value.supplierTaxCode}</td>
                        <td>{value.supplierAddress}</td>
                        <td>{value.supplierNumberPhone}</td>
                        <td>{value.supplierEmail}</td>
                        <td>{value.supplierNameBank}</td>
                        <td>{value.supplierAccountBank}</td>
                        <td>{value.supplierDateCreated}</td>
                        <td>{value.supplierDateUpdate}</td>
                        <td
                            style={isDisabled ? { color: 'red' } : { color: 'green' }}
                        >{value.supplierStatus}
                        </td>
                        {permission === 'Admin' &&
                            <td className='switch-td'>
                                {
                                    value.supplierStatus === "Đang sử dụng" ? (
                                        <img onClick={() => this.handleActionState(key)} title='Khóa nhà cung cấp' src='../icons/color/closed.png' />
                                    ) : (
                                        <img onClick={() => this.handleActionState(key)} title='Mở khóa nhà cung cấp' src='../icons/color/open.png' />
                                    )
                                }
                            </td>
                        }
                    </tr>
                );
            });
        }
    };
    // tải lại dữ liệu
    refreshData = () => {
        this.props.is_DataSearch(false)
        this.props.getDatasearchValue([])

    }

    render() {
        // const {  dataSupplier } = this.state;
        const { permission } = this.props || ''
        const { isSearchDateTime } = this.state;
        // if(permission==='Thành viên'){
        //     return window.history.back()
        // }
        console.log('supplier');
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <div className="head-content-menu">
                            <NavLink to='/supplier' type="button" className="btn btn-success">Danh sách nhà cung cấp</NavLink>
                            {permission === 'Admin' && <NavLink to='/add-supplier' type="button" className="btn btn-success">Thêm nhà cung cấp</NavLink>}

                            {/* <a type="button" className="btn btn-success">Tạo mã giới thiệu</a> */}



                        </div>
                    </div>
                    <div className="head">
                        <h3>Danh mục</h3>
                        <div className='pickerTime'>

                            {isSearchDateTime && <FilterTime />}
                            {isSearchDateTime && <i onClick={() => this.searchDateTime()} title='Tìm' className='bx bx-send' />}
                        </div>
                        {!isSearchDateTime ? <i onClick={() => this.formSearchDateTime()} className="bx bx-search" /> : <i onClick={() => this.formSearchDateTime()} className='bx bx-message-square-x' />}

                        <i className="bx bx-filter" />
                        <i title='tải lại dữ liệu' onClick={() => this.refreshData()} className='bx bx-refresh' />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    {/* <th >STT</th> */}
                                    {/* <th >Mã nhà cung cấp</th> */}
                                    <th >Tên nhà cung cấp</th>
                                    <th >Tên công ty | Doanh nghiệp</th>
                                    <th >Mã số thuế</th>
                                    <th >Địa chỉ</th>
                                    <th >Số điện thoại</th>
                                    <th >Email</th>
                                    <th >Tên Ngân hàng</th>
                                    <th >Số tài khoản</th>
                                    {/* <th >Tổng tiền mua</th> */}
                                    {/* <th >Tổng tiền nợ</th> */}
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                    <th >Trạng thái</th>
                                    {permission === 'Admin' &&

                                        <th >Hành động</th>
                                    }

                                </tr>
                            </thead>
                            <tbody >

                                {this.showFormRow()}

                            </tbody>

                        </table>
                    </div>
                    <div className="pagination">

                        <Pagination
                            activePage={this.state.currentPage}
                            itemsCountPerPage={this.state.newsPerPage}
                            totalItemsCount={
                                this.state.dataSupplier.length !== 0
                                    ? this.state.totalPage
                                    : 0
                            }
                            pageRangeDisplayed={5} // show page
                            // firstPageText ={'Đầu'}
                            onChange={this.handlePageChange.bind(this)}
                        />

                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        permission: state.allReducer.permission,
        // department: state.allReducer.department,
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
export default connect(mapStateToProps, mapDispatchToProps)(Supplier)

