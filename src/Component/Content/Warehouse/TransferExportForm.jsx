import React, { Component, Fragment } from 'react';
// import RequestInto from '../RequestInto/RequestInto';

import { connect } from 'react-redux';
import TransferExportApproved from './TransferExportApproved';
import WarehouseFormMenu from './WarehouseFormMenu';
import TransferExport from './TransferExport';
import TransferExportAll from './TransferExportAll';
import { isSearchFormTransferExport } from '../../../StoreRcd';

class TransferExportForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Đơn đã duyệt',
            // Thêm state để lưu trữ component cần hiển thị
            selectedComponentApproved: null,
            activeMenuApproved: 'Đơn đã duyệt',
            activeMenuApprovedExport: 'Đơn Chuyển kho chưa duyệt',
            selectedComponentApprovedExport: null,
            canClick: true,
        }
    }
    componentWillUnmount() {
        // this.setState({
        //     // activeMenuApproved: 'Đơn đã duyệt',
        //     // activeTab: 'Đơn đã duyệt',
        //     // selectedComponentApproved: null,
        //     // activeMenuApprovedExport: 'Đơn Chuyển kho chưa duyệt',
        //     // selectedComponentApprovedExport: null,
        // })

        this.props.is_SearchFormTransferExport(false)
    }

    // Hàm để thay đổi tab
    changeTab = (tabName) => {
        if (!this.state.canClick) return; // Nếu không thể click, thoát khỏi hàm
        this.setState({ activeTab: tabName, canClick: false }, () => {
            setTimeout(() => {
                this.setState({ canClick: true }); // Sau khi delay, cho phép click lại
            }, 500);
        });
        if (tabName === 'Lịch sử') {
            this.props.is_SearchFormTransferExport(true)
        }
        else {
            this.props.is_SearchFormTransferExport(false)
        }

    };

    componentDidMount() {

        const { tokenObj } = this.props || []
        this.setState({
            selectedComponentApproved: <TransferExportApproved tokenObj={tokenObj} />,

        })
    }

    // Hàm để hiển thị nội dung của tab tương ứng
    renderTabContent = () => {
        const { activeTab, selectedComponentApproved, selectedComponentApprovedExport } = this.state;
        const { tokenObj } = this.props || []

        switch (activeTab) {
            case 'Đơn đã duyệt':
                if (selectedComponentApproved) {
                    return selectedComponentApproved
                }
            // return this.renderTabApproved()
            case 'Chuyển kho':
                // if (selectedComponentApprovedExport) {
                //     return selectedComponentApprovedExport
                // }
                return this.renderTabTransferExport()
            default:
                return null;
        }
    };

    // handleClickMenuInto = (component, menuName) => {
    //     // Cập nhật state selectedComponentApproved khi click vào menu
    //     if (menuName === 'Tất cả đơn') {
    //         this.props.is_SearchFormTransferExport(true)
    //     } else {
    //         this.props.is_SearchFormTransferExport(false)
    //     }
    //     this.setState({ selectedComponentApproved: component, activeMenuApproved: menuName });
    // }
    // handleClickMenuExport = (component, menuName) => {
    //     // Cập nhật state selectedComponentApproved khi click vào menu

    //     this.setState({ selectedComponentApprovedExport: component, activeMenuApprovedExport: menuName });
    // }

    // Hàm hiển thị nội dung cho tab 'Đơn đã duyệt'
    renderTabApproved = () => {
        const { tokenObj } = this.props || []
        let { selectedComponentApproved } = this.state;

        return (
            selectedComponentApproved

        )
    }

    // Hàm hiển thị nội dung cho tab 'Chuyển kho'
    renderTabTransferExport = () => {
        const { tokenObj } = this.props || []


        return (
            <TransferExport tokenObj={tokenObj} />

        );
    };
    // Hàm hiển thị nội dung cho tab 'Chuyển kho'
    renderTabHistory = () => {
        const { tokenObj } = this.props || []
        return (
            <TransferExportAll tokenObj={tokenObj} />

        );
    };

    render() {
        const { activeTab } = this.state;

        const { tokenObj } = this.props || []
        return (
            <div className='table-data'>
                <div style={{ marginLeft: '-2%' }} className="order">
                    <div style={{ marginLeft: '2%' }} className='head'>
                        <WarehouseFormMenu />
                    </div>
                    <div className="tabsOverView">
                        <div
                            className={activeTab === 'Đơn đã duyệt' ? 'active tab' : 'tab'}
                            onClick={() => this.changeTab('Đơn đã duyệt')}
                        >
                            Đơn đã duyệt
                        </div>
                        <div
                            className={activeTab === 'Chuyển kho' ? 'active tab' : 'tab'}
                            onClick={() => this.changeTab('Chuyển kho')}
                        >
                            Chuyển kho
                        </div>
                        <div
                            className={activeTab === 'Lịch sử' ? 'active tab' : 'tab'}
                            onClick={() => this.changeTab('Lịch sử')}
                        >
                            Lịch sử
                        </div>
                    </div>
                    {activeTab === 'Đơn đã duyệt' ?
                        this.renderTabApproved()
                        : activeTab === 'Chuyển kho' ? this.renderTabTransferExport()
                            : this.renderTabHistory()
                    }
                    {/* {this.renderTabContent()} */}
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        // permission: state.allReducer.permission

    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        is_SearchFormTransferExport: (acttion_isSearchForm) => {
            dispatch(isSearchFormTransferExport(acttion_isSearchForm))
        },
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TransferExportForm)

