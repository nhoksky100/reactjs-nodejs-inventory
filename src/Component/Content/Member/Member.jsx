import axios from 'axios';
import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';
import { connect } from 'react-redux';
import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
import MemberFormMenu from './MemberFormMenu.jsx';
import { dataSearch } from '../../../StoreRcd.jsx'
import { dataSearchValue } from '../../../StoreRcd.jsx'
import { isDataSearch } from '../../../StoreRcd.jsx'
import { searchDatetimeStart } from '../../../StoreRcd.jsx'
import { searchDatetimeEnd } from '../../../StoreRcd.jsx'
const getDataMember = () => axios.get('/getMember').then((res) => res.data)
// const getDataEditMember = () => axios.get('/getEditMember').then((res) => res.data)

class Member extends Component {
    constructor(props) {
        super(props);
        this.state = {

            isAddingRow: false,
            rowAddIndex: 0,

            dataTeamp: null,
            dataMember: [],
            editingRowIndex: null,
            editingColumnName: null,
            editingValue: '',
            checkboxStates: {},
            nonEditableColumns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13], // Chỉ số của các cột không thể sửa
            rowStates: [], // Mảng lưu trạng thái của các dòng

            // pagination
            currentPage: 1,
            newsPerPage: 10, // show 5 product
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
        getDataMember().then((res) => {
            if (res) {

                // const initialRowStates = res.map(value => value.memberStatus === 'Đang sử dụng');
                this.sortByDate(res.rows)

            }
        })
    }

    currentTodos = (dataMember) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataMember.length;
        return dataMember && dataMember.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
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
    sortByDate = (dataMember) => {
        const groupedData = {};
        let orderedGroups;
        dataMember.forEach(item => {
            const key = item.memberDateCreated;
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
        const rowStates = sortedData.map(item => item.memberStatus === 'Đang sử dụng')

        if (this._isMounted) {
            this.props.getDataSearch(sortedData)
            this.setState({
                // dataMemberTeamp: dataMember,
                dataMember: sortedData,
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
        const { dataMember } = this.state;
        const { dateTimeStart, dateTimeEnd } = this.props

        const dataSearchDate = SearchDate(dataMember, dateTimeStart, dateTimeEnd);
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
    };


    handleChange = event => {
        this.setState({ editingValue: event.target.value });
    };

    handleKeyPress = event => {
        if (event.key === 'Enter') {
            this.handleSave()
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
        const newData = [...this.state.dataMember];
        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData

        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        const updatedDateTime = UpdateDateTime();
        if (rowData) {
            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
            const pushDataNewMember = [];
            newData.map((value) => {
                if (idUpdate === value.id) {

                    value.memberDateUpdate = updatedDateTime; // Thêm giá trị thời gian cập nhật mới vào object
                    pushDataNewMember.push(value)
                }
            })

            // Thực hiện lưu dữ liệu dưới dạng axios
            axios.post('/updateDataMember', {
                pushDataNewMember
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
    };

    undoClearAddRow = () => {
        const { dataTeamp } = this.state;
        if (this._isMounted) {

            this.setState({ dataMember: dataTeamp, isAddingRow: false, });
        }
    }


    handleCancelEdit = () => {
        if (this._isMounted) {

            this.setState({ editingRowIndex: null, editingColumnName: null, editingValue: '' });
        }
    };
    // Function để toggle trạng thái của dòng khi được click
    handleActionState = (key) => {
        const { rowStates, dataMember } = this.state;
        const newRowStates = [...rowStates]; // Tạo một bản sao mới của mảng trạng thái
        newRowStates[key] = !newRowStates[key]; // Toggle trạng thái của dòng
        if (this._isMounted) {

            this.setState({ rowStates: newRowStates }); // Cập nhật lại state
        }

        // Cập nhật dữ liệu và gửi xuống server
        const updatedData = [...dataMember]; // Tạo một bản sao mới của dữ liệu
        const updatedRow = { ...updatedData[key] }; // Lấy ra dòng cần cập nhật
        updatedRow.memberStatus = newRowStates[key] ? 'Đang sử dụng' : 'Đang khóa'; // Cập nhật trạng thái
        updatedRow.memberDateUpdate = UpdateDateTime()
        updatedData[key] = updatedRow; // Đặt lại dòng đã cập nhật vào dữ liệu
        let pushDataNewMember = []
        pushDataNewMember.push(updatedData[key])
        // console.log(pushDataNewMember);
        // Gửi dữ liệu cập nhật xuống server
        axios.post('/updateDataMember', {
            pushDataNewMember
        }).then(response => {
            // Xử lý sau khi lưu thành công
            axios.post('/upateAccount', {
                accountCode: pushDataNewMember.length > 0 && pushDataNewMember[0].memberCode,
                accountStatus: pushDataNewMember.length > 0 && pushDataNewMember[0].memberStatus,
                accountDateUpdate: pushDataNewMember.length > 0 && pushDataNewMember[0].memberDateUpdate,
            })

            this.getData()
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Cập nhật trạng thái thành công</i></div>);
        }).catch(error => {
            // Xử lý khi có lỗi xảy ra
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Cập nhật trạng thái không thành công!</i></div>);
        });
    };


    showFormRow = () => {
        const { dataMember, editingRowIndex, editingColumnName, editingValue, nonEditableColumns, rowStates } = this.state;
        const { permission } = this.props || ''
        console.log(this.props.dataSearchValue, 'dataSearchValue');
        if (!dataMember || dataMember.length === 0) {
            return null;
        }
        let currentTodos = []
        const { isDataSearch, dataSearchValue } = this.props;
        if (isDataSearch) {

            currentTodos = this.currentTodos(dataSearchValue)
        } else {
            currentTodos = this.currentTodos(dataMember)
        }

        return currentTodos.map((value, key) => {
            const isDisabled = value.memberStatus === 'Đang khóa'; // Kiểm tra nếu trạng thái là 'Đang khóa'

            return (
                <tr key={key}>
                    {Object.entries(value).map(([columnName, cellValue], columnIndex) => {
                        if (columnName === 'accountCode' || columnName === 'id') {
                            return null;
                        } else {
                            return (
                                <td
                                    style={(isDisabled && columnName === 'memberStatus') ? { color: 'red' } :
                                        !isDisabled && columnName === 'memberStatus' ? { color: 'green' } : {}}
                                    key={columnName}
                                // onDoubleClick={() => this.handleDoubleClick(key, columnName, cellValue)}
                                >
                                    {(editingRowIndex === key && editingColumnName === columnName && !nonEditableColumns.includes(columnIndex)) ? (

                                        <div className='editTextarea'>

                                            <textarea
                                                value={editingValue}
                                                onChange={this.handleChange}
                                                onKeyPress={this.handleKeyPress}
                                                onKeyDown={this.handleKeyDown}
                                                autoFocus

                                            />
                                            {editingValue.length === 0 || (editingRowIndex === key && editingColumnName === columnName) && (
                                                <div>
                                                    <i onClick={this.handleSave} className='bx bx-send' title='lưu' />
                                                    <i onClick={this.handleCancelEdit} className='bx bxs-message-square-x' title='Hủy bỏ' />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span>{cellValue}</span>
                                    )}
                                </td>
                            );
                        }
                    })}
                    {permission === 'Admin' &&

                        <td className='switch-td'>
                            {value.memberStatus === 'Đang sử dụng' ? (
                                <img onClick={() => this.handleActionState(key)} title='Khóa thành viên' src='../icons/color/block-people.png' />
                            ) : (
                                <img onClick={() => this.handleActionState(key)} title='Mở khóa thành viên' src='../icons/color/unlocked.png' />
                            )}
                        </td>
                    }
                </tr>
            );
        });
    };

    // tải lại dữ liệu
    refreshData = () => {
        this.props.is_DataSearch(false)
        this.props.getDatasearchValue([])

    }


    render() {
        // const {  dataMember } = this.state;
        const { isSearchDateTime } = this.state;
        const { permission } = this.props || ''

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
                                    <th >Mã thành viên</th>
                                    <th >Người tạo</th>
                                    <th >Cấp quyền</th>
                                    <th >Tên thành viên</th>
                                    <th >Phòng ban</th>
                                    <th >Giới tính</th>
                                    <th >Địa chỉ</th>
                                    <th >Số điện thoại</th>
                                    <th >Email</th>
                                    <th >Trạng thái</th>
                                    <th >Ngày tạo</th>
                                    <th >Ngày cập nhật</th>
                                    {permission === 'Admin' && <th >Hành động</th>}
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
                                this.state.dataMember.length !== 0
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
export default connect(mapStateToProps, mapDispatchToProps)(Member)

