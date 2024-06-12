import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { stringtoslug } from '../../stringtoslug'
import {dataSearchValue}from '../../../StoreRcd.jsx'
import {isDataSearch}from '../../../StoreRcd.jsx'

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',

        }
        this.searchInput = React.createRef(); // Tạo một ref
    }
    getSearchUrl = () => {
        // re view search form
        const { pathUrl } = this.props || '';
        let searchValueName = {}

        switch (pathUrl) {

            case '/profile-acctount':
                let { isSearchFormExportProfile, isSearchFormIntoProfile, isSearchFormHistoryProfile } = this.props;



                if (isSearchFormIntoProfile && isSearchFormHistoryProfile) {
                    return searchValueName = {

                        placeholderName: 'Tìm theo mã, tên hàng,loại hàng...',
                    }
                }
                else if (isSearchFormExportProfile && isSearchFormHistoryProfile) {
                    return searchValueName = {

                        placeholderName: 'Tìm theo mã, tên hàng, loại hàng...',
                    }
                }
                else {
                    return
                }
            case '/warehouse':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên hàng, loại hàng...',
                }

            case '/into-warehouse-list':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên hàng, loại hàng...',
                }


            case '/warehouse-list':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên kho...',
                }
            case '/transfer-warehouse-export':
                const { isSearchFormTransferExport } = this.props || false;

                if (isSearchFormTransferExport) {

                    return searchValueName = {

                        placeholderName: 'Tìm theo mã, tên hàng...',
                    }
                } else return




            case '/purchase/document':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên chứng từ...',
                }


            case '/supplier':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên đối tác...',
                }


            case '/purchase/request-all':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên hàng...',
                }

            case '/member':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên thành viên, số điện thoại...',
                }

            case '/list-account':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên tài khoản, email...',
                }


            case '/request':
                let { isSearchFormInto, isSearchFormExport } = this.props;

                if (isSearchFormInto) {
                    return searchValueName = {

                        placeholderName: 'Tìm theo mã, tên hàng...',
                    }
                }
                else if (isSearchFormExport) {
                    return searchValueName = {

                        placeholderName: 'Tìm theo mã, tên hàng...',
                    }
                }
                else {
                    return
                }

            case '/itemlist':

                return searchValueName = {

                    placeholderName: 'Tìm theo mã, tên hàng...',
                }

            default:

                return;
        }
    }
    // componentDidUpdate(prevProps, prevState) {
    //     const { pathUrl } = this.props || '';
    //     if (pathUrl && prevProps.pathUrl !== pathUrl) {

    //     }
    // }
    handleChange = (e) => {
        const { value, name } = e.target;
        this.setState({ [name]: value })
    }
    // Hàm xử lý tìm kiếm
    handleSearch = () => {
        const { pathUrl } = this.props || '';
        const { dataSearch } = this.props || [];

        const { searchValue } = this.state;
        const pushDataSearch = [];
        const normalizedSearchValue = this.removeVietnameseTones(searchValue.toLowerCase());
        switch (pathUrl) {
            case '/warehouse':

                // Thực hiện tìm kiếm dựa trên giá trị searchValueName
                dataSearch.map(value => {
                    // tìm kiếm theo tên hàng
                    if ((this.removeVietnameseTones(value.warehouseItemsName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    //  tìm kiếm theo mã hàng
                    else if ((this.removeVietnameseTones(value.warehouseItemsCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    //  tìm kiếm theo loại hàng
                    else if ((this.removeVietnameseTones(value.warehouseItemsCommodities).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    //  tìm kiếm theo tên khu vực kho
                    else if ((this.removeVietnameseTones(value.warehouseAreaName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    //  tìm kiếm theo trạng thái 
                    else if ((this.removeVietnameseTones(value.warehouseStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }


                    return pushDataSearch
                });

                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;
            case '/into-warehouse-list':


                // Thực hiện tìm kiếm dựa trên giá trị searchValueName

                dataSearch.map(value => {
                    // tìm kiếm theo mã chứng từ
                    if ((this.removeVietnameseTones(value.intoWarehouseCodeDocument).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    //  tìm kiếm theo mã hàng
                    else if ((this.removeVietnameseTones(value.intoWarehouseItemsCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    //  tìm kiếm theo tên hàng
                    else if ((this.removeVietnameseTones(value.intoWarehouseItemsName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    //  tìm kiếm theo loại hàng
                    else if ((this.removeVietnameseTones(value.intoWarehouseItemsCommodities).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    //  tìm kiếm theo đối tác 
                    else if ((this.removeVietnameseTones(value.intoWarehouseSupplier).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }


                    return pushDataSearch
                });

                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;
            case '/warehouse-list':
                dataSearch.map(value => {

                    // tìm kiếm theo mã kho
                    if ((this.removeVietnameseTones(value.warehouseCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo tên kho
                    else if ((this.removeVietnameseTones(value.warehouseName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    // tìm kiếm theo trạng thái
                    else if ((this.removeVietnameseTones(value.warehouseStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    return pushDataSearch
                });

                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;
            case '/transfer-warehouse-export':
                const { isSearchFormTransferExport } = this.props || false;
                if (isSearchFormTransferExport) {


                    dataSearch.map(value => {

                        // tìm kiếm theo từ kho
                        if ((this.removeVietnameseTones(value.requestTransferFromWarehouse).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo đến kho
                        else if ((this.removeVietnameseTones(value.requestTransferToWarehouse).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo người tạo
                        else if ((this.removeVietnameseTones(value.requestTransferMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã hàng
                        else if ((this.removeVietnameseTones(value.warehouseItemsCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo tên hàng
                        else if ((this.removeVietnameseTones(value.requestTransferItemsName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }

                        // tìm kiếm theo trạng thái
                        else if ((this.removeVietnameseTones(value.requestTransferStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã xuất pdf
                        else if ((this.removeVietnameseTones(value.requestIdHistory).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                            pushDataSearch.push(value);
                        }
                        return pushDataSearch
                    });
                }
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;

            case '/purchase/document':

                dataSearch.map(value => {
                    // Chuẩn hóa chuỗi tìm kiếm
                    // tìm kiếm theo mã chứng từ
                    if ((this.removeVietnameseTones(value.documentCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    return pushDataSearch
                });
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;


            case '/supplier':
                dataSearch.map(value => {
                    // Chuẩn hóa chuỗi tìm kiếm

                    // tìm kiếm theo tên NCC
                    if ((this.removeVietnameseTones(value.supplierName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    // tìm kiếm theo SDT NCC
                    else if ((this.removeVietnameseTones(value.supplierNumberPhone).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo email NCC
                    else if ((this.removeVietnameseTones(value.supplierEmail).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo Địa chỉ NCC
                    else if ((this.removeVietnameseTones(value.supplierAddress).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo công ty NCC
                    else if ((this.removeVietnameseTones(value.supplierCompany).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo supplierTaxCode NCC
                    else if ((this.removeVietnameseTones(value.supplierTaxCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo trạng thái NCC
                    else if ((this.removeVietnameseTones(value.supplierStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }

                    return pushDataSearch
                });
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;

            case '/purchase/request-all':


                dataSearch.map(value => {

                    // Chuẩn hóa chuỗi tìm kiếm
                    // tìm kiếm theo mã hàng
                    if ((this.removeVietnameseTones(value.orderCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo người tạo
                    else if ((this.removeVietnameseTones(value.orderMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo tên hàng
                    else if ((this.removeVietnameseTones(value.orderName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo đơn giá
                    else if ((this.removeVietnameseTones(value.unitPrice).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo trạng thái
                    else if ((this.removeVietnameseTones(value.statusOrder).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo loại hàng
                    else if ((this.removeVietnameseTones(value.unit).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo bộ phận
                    else if ((this.removeVietnameseTones(value.department).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo đối tác
                    else if ((this.removeVietnameseTones(value.orderSupplierName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo mã lịch sử xuất file
                    else if ((this.removeVietnameseTones(value.idHistory).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                        pushDataSearch.push(value);
                    }
                    return pushDataSearch
                });
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;
            case '/member':
                console.log(dataSearch,'dataSearch');
                dataSearch.map(value => {
                    // Chuẩn hóa chuỗi tìm kiếm
                    // tìm kiếm theo mã thành viên
                    if ((this.removeVietnameseTones(value.memberCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo tên người tạo
                    else if ((this.removeVietnameseTones(value.memberMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo cấp quyền
                    else if ((this.removeVietnameseTones(value.memberPermission).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo tên thành viên
                    else if ((this.removeVietnameseTones(value.memberName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo bộ phận
                    else if ((this.removeVietnameseTones(value.memberDepartment).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo trạng thái
                    else if ((this.removeVietnameseTones(value.memberStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    return pushDataSearch
                });
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;

            case '/list-account':

                dataSearch.map(value => {
                    // Chuẩn hóa chuỗi tìm kiếm
                    // tìm kiếm theo mã tài khoản
                    if ((this.removeVietnameseTones(value.accountCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo email
                    else if ((this.removeVietnameseTones(value.accountEmail).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo cấp quyền
                    else if ((this.removeVietnameseTones(value.accountPermission).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo tên tài khoản
                    else if ((this.removeVietnameseTones(value.accountUserName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                        pushDataSearch.push(value);
                    }

                    // tìm kiếm theo trạng thái
                    else if ((this.removeVietnameseTones(value.accountStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    return pushDataSearch
                });
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;

            case '/request':
                const { isSearchFormInto, isSearchFormExport } = this.props;
                if (isSearchFormInto) {


                    dataSearch.map(value => {

                        // Chuẩn hóa chuỗi tìm kiếm
                        // tìm kiếm theo mã hàng
                        if ((this.removeVietnameseTones(value.orderCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo người tạo
                        else if ((this.removeVietnameseTones(value.orderMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo tên hàng
                        else if ((this.removeVietnameseTones(value.orderName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo đơn giá
                        else if ((this.removeVietnameseTones(value.unitPrice).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo loại hàng
                        else if ((this.removeVietnameseTones(value.unit).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo trạng thái
                        else if ((this.removeVietnameseTones(value.statusOrder).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo bộ phận
                        else if ((this.removeVietnameseTones(value.department).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo đối tác
                        else if ((this.removeVietnameseTones(value.orderSupplierName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã lịch sử xuất file
                        else if ((this.removeVietnameseTones(value.idHistory).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                            pushDataSearch.push(value);
                        }

                        return pushDataSearch
                    });
                }
                else if (isSearchFormExport) {

                    dataSearch.map(value => {

                        // tìm kiếm theo từ kho
                        if ((this.removeVietnameseTones(value.requestTransferFromWarehouse).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo đến kho
                        else if ((this.removeVietnameseTones(value.requestTransferToWarehouse).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo người tạo
                        else if ((this.removeVietnameseTones(value.requestTransferMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã hàng
                        else if ((this.removeVietnameseTones(value.warehouseItemsCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo tên hàng
                        else if ((this.removeVietnameseTones(value.requestTransferItemsName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }

                        // tìm kiếm theo trạng thái
                        else if ((this.removeVietnameseTones(value.requestTransferStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã xuất pdf
                        else if ((this.removeVietnameseTones(value.requestIdHistory).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                            pushDataSearch.push(value);
                        }

                        return pushDataSearch
                    });
                }
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;
            case '/profile-acctount':
                const { isSearchFormIntoProfile, isSearchFormExportProfile, isSearchFormHistoryProfile } = this.props;
                if (isSearchFormIntoProfile && isSearchFormHistoryProfile) {


                    dataSearch.map(value => {

                        // Chuẩn hóa chuỗi tìm kiếm
                        // tìm kiếm theo mã hàng
                        if ((this.removeVietnameseTones(value.orderCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo người tạo
                        else if ((this.removeVietnameseTones(value.orderMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo tên hàng
                        else if ((this.removeVietnameseTones(value.orderName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo đơn giá
                        else if ((this.removeVietnameseTones(value.unitPrice).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo loại hàng
                        else if ((this.removeVietnameseTones(value.unit).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo trạng thái
                        else if ((this.removeVietnameseTones(value.statusOrder).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo bộ phận
                        else if ((this.removeVietnameseTones(value.department).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo đối tác
                        else if ((this.removeVietnameseTones(value.orderSupplierName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã lịch sử xuất file
                        else if ((this.removeVietnameseTones(value.idHistory).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                            pushDataSearch.push(value);
                        }

                        return pushDataSearch
                    });
                }
                else if (isSearchFormExportProfile && isSearchFormHistoryProfile) {

                    dataSearch.map(value => {

                        // tìm kiếm theo từ kho
                        if ((this.removeVietnameseTones(value.requestTransferFromWarehouse).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo đến kho
                        else if ((this.removeVietnameseTones(value.requestTransferToWarehouse).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo người tạo
                        else if ((this.removeVietnameseTones(value.requestTransferMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã hàng
                        else if ((this.removeVietnameseTones(value.warehouseItemsCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo tên hàng
                        else if ((this.removeVietnameseTones(value.requestTransferItemsName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }

                        // tìm kiếm theo trạng thái
                        else if ((this.removeVietnameseTones(value.requestTransferStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                            pushDataSearch.push(value);
                        }
                        // tìm kiếm theo mã xuất pdf
                        else if ((this.removeVietnameseTones(value.requestIdHistory).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                            pushDataSearch.push(value);
                        }

                        return pushDataSearch
                    });
                }
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;

            case '/itemlist':
                dataSearch.map(value => {
                    // tìm kiếm theo mã hàng
                    // Chuẩn hóa chuỗi tìm kiếm


                    // tìm kiếm theo mã hàng
                    if ((this.removeVietnameseTones(value.itemsCode).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo tên hàng
                    else if ((this.removeVietnameseTones(value.itemsName).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo người tạo
                    else if ((this.removeVietnameseTones(value.itemsMaker).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo loại hàng
                    else if ((this.removeVietnameseTones(value.itemsCommodities).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {

                        pushDataSearch.push(value);
                    }
                    // tìm kiếm theo trạng thái
                    else if ((this.removeVietnameseTones(value.itemsStatus).toLowerCase().indexOf(normalizedSearchValue) !== -1)) {
                        pushDataSearch.push(value);
                    }
                    return pushDataSearch
                });
                // Gửi kết quả tìm kiếm qua action của Redux
                this.props.getDatasearchValue(pushDataSearch);
                this.props.is_DataSearch(true);
                break;
            default:
                return;
            // break;
        }

    }
    removeVietnameseTones = (str) => {
        if (!str) return ''; // Kiểm tra nếu str là null hoặc undefined
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
        return str;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.dataSearchValue.length === 0 && this.props.dataSearchValue.length > 0) {
            // Nếu dataSearchValue trước đó là rỗng và giờ là một mảng có giá trị, đặt giá trị của input thành rỗng
            this.searchInput.current.value = '';
        }


    }
    render() {

        const searchValueName = this.getSearchUrl() || '';
        const { dataSearchValue } = this.props;
        let { isDataSearchURL } = this.props
        const placeholderValue = dataSearchValue.length === 0 ? '' : searchValueName.placeholderName;

        return (
            <Fragment>


                <span className="searchValue-span">
                    {/* {this.getSearchUrl()} */}
                    {searchValueName && 'Tìm kiếm'}
                    {/* <i className="fa fa-caret-down" aria-hidden="true"></i> */}
                </span>
                <form id='searchValue' onSubmit={e => e.preventDefault()}>
                    {searchValueName &&

                        <div className="form-input searchValue">
                            <input type="text" name='searchValue' ref={this.searchInput} onChange={(e) => this.handleChange(e)} placeholder={placeholderValue || searchValueName.placeholderName} />
                            <button type="button" onClick={this.handleSearch} className="search-btn">
                                <i className="bx bx-search" />
                            </button>
                        </div>
                    }
                </form>




            </Fragment>

        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        dataSearchValue: state.allReducer.dataSearchValue,
        isDataSearch: state.allReducer.isDataSearch,
        isDataSearchURL: state.allReducer.isDataSearchURL,

        isSearchFormInto: state.allReducer.isSearchFormInto,
        isSearchFormExport: state.allReducer.isSearchFormExport,

        isSearchFormTransferExport: state.allReducer.isSearchFormTransferExport,

        isSearchFormExportProfile: state.allReducer.isSearchFormExportProfile,
        isSearchFormIntoProfile: state.allReducer.isSearchFormIntoProfile,
        isSearchFormHistoryProfile: state.allReducer.isSearchFormHistoryProfile,
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getDatasearchValue: (action_dataSearchValue) => {
            dispatch(dataSearchValue(action_dataSearchValue))
        },
        is_DataSearch: (action_isDataSearch) => {
            dispatch(isDataSearch(action_isDataSearch))
        },



    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Search)
