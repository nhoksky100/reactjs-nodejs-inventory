import React, { Component, Fragment } from 'react';
// import RequestInto from '../RequestInto/RequestInto';
import RequestListNotApprove from '../RequestInto/RequestListNotApprove';
import RequestListApproved from '../RequestInto/RequestListApproved';
import RequestListReturn from '../RequestInto/RequestListReturn';
import RequestListAll from '../RequestInto/RequestListAll';
import AddRequest from '../RequestInto/AddRequest';
import AddRequestExport from '../RequestExport/AddRequest';
import RequestListNotApproveExport from '../RequestExport/RequestListNotApprove';
import RequestListApprovedExport from '../RequestExport/RequestListApproved';
import RequestListReturnExport from '../RequestExport/RequestListReturn';
import RequestListAllExport from '../RequestExport/RequestListAll';
import { connect } from 'react-redux';
import { isSearchFormExport, isSearchFormInto } from '../../../StoreRcd';

class Request extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Nhập',
            // Thêm state để lưu trữ component cần hiển thị
            selectedComponent: null,
            activeMenu: 'Đơn nhập chưa duyệt',
            activeMenuExport: 'Đơn xuất chưa duyệt',
            selectedComponentExport: null,
            canClick: true,
        }
    }
    componentWillUnmount() {
        this.setState({
            activeMenu: 'Đơn nhập chưa duyệt',
            activeTab: 'Nhập',
            selectedComponent: null,
            activeMenuExport: 'Đơn xuất chưa duyệt',
            selectedComponentExport: null,
        })
        this.props.is_SearchFormInto(false)
        this.props.is_SearchFormExport(false)
    }

    // Hàm để thay đổi tab
    changeTab = (tabName) => {
        if (!this.state.canClick) return; // Nếu không thể click, thoát khỏi hàm
        this.setState({ activeTab: tabName, canClick: false }, () => {
            setTimeout(() => {
                this.setState({ canClick: true }); // Sau khi delay, cho phép click lại
            }, 500);
        });
        if (tabName === 'Xuất' && this.state.activeMenuExport === 'Tất cả đơn xuất') {
            this.props.is_SearchFormExport(true)
        } else {
            this.props.is_SearchFormExport(false)
        }
        if (tabName === 'Nhập' && this.state.activeMenu === 'Tất cả đơn nhập') {
            this.props.is_SearchFormInto(true)
        } else {
            this.props.is_SearchFormInto(false)
        }

    };
    componentDidMount() {

        const { tokenObj } = this.props || []
        const request = sessionStorage.getItem('request') || 'Nhập'
        this.setState({
            activeTab: request,
            selectedComponent: <RequestListNotApprove tokenObj={tokenObj} />,
            selectedComponentExport: <RequestListNotApproveExport tokenObj={tokenObj} />
        })
    }

    // Hàm để hiển thị nội dung của tab tương ứng
    renderTabContent = () => {
        const { activeTab, selectedComponent, selectedComponentExport } = this.state;
        const { tokenObj } = this.props || []

        switch (activeTab) {
            case 'Nhập':
                if (selectedComponent) {
                    sessionStorage.setItem('request', 'Nhập')
                    return selectedComponent
                }
                return this.renderTabInto()
            case 'Xuất':
                if (selectedComponentExport) {
                    sessionStorage.setItem('request', 'Xuất')
                    return selectedComponentExport
                }
            default:
                return null;
        }
    };

    handleClickMenuInto = (component, menuName) => {
        // Cập nhật state selectedComponent khi click vào menu

        if (menuName === 'Tất cả đơn nhập') {
            this.props.is_SearchFormInto(true)
        } else {
            this.props.is_SearchFormInto(false)
        }
        this.setState({ selectedComponent: component, activeMenu: menuName });
    }
    handleClickMenuExport = (component, menuName) => {
        // Cập nhật state selectedComponent khi click vào menu
        if (menuName === 'Tất cả đơn xuất') {
            this.props.is_SearchFormExport(true)
        } else {
            this.props.is_SearchFormExport(false)
        }
        this.setState({ selectedComponentExport: component, activeMenuExport: menuName });
    }

    // Hàm hiển thị nội dung cho tab 'Nhập'
    renderTabInto = () => {
        const { tokenObj } = this.props || []
        const { permission } = this.props || ''
        let { activeMenu } = this.state;
        return (
            <div className="head-content-menu row-conent-menu">
                {/* Gọi handleClickMenu với component tương ứng */}
                <a onClick={() => this.handleClickMenuInto(<RequestListNotApprove tokenObj={tokenObj} />, 'Đơn nhập chưa duyệt')} className={`btn btn-success ${activeMenu === 'Đơn nhập chưa duyệt' ? 'active' : ''}`}>Đơn chưa duyệt</a>
                <a onClick={() => this.handleClickMenuInto(<RequestListApproved tokenObj={tokenObj} />, 'Đơn nhập đã duyệt')} to='/requestInto/request-approved' className={`btn btn-success ${activeMenu === 'Đơn nhập đã duyệt' ? 'active' : ''}`}>Đơn đã duyệt</a>
                <a onClick={() => this.handleClickMenuInto(<RequestListReturn tokenObj={tokenObj} />, 'Đơn nhập từ chối')} className={`btn btn-success ${activeMenu === 'Đơn nhập từ chối' ? 'active' : ''}`}>Đơn từ chối</a>
                {permission !== 'Lãnh đạo' && permission !== 'Trưởng phòng' &&
                    <a onClick={() => this.handleClickMenuInto(<AddRequest tokenObj={tokenObj} />, 'Tạo đơn nhập')} className={`btn btn-success ${activeMenu === 'Tạo đơn nhập' ? 'active' : ''}`}>Tạo đơn</a>
                }
                <a onClick={() => this.handleClickMenuInto(<RequestListAll tokenObj={tokenObj} />, 'Tất cả đơn nhập')} className={`btn btn-success ${activeMenu === 'Tất cả đơn nhập' ? 'active' : ''}`}>Lịch sử đơn</a>
            </div>

        )
    }

    // Hàm hiển thị nội dung cho tab 'Xuất'
    renderTabExport = () => {
        const { tokenObj } = this.props || []
        const { permission } = this.props || ''
        let { activeMenuExport } = this.state;

        return (
            <div className="head-content-menu row-conent-menu">
                <a onClick={() => this.handleClickMenuExport(<RequestListNotApproveExport tokenObj={tokenObj} />, 'Đơn xuất chưa duyệt')} className={`btn btn-success ${activeMenuExport === 'Đơn xuất chưa duyệt' ? 'active' : ''}`}>Đơn chưa duyệt</a>
                <a onClick={() => this.handleClickMenuExport(<RequestListApprovedExport tokenObj={tokenObj} />, 'Đơn xuất đã duyệt')} className={`btn btn-success ${activeMenuExport === 'Đơn xuất đã duyệt' ? 'active' : ''}`}>Đơn đã duyệt</a>
                <a onClick={() => this.handleClickMenuExport(<RequestListReturnExport tokenObj={tokenObj} />, 'Đơn xuất từ chối')} className={`btn btn-success ${activeMenuExport === 'Đơn xuất từ chối' ? 'active' : ''}`}>Đơn từ chối</a>

                {permission !== 'Lãnh đạo' && permission !== 'Trưởng phòng' &&
                    <a onClick={() => this.handleClickMenuExport(<AddRequestExport tokenObj={tokenObj} />, 'Tạo đơn xuất')} className={`btn btn-success ${activeMenuExport === 'Tạo đơn xuất' ? 'active' : ''}`}>Tạo đơn</a>
                }
                <a onClick={() => this.handleClickMenuExport(<RequestListAllExport tokenObj={tokenObj} />, 'Tất cả đơn xuất')} className={`btn btn-success ${activeMenuExport === 'Tất cả đơn xuất' ? 'active' : ''}`}>Lịch sử đơn</a>

            </div>

        );
    };

    render() {
        const { activeTab } = this.state;

        const { tokenObj } = this.props || []
        return (
            <Fragment>
                <div className="tabsOverView">
                    <div
                        className={activeTab === 'Nhập' ? 'active tab' : 'tab'}
                        onClick={() => this.changeTab('Nhập')}
                    >
                        Nhập
                    </div>
                    <div
                        className={activeTab === 'Xuất' ? 'active tab' : 'tab'}
                        onClick={() => this.changeTab('Xuất')}
                    >
                        Xuất
                    </div>
                </div>
                {activeTab === 'Nhập' ?
                    this.renderTabInto()
                    : this.renderTabExport()
                }
                {this.renderTabContent()}
            </Fragment>
        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        permission: state.allReducer.permission

    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        is_SearchFormExport: (acttion_isSearchForm) => {
            dispatch(isSearchFormExport(acttion_isSearchForm))
        },
        is_SearchFormInto: (acttion_isSearchForm) => {
            dispatch(isSearchFormInto(acttion_isSearchForm))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Request)


