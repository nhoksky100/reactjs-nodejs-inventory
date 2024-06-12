import axios from 'axios';
import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';
import { connect } from 'react-redux';
import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
import ItemListFormMenu from './ItemListFormMenu.jsx';
import { dataSearch, dataSearchValue, isDataSearch, searchDatetimeEnd, searchDatetimeStart } from '../../../StoreRcd.jsx';

const getdataItemsList = () => axios.get('/getItemsList').then((res) => res.data)
// const getDataEditMember = () => axios.get('/getEditMember').then((res) => res.data)

class ItemList extends Component {
    constructor(props) {
        super(props);
        this.state = {

            isAddingRow: false,
            rowAddIndex: 0,

            dataTeamp: null,
            dataItemsList: [],
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
        getdataItemsList().then((res) => {
            if (res) {
                // const initialRowStates = res.map(value => value.itemsStatus === 'Đang sử dụng');
                this.sortByDate(res.rows)

            }
        })
    }

    currentTodos = (dataItemsList) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataItemsList.length;
        return dataItemsList && dataItemsList.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
    }

    // pageination currentpage
    handlePageChange(currentPage) {
        if (this._isMounted) {

            this.setState({
                currentPage: currentPage,
            });
        }
    }


    handleDoubleClick = (rowIndex, columnName, value) => {
        // Cập nhật trạng thái khi double click vào ô
        if (this._isMounted) {

            this.setState({
                editingRowIndex: rowIndex,
                editingColumnName: columnName,
                editingValue: value
            });
            this.focusOnTextarea();
        }
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
        const newData = [...this.state.dataItemsList];
        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        const updatedDateTime = UpdateDateTime();
        if (rowData) {
            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
            const pushDataNewItemsList = [];
            newData.map((value) => {
                if (idUpdate === value.id) {

                    value.itemsDateUpdate = updatedDateTime; // Thêm giá trị thời gian cập nhật mới vào object
                    pushDataNewItemsList.push(value)
                }
            })

            // Thực hiện lưu dữ liệu dưới dạng axios
            axios.post('/updatedataItemsList', {
                pushDataNewItemsList
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

    // update trang thai
    // Function để toggle trạng thái của dòng khi được click
    handleActionState = (key) => {
        const { rowStates, dataItemsList } = this.state;
        const newRowStates = [...rowStates]; // Tạo một bản sao mới của mảng trạng thái
        newRowStates[key] = !newRowStates[key]; // Toggle trạng thái của dòng
        this.setState({ rowStates: newRowStates }); // Cập nhật lại state

        // Cập nhật dữ liệu và gửi xuống server
        const updatedData = [...dataItemsList]; // Tạo một bản sao mới của dữ liệu
        const updatedRow = { ...updatedData[key] }; // Lấy ra dòng cần cập nhật
        updatedRow.itemsStatus = newRowStates[key] ? 'Đang sử dụng' : 'Đang khóa'; // Cập nhật trạng thái
        updatedRow.itemsDateUpdate = UpdateDateTime()
        // console.log(updatedRow.itemsStatus, 'updatedRow.itemsStatus');
        updatedData[key] = updatedRow; // Đặt lại dòng đã cập nhật vào dữ liệu
        let pushDataNewItemsList = []
        pushDataNewItemsList.push(updatedData[key])

        // Gửi dữ liệu cập nhật xuống server
        axios.post('/updatedataItemsList', {
            pushDataNewItemsList
        }).then(response => {
            // Xử lý sau khi lưu thành công
            let warehouseStatus = updatedData[key].itemsStatus;

            let warehouseDateUpdate = UpdateDateTime()
            this.getData()

            axios.post('/updatedataWarehouseListStatus', { warehouseStatus, warehouseDateUpdate, id: updatedData[key].id })

            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Cập nhật trạng thái thành công!</i></div>);
        }).catch(error => {
            // Xử lý khi có lỗi xảy ra
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Cập nhật trạng thái thất bại!</i></div>);
        });
    };


    undoClearAddRow = () => {
        const { dataTeamp } = this.state;
        if (this._isMounted) {

            this.setState({ dataItemsList: dataTeamp, isAddingRow: false, });
        }

    }


    handleCancelEdit = () => {
        if (this._isMounted) {

            this.setState({ editingRowIndex: null, editingColumnName: null, editingValue: '' });
        }
    };


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
    sortByDate = (dataItemsList) => {
        const groupedData = {};
        let orderedGroups;
        dataItemsList.forEach(item => {
            const key = item.itemsDateCreated;
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
        const rowStates = sortedData.map(item => item.itemsStatus === 'Đang sử dụng')

        if (this._isMounted) {
            this.props.getDataSearch(sortedData)
            this.setState({
                // dataItemsListTeamp: dataItemsList,
                dataItemsList: sortedData,
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
        const { dataItemsList } = this.state;
        const { dateTimeStart, dateTimeEnd } = this.props

        const dataSearchDate = SearchDate(dataItemsList, dateTimeStart, dateTimeEnd);
        this.props.getDatasearchValue(dataSearchDate)
        this.props.is_DataSearch(true)

    }


    // tải lại dữ liệu
    refreshData = () => {
        this.props.is_DataSearch(false)
        this.props.getDatasearchValue([])

    }
    showFormRow = () => {
        const { dataItemsList, editingRowIndex, editingColumnName, editingValue, nonEditableColumns, rowStates } = this.state;
        const { permission } = this.props || ''
        if (dataItemsList) {
            let currentTodos = []
            const { isDataSearch, dataSearchValue } = this.props;
            if (isDataSearch) {
                currentTodos = this.currentTodos(dataSearchValue)
            } else {
                currentTodos = this.currentTodos(dataItemsList)
            }
            return currentTodos.map((value, key) => {
                const isDisabled = value.itemsStatus !== 'Đang sử dụng'; // Kiểm tra nếu trạng thái là 'Đang khóa'

                return (
                    <tr key={key}>
                        {Object.entries(value).map(([columnName, cellValue], columnIndex) => {
                            // Kiểm tra nếu columnName là 'tk_ma' và columnIndex nằm trong mảng nonEditableColumns
                            // Thì không hiển thị textarea
                            if (columnName === 'id' || columnName === 'itemsResidual' || columnName === 'itemsWarehouseAreaName') {
                                return

                            } else {
                                return (
                                    <td
                                        style={(isDisabled && columnName === 'itemsStatus') ? { color: 'red' } :
                                            !isDisabled && columnName === 'itemsStatus' ? { color: 'green' } : {}}
                                        key={columnName} onDoubleClick={() => this.handleDoubleClick(key, columnName, cellValue)}>
                                        {(editingRowIndex === key && editingColumnName === columnName && nonEditableColumns.includes(columnIndex)) ? (

                                            <div className='editTextarea'>


                                                <textarea
                                                    value={editingValue}
                                                    onChange={this.handleChange}
                                                    // onBlur={this.handleSave}
                                                    // onKeyPress={this.handleKeyPress}
                                                    onKeyDown={this.handleKeyDown}
                                                // autoFocus
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
                                {value.itemsStatus === 'Đang sử dụng' ? (
                                    <img onClick={() => this.handleActionState(key)} title='Khóa mặt hàng' src='../icons/color/closed.png' />
                                ) : (
                                    <img onClick={() => this.handleActionState(key)} title='Mở khóa mặt hàng' src='../icons/color/open.png' />
                                )}
                            </td>
                        }
                    </tr>
                );
            });
        }
    };


    render() {
        // const {  dataItemsList } = this.state;
        const { isSearchDateTime } = this.state;
        const { permission } = this.props || ''
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <ItemListFormMenu permission={permission} />
                    </div>
                    <div className="head">
                        <h3>Danh mục mặt hàng</h3>
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
                                    <th >Mã hàng</th>
                                    <th >Tên hàng</th>
                                    <th >Người tạo</th>
                                    <th >Loại hàng</th>
                                    <th >Số lượng tồn ít nhất</th>
                                    <th >Số lượng tồn cao nhất</th>
                                    <th >Đơn vị tính</th>
                                    <th >Đơn giá dự kiến</th>
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
                                this.state.dataItemsList.length !== 0
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
export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
