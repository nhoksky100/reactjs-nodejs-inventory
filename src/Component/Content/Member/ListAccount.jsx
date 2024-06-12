import axios from 'axios';
import React, { Component } from 'react';
import { UpdateDateTime } from '../../UpdateDateTime';
import { toast } from 'react-toastify';
import bcrypt from 'bcryptjs';
import Pagination from 'react-js-pagination';
import { connect } from 'react-redux';
import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
import MemberFormMenu from './MemberFormMenu.jsx';
import { dataSearch, dataSearchValue, isDataSearch, searchDatetimeEnd, searchDatetimeStart } from '../../../StoreRcd.jsx';
const getdataListAccount = () => axios.get('/getAccount').then((res) => res.data)
// const getDataMember = () => axios.get('/getMember').then((res) => res.data)

// const getDataEditMember = () => axios.get('/getEditMember').then((res) => res.data)

class ListAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {

            isAddingRow: false,
            rowAddIndex: 0,

            dataTeamp: null,
            dataListAccount: [],
            // dataListMember: [],
            editingRowIndex: null,
            editingColumnName: null,
            editingValue: '',
            nonEditableColumns: [0, 1, 6, 7],// Chỉ số của các cột không thể sửa
            rowStates: [],
            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,
            // datepicker search
            isSearchDateTime: false

        };
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
        getdataListAccount().then((res) => {
            if (res) {
                if (this._isMounted) {
                    this.sortByDate(res.rows)
                }
            }
        })
        // getDataMember().then((res) => {
        //     if (res) {

        //         // const initialRowStates = res.map(value => value.memberStatus === 'Đang sử dụng');
        //         if (this._isMounted) {
        //             this.setState({
        //                 dataListMember: res,
        //                 // rowStates: initialRowStates
        //             });
        //         }
        //     }
        // })
    }

    currentTodos = (dataListAccount) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataListAccount.length;
        return dataListAccount && dataListAccount.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
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
    sortByDate = (dataListAccount) => {
        const groupedData = {};
        let orderedGroups;
        dataListAccount.forEach(item => {
            const key = item.accountDateCreated;
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
        // const rowStates = sortedData.map(item => item.accountStatus === 'Đang sử dụng')

        if (this._isMounted) {
            this.props.getDataSearch(sortedData)
            this.setState({
                // dataMemberTeamp: dataMember,
                dataListAccount: sortedData,
                // rowStates: rowStates,
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
        const { dataListAccount } = this.state;
        const { dateTimeStart, dateTimeEnd } = this.props

        const dataSearchDate = SearchDate(dataListAccount, dateTimeStart, dateTimeEnd);
        this.props.getDatasearchValue(dataSearchDate)
        this.props.is_DataSearch(true)

    }

    handleDoubleClick = (rowIndex, columnName, value) => {
        // Cập nhật trạng thái khi double click vào ô
        if (this._isMounted) {

            this.setState({
                editingRowIndex: rowIndex,
                editingColumnName: columnName,
                editingValue: value
            });
        }
    };


    handleChange = event => {
        this.setState({ editingValue: event.target.value });
    };

    handleKeyPress = event => {
        if (event.key === 'Enter') {
            this.handleSave()
        }
    };
    handleSave = () => {
        const { editingValue, editingRowIndex, editingColumnName } = this.state;
        const newData = [...this.state.dataListAccount];
        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        const updatedDateTime = UpdateDateTime();
        if (rowData) {
            if (editingValue !== rowData[editingColumnName]) {
                // Cập nhật giá trị mới tại vị trí tương ứng trong newData
                rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
                newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
                const pushDataNewAccount = [];
                newData.map((value) => {
                    if (idUpdate === value.id) {

                        const isPassword = bcrypt.compareSync(rowData.accountPassword, value.accountPassword)
                        if (isPassword) {

                            value.accountDateUpdate = updatedDateTime; // Thêm giá trị thời gian cập nhật mới vào object
                            pushDataNewAccount.push(value)
                        } else {

                            const newHashPassword = bcrypt.hashSync(rowData.accountPassword, 10)
                            value.accountPassword = newHashPassword;
                            value.accountDateUpdate = updatedDateTime; // Thêm giá trị thời gian cập nhật mới vào object
                            pushDataNewAccount.push(value)
                        }

                    }
                })

                // Thực hiện lưu dữ liệu dưới dạng axios
                axios.post('/updatedataListAccount', {
                    pushDataNewAccount
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
                        <i>Sửa không thành công!</i></div>)
                });

                // Sau khi lưu, cập nhật lại trạng thái để không hiển thị thẻ <textarea>
            }
        }
    };

    undoClearAddRow = () => {
        const { dataTeamp } = this.state;
        this.setState({ dataListAccount: dataTeamp, isAddingRow: false, });
    }


    handleCancelEdit = () => {
        this.setState({ editingRowIndex: null, editingColumnName: null, editingValue: '' });
    };



    showFormRow = () => {
        const { dataListAccount, editingRowIndex, editingColumnName, editingValue, rowStates, nonEditableColumns } = this.state;

        if (dataListAccount) {
            let currentTodos = []
            const { isDataSearch, dataSearchValue } = this.props;
            if (isDataSearch) {

                currentTodos = this.currentTodos(dataSearchValue)
            } else {
                currentTodos = this.currentTodos(dataListAccount)
            }
            return currentTodos.map((value, key) => {
                const isDisabled = value.accountStatus === 'Đang khóa'; // Kiểm tra nếu trạng thái là 'Đang khóa'

                return (
                    <tr key={key}>
                        {Object.entries(value).map(([columnName, cellValue], columnIndex) => {
                            // Kiểm tra nếu columnName là 'accountCode' và columnIndex nằm trong mảng nonEditableColumns
                            // Thì không hiển thị textarea
                            if (columnName === 'memberCode' || columnName === 'id' || columnName === 'accountPassword') {
                                return

                            } else {
                                return (
                                    <td
                                        style={(isDisabled && columnName === 'accountStatus') ? { color: 'red' } :
                                            !isDisabled && columnName === 'accountStatus' ? { color: 'green' } : {}}
                                        key={columnName}
                                    //  onDoubleClick={() => this.handleDoubleClick(key, columnName, cellValue)}
                                    >
                                        <span>{cellValue}</span>
                                    </td>
                                );
                            }
                        })}

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
        // const {  dataListAccount } = this.state;
        const { isSearchDateTime } = this.state;
        const { permission } = this.props || '';
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <MemberFormMenu permission={permission} />
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
                                    <th >Mã tài khoản</th>
                                    <th >Tên đăng nhập</th>
                                    {/* <th >Mật khẩu</th> */}
                                    <th >Email</th>
                                    <th >Cấp quyền</th>
                                    <th >Trạng thái</th>
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                    {/* <th >Hành động</th> */}
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
                                this.state.dataListAccount.length !== 0
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
export default connect(mapStateToProps, mapDispatchToProps)(ListAccount)

