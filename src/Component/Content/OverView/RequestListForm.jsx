import React, { Component, Fragment } from 'react';
// import RequestInto from '../RequestInto/RequestInto';

import RequestListIntoAll from './RequestListIntoAll'
import RequestListApproved from '../RequestInto/RequestListApproved';
import RequestListExportAll from './RequestListExportAll';



class RequestListForm extends Component {
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

    }

    // Hàm để thay đổi tab
    changeTab = (tabName) => {
        if (!this.state.canClick) return; // Nếu không thể click, thoát khỏi hàm
        this.setState({ activeTab: tabName, canClick: false }, () => {
            setTimeout(() => {
                this.setState({ canClick: true }); // Sau khi delay, cho phép click lại
            }, 500);
        });

    };


    componentDidMount() {

        this.getDidMount()
    }
    componentDidUpdate = (prevProps, prevState) => {
        
        const { currentDate } = this.props;
        if (currentDate && currentDate !== prevProps.currentDate){
           
            this.getDidMount()
        }   
    }

    getDidMount = () => {
        const { tokenObj } = this.props || []
        const { currentDate, currentDay } = this.props;
     
        const request = sessionStorage.getItem('requestOverView') || 'Nhập'
        this.setState({
            activeTab: request,
            selectedComponent: <RequestListIntoAll currentDate={currentDate} currentDay={currentDay} tokenObj={tokenObj} />,
            selectedComponentExport: <RequestListExportAll  currentDate={currentDate} currentDay={currentDay} tokenObj={tokenObj} />
        })
    }
    // Hàm để hiển thị nội dung của tab tương ứng
    renderTabContent = () => {
        const { activeTab, selectedComponent, selectedComponentExport } = this.state;
        const { tokenObj } = this.props || []

        switch (activeTab) {
            case 'Nhập':
                if (selectedComponent) {
                    sessionStorage.setItem('requestOverView', 'Nhập')
                    return selectedComponent
                }

            case 'Xuất':
                if (selectedComponentExport) {
                    sessionStorage.setItem('requestOverView', 'Xuất')
                    return selectedComponentExport
                }
            default:
                return null;
        }
    };






    render() {
        const { activeTab } = this.state;


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

                {this.renderTabContent()}
            </Fragment>
        );
    }
}

export default RequestListForm

