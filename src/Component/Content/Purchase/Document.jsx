import axios from 'axios';
import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import Pagination from 'react-js-pagination';
import FilterTime from '../../FilterTime.jsx';
import { SearchDate } from '../../SearchDate.jsx';
import PurchaseFormMenu from './PurchaseFormMenu.jsx';
import { dataSearch, dataSearchValue, isDataSearch, searchDatetimeEnd, searchDatetimeStart } from '../../../StoreRcd.jsx';

const getdataDocument = () => axios.get('/getDocument').then((res) => res.data)
// const getDataEditMember = () => axios.get('/getEditMember').then((res) => res.data)

class Document extends Component {
    constructor(props) {
        super(props);
        this.state = {

            dataDocument: [],

            // pagination
            currentPage: 1,
            newsPerPage: 5, // show 5 product
            totalPage: 0,
            // datepicker search
            isSearchDateTime: false,

            enlargedImage: null // Đường dẫn ảnh phóng to

        };
        this.currentTodos = this.currentTodos.bind(this)
        this._isMounted = false
    }
    componentDidMount() {
        // this._isMounted = true
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
        getdataDocument().then((res) => {
            if (res) {
                // const initialRowStates = res.map(value => value.supplierStatus === 'Đang sử dụng');
                this.sortByDate(res.rows)

            }
        })
    }
    currentTodos = (dataDocument) => {
        const { currentPage, newsPerPage, } = this.state; // trang hiện tại acti  //cho trang tin tức mỗi trang
        const indexOfLastNews = currentPage * newsPerPage; // lấy vị trí cuối cùng của trang ,của data
        const indexOfFirstNews = indexOfLastNews - newsPerPage; // lấy vị trí đầu tiên  của trang ,của data
        this.state.totalPage = dataDocument.length;
        return dataDocument && dataDocument.slice(indexOfFirstNews, indexOfLastNews); // lấy dữ liệu ban đầu và cuối gán cho các list
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
    sortByDate = (dataDocument) => {
        const groupedData = {};
        let orderedGroups;
        dataDocument.forEach(item => {
            const key = item.documentDateCreated;
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
                // dataDocumentTeamp: dataDocument,
                dataDocument: sortedData,
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
        const { dataDocument } = this.state;
        const { dateTimeStart, dateTimeEnd } = this.props

        const dataSearchDate = SearchDate(dataDocument, dateTimeStart, dateTimeEnd);
        this.props.getDatasearchValue(dataSearchDate)
        this.props.is_DataSearch(true)

    }

    showFormRow = () => {
        const { dataDocument } = this.state;
        // const { permission } = this.props || ''

        if (dataDocument.length !== 0) {
            let currentTodos = []
            const { isDataSearch, dataSearchValue } = this.props;
            if (isDataSearch) {

                currentTodos = this.currentTodos(dataSearchValue)
            } else {
                currentTodos = this.currentTodos(dataDocument)
            }
            return currentTodos.map((value, key) => {


                return (
                    <tr key={key}>
                        {Object.entries(value).map(([columnName, cellValue]) => {
                            // Kiểm tra nếu columnName là 'tk_ma' và columnIndex nằm trong mảng nonEditableColumns
                            // Thì không hiển thị textarea
                            if (columnName === 'id') {
                                return null

                            } else {
                                if (columnName === 'documentImage') {
                                    return (
                                        <td key={columnName}>
                                            <img className='document-image' title='Click phóng to hình ảnh' src={cellValue} onClick={() => this.toggleEnlargeImage(cellValue)} />
                                        </td>
                                    )
                                } else {

                                    return (
                                        <td key={columnName}>
                                            {cellValue}
                                        </td>
                                    );
                                }
                            }
                        })}

                    </tr>
                );
            });
        }
    };
    toggleEnlargeImage = (imageUrl) => {
        // Nếu ảnh đang được hiển thị, ẩn nó đi bằng cách đặt enlargedImage thành null
        if (this.state.enlargedImage === imageUrl) {
            if (this._isMounted) {

                this.setState({ enlargedImage: null });
            }
        } else {
            if (this._isMounted) {

                // Nếu không, hiển thị ảnh phóng to bằng cách đặt enlargedImage thành đường dẫn của ảnh
                this.setState({ enlargedImage: imageUrl });
            }
        }
    };
    // tải lại dữ liệu
    refreshData = () => {
        this.props.is_DataSearch(false)
        this.props.getDatasearchValue([])

    }

    render() {
        // const {  dataDocument } = this.state;
        // const { permission } = this.props || ''

        // if(permission==='Thành viên'){
        //     return window.history.back()
        // }
        const { enlargedImage, isSearchDateTime } = this.state;

        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                      <PurchaseFormMenu/>
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

                                    <th >Mã chứng từ</th>
                                    <th >Hình ảnh</th>
                                    <th >Ngày tạo</th>

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
                                this.state.dataDocument.length !== 0
                                    ? this.state.totalPage
                                    : 0
                            }
                            pageRangeDisplayed={5} // show page
                            // firstPageText ={'Đầu'}
                            onChange={this.handlePageChange.bind(this)}
                        />

                    </div>
                    <div>
                        {/* Hiển thị ảnh phóng to như một popup */}
                        {enlargedImage &&
                            <div className="enlarged-image-overlay" onClick={() => this.toggleEnlargeImage(null)}>
                                <div className="enlarged-image-container">
                                    <img src={enlargedImage} alt="Enlarged Image" />
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
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
export default connect(mapStateToProps, mapDispatchToProps)(Document)
