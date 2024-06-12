import axios from 'axios';
import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom/cjs/react-router-dom';
import { UpdateDateTime } from '../../UpdateDateTime.jsx';
// import { NavLink, Redirect } from 'react-router-dom/cjs/react-router-dom.js';
import { toast } from 'react-toastify';
// import { randomId } from '../../RandomId/randomId.jsx'
import Pagination from "react-js-pagination";
// import bcrypt from 'bcryptjs';
import { connect } from 'react-redux';
import WarehouseFormMenu from './WarehouseFormMenu.jsx';
import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
import { dataSearch, dataSearchValue, isDataSearch, searchDatetimeEnd, searchDatetimeStart } from '../../../StoreRcd.jsx';

const getdataWarehouse = () => axios.get('/getWarehouse').then((res) => res.data)


class Warehouse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataWarehouse: [],
            editingRowIndex: null, // Khởi tạo editingRowIndex là null hoặc một giá trị mặc định khác nếu cần
            editingColumnName: null, // Khởi tạo editingColumnName là null hoặc một giá trị mặc định khác nếu cần
            editingValue: '', // Khởi tạo editingValue là một chuỗi trống
            nonEditableColumns: [10, 11, 12], // Chỉ số của các cột có thể sửa
            // sort by 
            currentTodos: [], // Dữ liệu hiện tại của bảng

            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,

            sortOrder: 'asc', // Thứ tự sắp xếp: 'asc' (tăng dần) hoặc 'desc' (giảm dần)
            dataWarehouseTeamp: [],
            isSort: false,
            // datepicker search
            isSearchDateTime: false,
            shouldResetSearchValue: false,

        }
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



    // Function to handle input change in the textarea
    handleInputChange = (event) => {
        this.setState({ reasonMessage: event.target.value });
    }

    currentTodos = (dataWarehouse) => {
        const { currentPage, newsPerPage } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataWarehouse.length;
        return dataWarehouse && dataWarehouse.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
    }




    getData = () => {
        this._isMounted = true
        const { tokenObj } = this.props || [];
        const calculateWarehouseStatus = (intoWarehouseDate, warehouseResidual, warehouseExpectedOut, warehouseQuotaMin, warehouseQuotaMax, warehouseStatus) => {
            let status = '';
            if (warehouseStatus === 'Không dùng') return status = 'Không dùng'
            else if (!intoWarehouseDate && parseInt(warehouseResidual) === 0) {
                status = 'Hàng mới';
            } else if (parseInt(warehouseResidual) > 0) {
                if (parseInt(warehouseResidual) > parseInt(warehouseExpectedOut)) {
                    status = 'Còn hàng';
                } else {
                    status = 'Hàng sắp hết';
                }
            } else if (parseInt(warehouseResidual) > parseInt(warehouseQuotaMin) && parseInt(warehouseResidual) > parseInt(warehouseQuotaMax)) {
                status = 'Hàng vượt định mức';
            } else if (parseInt(warehouseResidual) === 0) {
                status = 'Hết hàng';
            } else {
                status = 'Không dùng';
            }

            // Kiểm tra nếu trạng thái đã được xác định là 'Không dùng' thì không cần kiểm tra các điều kiện khác
            if (status === 'Không dùng') {
                return status;
            }

            return status;
        };

        getdataWarehouse().then((res) => {
            if (res) {
                const updatedData = res.rows.map(item => {
                    const { intoWarehouseDate, warehouseResidual, warehouseExpectedOut, warehouseQuotaMin, warehouseQuotaMax } = item;
                    const warehouseStatus = calculateWarehouseStatus(intoWarehouseDate, warehouseResidual, warehouseExpectedOut, warehouseQuotaMin, warehouseQuotaMax, item.warehouseStatus);
                    return { ...item, warehouseStatus };
                });
                if (this._isMounted) {
                    this.props.getDataSearch(updatedData)

                    this.setState({
                        dataWarehouse: updatedData.reverse(),
                        // totalPage: updatedData.length,

                    });

                }
            }
        })

    }

    // xử lý click double 
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

    handleChange = (event, rowIndex, columnName) => {
        const { dataWarehouse } = this.state;
        const newValue = event.target.value;

        // Cập nhật giá trị mới cho cột tương ứng
        const newdataWarehouse = dataWarehouse.map((row, index) => {
            if (index === rowIndex) {
                return { ...row, [columnName]: newValue };
            }
            return row;
        });

        // Tính toán giá trị mới cho cột intoMoney

        this.setState({ dataWarehouse: newdataWarehouse, editingValue: newValue });

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
        const newData = [...this.state.dataWarehouse];
        // Tìm chỉ mục của dòng cần cập nhật trong mảng newData
        const rowData = newData[editingRowIndex];
        const idUpdate = rowData.id;
        const updatedDateTime = UpdateDateTime();
        if (rowData) {

            // Cập nhật giá trị mới tại vị trí tương ứng trong newData
            rowData[editingColumnName] = editingValue; // cập nhật giá trị vào cột  
            newData[editingRowIndex] = rowData; // cập nhật vị trí dòng
            const pushdataWarehouse = [];
            newData.map((value) => {
                if (idUpdate === value.id) {

                    value.warehouseDateUpdate = updatedDateTime; // Thêm giá trị thời gian cập nhật mới vào object
                    pushdataWarehouse.push(value)
                }
            })
            // Thực hiện lưu dữ liệu dưới dạng axios
            axios.post('/updatedataWarehouseList', {
                pushdataWarehouse
            }).then(response => {
                // this.getData()
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
    handleCancelEdit = () => {
        this.setState({ editingRowIndex: null, editingColumnName: null, editingValue: '' });
    };



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
    handleHeaderClick = (columnName) => {
        let { dataWarehouse, dataWarehouseTeamp, sortOrder } = this.state;
        let { isDataSearch } = this.props

        const { dataSearchValue } = this.props || []
        if (isDataSearch) {
            dataWarehouseTeamp = dataSearchValue
            dataWarehouse = dataSearchValue
        }

        // Nhóm các phần tử theo giá trị của cột columnName
        const groupedData = {};
        let orderedGroups;
        dataWarehouse.forEach(item => {
            const key = item[columnName];
            if (!groupedData[key]) {
                groupedData[key] = [];
            }
            groupedData[key].push(item);
        });
        if (columnName !== 'warehouseResidual' && columnName !== 'warehouseUnitPrice'
            && columnName !== 'warehouseExpectedOut' && columnName !== 'warehouseQuotaMin' && columnName !== 'warehouseQuotaMax'
        ) {

            // Sắp xếp các nhóm theo thứ tự bạn mong muốn
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


        } else {

            // Sắp xếp các nhóm theo thứ tự bạn mong muốn (ở đây là đảo ngược giá trị của key)
            orderedGroups = Object.keys(groupedData).sort((a, b) => parseInt(b) - parseInt(a));

        }

        // Kết hợp các nhóm đã sắp xếp lại thành một mảng duy nhất
        let sortedData = [];
        orderedGroups.forEach(key => {
            sortedData = sortedData.concat(groupedData[key]);
        });

        if (sortOrder === 'asc') {

            this.setState({
                dataWarehouseTeamp: dataWarehouse,
                dataWarehouse: sortedData,
                isSort: true,
                sortOrder: 'desc', // Đảo ngược sắp xếp mỗi khi click để giữ cho cụm có thứ tự giảm dần
            });
        } else {
            this.setState({
                dataWarehouse: dataWarehouseTeamp,
                sortOrder: 'asc',
                isSort: true
            })
        }
        this.props.is_DataSearch(false)
    };


    showFormRow = () => {
        const { dataWarehouse, editingRowIndex, editingColumnName, editingValue, nonEditableColumns, isSort } = this.state;
        // sort((a, b) => parseInt(a.catalog) - parseInt(b.catalog)).reverse()

        if (dataWarehouse) {
            let currentTodos = []
            let { isDataSearch } = this.props

            if (isDataSearch) {
                const { dataSearchValue } = this.props || []
                currentTodos = this.currentTodos(dataSearchValue);
            }
            else {
                currentTodos = this.currentTodos(dataWarehouse);
            }
            //  const  currentTodos=  this.sortByOrder()
            // currentTodos.sort((a, b) => parseInt(a.warehouseQuotaMax) - parseInt(b.warehouseQuotaMax)).reverse()



            return currentTodos.map((row, rowIndex) => {

                return (
                    <tr key={rowIndex}>
                        {Object.entries(row).map(([columnName, cellValue], colIndex) => {

                            if (columnName === 'intoWarehouseCode' || columnName === 'id' || columnName === 'warehouseType' ||
                                columnName === 'exportWarehouseCode') {
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

                                            : columnName === 'warehouseStatus' ? ( // Kiểm tra nếu columnName là 'statusOrder'
                                                <span className={cellValue === 'Hàng Sắp hết' ? 'statusYellow' :
                                                    cellValue === 'Còn hàng' ? 'statusGreen' : cellValue === 'Hàng mới' ?
                                                        'statusGreenYellow' : cellValue === 'Không dùng' ? 'statusRed' : cellValue === 'Hết hàng' ?
                                                            'statusRed' : 'statusBrow'}>
                                                    {cellValue}
                                                </span>
                                            )

                                                : columnName === 'warehouseUnitPrice' ? (
                                                    // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                    <span>
                                                        {parseFloat(row.warehouseUnitPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                    </span>
                                                )
                                                    : columnName === 'warehouseResidual' ? (
                                                        // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                        <span>
                                                            {parseFloat(row.warehouseResidual).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                        </span>
                                                    )
                                                        : columnName === 'warehouseExpectedOut' ? (
                                                            // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                            <span>
                                                                {parseFloat(row.warehouseExpectedOut).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                            </span>
                                                        )
                                                            : columnName === 'warehouseQuotaMin' ? (
                                                                // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                                <span>
                                                                    {parseFloat(row.warehouseQuotaMin).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                </span>
                                                            )
                                                                : columnName === 'warehouseQuotaMax' ? (
                                                                    // Thực hiện tính giá trị intoMoney dựa trên amount và unitPrice
                                                                    <span>
                                                                        {parseFloat(row.warehouseQuotaMax).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                                    </span>
                                                                )

                                                                    : (
                                                                        <span>{cellValue}</span>
                                                                    )}
                                    </td>
                                );
                            }
                        })}
                        {/* hành động */}

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

    formSearchDateTime = () => {
        if (!this.state.isSearchDateTime) {
            this.props.SearchDateTimeStart('')
            this.props.SearchDateTimeEnd(new Date().toISOString())
        }
        this.setState({ isSearchDateTime: !this.state.isSearchDateTime })
    }
    searchDateTime = () => {
        const { dataWarehouse } = this.state;
        const { dateTimeStart, dateTimeEnd } = this.props

        // let currentTodos = []
        // let { isDataSearch } = this.props
        // if (isDataSearch) {
        //     const { dataSearchValue } = this.props || []
        //     currentTodos = this.currentTodos(dataSearchValue);
        // }

        const dataSearchDate = SearchDate(dataWarehouse, dateTimeStart, dateTimeEnd);
        this.props.getDatasearchValue(dataSearchDate)
        this.props.is_DataSearch(true)
        // this.props.SearchDateTimeStart('')
        // this.props.SearchDateTimeEnd(new Date().toISOString())

        // this.setState({ isSearchDateTime: false, })
    }
    render() {
        const { isSearchDateTime } = this.state;
        console.log('kho');
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <WarehouseFormMenu />
                    </div>
                    <div className="head">
                        <h3>Danh mục kho tổng</h3>
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


                                    {/* <th><i className='bx bxs-flag-checkered'></i></th> */}

                                    {/* <th >STT</th> */}

                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('id')}>Mã kho <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseItemsCode')}>Mã hàng <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseItemsName')}>Tên hàng <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseAreaName')}>Khu vực kho <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseItemsCommodities')}>Loại hàng <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseUnitPrice')}>Đơn giá (VND) <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseResidual')}>Số lượng tồn <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseUnit')}>Đơn vị tính <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseExpectedOut')}>Hàng Dự kiến sắp hết <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseQuotaMin')}>Định mức tồn thấp nhất <i className='bx bx-sort sort' /></th>

                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseQuotaMax')}>Định mức tồn cao nhất <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseStatus')}>Trạng thái <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseDateCreated')}>Ngày tạo <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('warehouseDateUpdate')}>Ngày cập nhật <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('intoWarehouseDate')}>Ngày nhập kho gần nhất <i className='bx bx-sort sort' /></th>
                                    <th title='Sắp xếp theo cụm giảm dần' onClick={() => this.handleHeaderClick('exportWarehouseDate')}>Ngày xuất kho gần nhất <i className='bx bx-sort sort' /></th>

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
                                this.state.dataWarehouse.length !== 0
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

const mapStateToProps = (state, ownProps) => {
    return {
        // permission: state.allReducer.permission,
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
export default connect(mapStateToProps, mapDispatchToProps)(Warehouse)