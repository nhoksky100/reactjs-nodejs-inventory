import React, { Component, Fragment } from 'react';
import RequestHistoryExport from './RequestHistoryExport';
import RequestHistoryPDFInto from './RequestHistoryPDFInto';
import RequestHistoryPDFExport from './RequestHistoryPDFExport';
// import RequestInto from '../RequestInto/RequestInto';

// import RequestListIntoAll from './RequestListIntoAll'
// import RequestListApproved from '../RequestInto/RequestListApproved';
// import RequestListExportAll from './RequestListExportAll';



class RequestHistoryPDFForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'Nhập',
            // Thêm state để lưu trữ component cần hiển thị
            selectedComponentInto: null,
            activeMenu: 'Đơn nhập PDF',
            activeMenuExport: 'Đơn xuất PDF',
            selectedComponentExport: null,
            canClick: true,

        }
    }
    componentWillUnmount() {
        this.setState({
            activeMenu: 'Đơn nhập PDF',
            activeTab: 'Nhập',
            selectedComponentInto: null,
            activeMenuExport: 'Đơn xuất PDF',
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
    // componentDidUpdate = (prevProps, prevState) => {

    //     const { currentDate } = this.props;
    //     if (currentDate && currentDate !== prevProps.currentDate){

    //         this.getDidMount()
    //     }   
    // }

    getDidMount = () => {
        const { tokenObj } = this.props || []
       

        const request = sessionStorage.getItem('requestHistoryPDF') || 'Nhập'
        this.setState({
            activeTab: request,
            selectedComponentInto: <RequestHistoryPDFInto tokenObj={tokenObj} />,
            selectedComponentExport: <RequestHistoryPDFExport tokenObj={tokenObj}/>,
           

        })
    }
    // Hàm để hiển thị nội dung của tab tương ứng
    renderTabContent = () => {
        const { activeTab, selectedComponentInto, selectedComponentExport, } = this.state;
        const { tokenObj } = this.props || {}

        switch (activeTab) {
            case 'Nhập':

                if (selectedComponentInto) {
                    sessionStorage.setItem('requestHistoryPDF', 'Nhập')

                    return selectedComponentInto
                }

            case 'Xuất':
                if (selectedComponentExport) {
                    sessionStorage.setItem('requestHistoryPDF', 'Xuất')
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

export default RequestHistoryPDFForm

