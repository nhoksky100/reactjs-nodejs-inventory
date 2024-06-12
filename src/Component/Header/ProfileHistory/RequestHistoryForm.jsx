import React, { Component, Fragment } from 'react';
import RequestHistoryInto from './RequestHistoryInto'
import RequestHistoryExport from './RequestHistoryExport';
import { connect } from 'react-redux';
import { isSearchFormExportProfile, isSearchFormIntoProfile } from '../../../StoreRcd';

class RequestHistoryForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Nhập',
            selectedComponentInto: null,
            activeMenu: 'Đơn nhập đã tạo',
            activeMenuExport: 'Đơn xuất đã tạo',
            selectedComponentExport: null,
            canClick: true,
        };
    }

    componentDidMount() {
        this.getDidMount();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.activeTab !== this.state.activeTab) {
            this.updateSearchFormHistoryProfile(this.state.activeTab);
        }
    }

    componentWillUnmount() {
        this.setState({
            activeMenu: 'Đơn nhập đã tạo',
            activeTab: 'Nhập',
            selectedComponentInto: null,
            activeMenuExport: 'Đơn xuất đã tạo',
            selectedComponentExport: null,
        });
    }

    getDidMount = () => {
        const { tokenObj } = this.props || [];
        const request = sessionStorage.getItem('requestHistory') || 'Nhập';
        this.setState({
            activeTab: request,
            selectedComponentInto: <RequestHistoryInto tokenObj={tokenObj} />,
            selectedComponentExport: <RequestHistoryExport tokenObj={tokenObj} />,
        }, () => {
            this.updateSearchFormHistoryProfile(this.state.activeTab);
        });
    }

    updateSearchFormHistoryProfile = (tabName) => {
        if (tabName === 'Nhập') {
            this.props.is_SearchFormIntoProfile(true);
            this.props.is_SearchFormExportProfile(false);
        } else {
            this.props.is_SearchFormIntoProfile(false);
            this.props.is_SearchFormExportProfile(true);
        }
        sessionStorage.setItem('requestHistory', tabName);
    };

    changeTab = (tabName) => {
        if (!this.state.canClick) return;
        this.setState({ activeTab: tabName, canClick: false }, () => {
            setTimeout(() => {
                this.setState({ canClick: true });
            }, 500);
        });
    };

    renderTabContent = () => {
        const { activeTab, selectedComponentInto, selectedComponentExport } = this.state;
        switch (activeTab) {
            case 'Nhập':
                return selectedComponentInto;
            case 'Xuất':
                return selectedComponentExport;
            default:
                return null;
        }
    };

    render() {
        const { activeTab } = this.state;
        return (
            <Fragment>
                <div style={{ borderBottom: 0, marginTop: '50px' }} className="tabsOverView">
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
                {this.renderTabContent()}
            </Fragment>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        // permission: state.allReducer.permission
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        is_SearchFormExportProfile: (acttion_isSearchForm) => {
            dispatch(isSearchFormExportProfile(acttion_isSearchForm));
        },
        is_SearchFormIntoProfile: (acttion_isSearchForm) => {
            dispatch(isSearchFormIntoProfile(acttion_isSearchForm));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RequestHistoryForm);
