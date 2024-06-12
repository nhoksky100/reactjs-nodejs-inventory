import React, { Component } from 'react';
import imageDefault from './imageDefault';
import { connect } from 'react-redux';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const getdataNotification = () => axios.get('/getNotification').then((res) => res.data)
const getDataImageProfile = () => axios.get('/imageFile').then((res) => res.data)
class NotificationList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataNotification: [],
            dataImageProfile: [],
            activeTab: 'tab-content-all-notification',
            tooltipVisible: false,
            isLinkPur: false,
            isLinkWh: false,
            isLinkRequest: false,
            redirectTo: null,

        };
        this._isMounted = false
        this.tooltipRef = React.createRef();
    }

    componentDidMount() {
        this._isMounted = true
        Promise.all([this.getData(),]).then(() => {

        });
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        this._isMounted = false
        document.removeEventListener('mousedown', this.handleClickOutside);
    }


    getData = async () => {
        this._isMounted = true
        try {

            const [dataNotification, dataImageProfile] = await Promise.all([
                getdataNotification(),
                getDataImageProfile()
            ]);

            if (dataNotification) {
                if (this._isMounted) {
                    this.setState({ dataNotification: dataNotification.rows });
                }
            }
            if (dataImageProfile) {
                if (this._isMounted) {
                    this.setState({ dataImageProfile: dataImageProfile });
                }
            }

            // Sau khi tất cả dữ liệu đã được cập nhật, gọi updateNewRowDataListFromDataSet
            // this.updateNewRowDataListFromDataSet();
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error occurred while fetching data:", error);
        }
    };





    handleClickOutside = (event) => {
        if (this.tooltipRef.current && !this.tooltipRef.current.contains(event.target)) {
            this.setState({ tooltipVisible: false });
        }
    };

    handleTabClick = (tabId) => {
        this.setState({ activeTab: tabId });
    };

    handleTooltipToggle = () => {
        // this.setState(prevState => ({ tooltipVisible: !prevState.tooltipVisible }));
        this.setState({ tooltipVisible: !this.state.tooltipVisible })
    };

    checkPermissionApprove = (pointApprove, value) => {
        const { permission, department, memberName, } = this.props;
        const point = parseInt(pointApprove)
        // if (!pointApprove) return false;

        if ((permission === 'Thành viên' || permission === 'Thành viên kho') && (point === 1 || point === -1) &&
            value.maker === memberName && value.department === department) {
            //  thành viên sẽ thấy đơn của mình tạo , khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        }

        else if (permission === 'Thành viên thu mua' && (point === 0 || point === -1)) {
            return false;
        }
        else if (permission === 'Trưởng phòng' && department !== 'Kế toán' && (point === 1 || point === -1) && department === value.department
        ) {
            return false;
        }
        else if (permission === 'Trưởng phòng' && department === 'Kế toán' && (point === 2 || point === -1)
        ) {
            return false;
        }
        else if (permission === 'Trưởng phòng' && department === 'Kế toán' && (point === 1 || point === -1) && department === value.department
        ) {
            return false;
        }
        else if (permission === 'Lãnh đạo' && point === 3
        ) {
            return false;
        }

        else {
            return true;
        }
    }
    checkPermissionApproveExport = (pointApprove, value) => {
        const { permission, department, memberName, } = this.props;

        const point = parseInt(pointApprove);
        if ((permission !== 'Lãnh đạo' && permission !== 'Admin' && permission !== 'Trưởng phòng') && (point === 1 || point === -1) &&
            value.maker === memberName && value.department === department) {
            //  thành viên sẽ thấy đơn của mình tạo , khác bộ phận sẽ không nhìn thấy đơn của mình chưa duyệt
            return false;
        }

        else if (permission === 'Trưởng phòng' &&
            value.department === department && department !== 'Kế toán' &&
            point === 0) {
            //  trưởng phòng sẽ thấy đơn tạo của bộ phận mình , và thu mua đã được duyệt 
            return false;
        }
        else if (permission === 'Trưởng phòng' && department === 'Kế toán' && (point === 1 || point === -1)

        ) {
            //  trưởng phòng kế toán sẽ thấy đơn người trước đã duyệt hết, sau đó tới chính mình duyệt
            return false;
        }
        else if (permission === 'Trưởng phòng' && department === 'Kế toán' && (point === 0 || point === -1) && department === value.department
        ) {
            return false;
        }
        else if (permission === 'Thành viên kho' && point === 2
        ) {
            return false;
        }
        else if (point === 3
        ) {
            return false;
        }
        else {
            return true;
        }
    }
    detailRequest = (item) => {
        const { permission } = this.props;
        let link = '/request'; // Default link
        if (parseInt(item.pointApprovedExport) === 3) {
            link = `/urlPDF/${item.id}`; // Link đến trang mới để xem file PDF của item.id
        } else {


            if (item.tab === 'Nhập') {
                if (this._isMounted) {
                    if (permission === 'Thành viên thu mua') {
                        link = '/purchase';


                    }
                    this.setState({

                        tooltipVisible: false,
                    })

                    sessionStorage.setItem('request', 'Nhập')
                }
            } else {
                // xuất
                if (this._isMounted) {
                    if (permission === 'Thành viên kho') {
                        link = '/warehouse';
                    }
                    this.setState({
                        tooltipVisible: false,
                    })
                    // if(item.is)
                    sessionStorage.setItem('request', 'Xuất')
                }
            }
            this.handleRedirect(link);
            if (parseInt(item.isRead) === 0) {
                axios.post('/updateNotification', { id: item.id, isRead: item.isRead = 1 })
                    .catch(error => {
                        // Trả về null khi promise thất bại
                        console.error("Đã xảy ra lỗi:", error);
                        return null;
                    });
            }
        }
    }
    showFormNotification = () => {
        const { dataImageProfile, dataNotification, activeTab } = this.state;
        const { permission, department, memberName } = this.props
        const image = ''
        let dataFilter = []


        dataFilter = dataNotification.filter(item => {
            // Kiểm tra các điều kiện lọc

            if (item.tab === 'Nhập') {

                // Người tạo và kiểm tra thông báo người duyệt
                if (!this.checkPermissionApprove(item.pointApprovedInto, item)) {

                    return true;
                }
            }
            else if (item.tab === 'Xuất') {
                if (!this.checkPermissionApproveExport(item.pointApprovedExport, item))
                    return true
            }
            // if((parseInt(item.isApproved) === 1 && item.tab==='Nhập')){

            // }

        }).map(item => {
            // Tìm đối tượng tương ứng trong dataImageProfile dựa trên id
            let profile = dataImageProfile.find(profileItem => profileItem.id === item.idMember);

            // Gán image từ profile vào item nếu tìm thấy
            if (profile) {
                item.image = profile.image;
            }

            return item;
        });
        if (activeTab === 'tab-unread') {
            dataFilter = dataFilter.filter(item => parseInt(item.isRead) === 0);

        }
        if (dataFilter.length > 0) {
            // return dataNotification.map
            return dataFilter.map((value, key) => {
                const isNhap = value.tab === 'Nhập';
                const isXuat = value.tab === 'Xuất';
                const isThanhVien = permission === 'Thành viên';
                const isThanhVienKho = permission === 'Thành viên kho';
                const isThanhVienThuMua = permission === 'Thành viên thu mua';
                const isMaker = value.maker === memberName;

                const nhapHangStatus = `Đơn nhập hàng được duyệt  Trạng thái:  ${value.status === 'Đã duyệt ' ? value.status : value.pointApprovedInto}/4`;
                const choDuyetNhapHangStatus = `Đơn nhập hàng chờ duyệt  Trạng thái: ${value.status === 'Đã duyệt' ? value.status : value.pointApprovedInto}/4`;

                const xuatHangStatus = parseInt(value.pointApprovedExport) !== 3
                    ? `Đơn xuất hàng được duyệt Trạng thái: ${value.status === 'Đã duyệt' ? value.status : `${value.pointApprovedExport}/2`}`
                    : 'Kho đã xuất tệp pdf';
                const choDuyetXuatHangStatus = `Đơn xuất hàng chờ duyệt  Trạng thái: ${value.status === 'Đã duyệt' ? value.status : value.pointApprovedExport}/2`;

                const title = isNhap ? (
                    (isThanhVien || isThanhVienKho) ? nhapHangStatus :
                        (isThanhVienThuMua && isMaker) ? nhapHangStatus :
                            (!isThanhVien && !isThanhVienKho) ? choDuyetNhapHangStatus :
                                ''
                ) : isXuat ? (
                    (isThanhVien || isThanhVienThuMua) ? xuatHangStatus :
                        (!isThanhVienKho && !isThanhVien) ? choDuyetXuatHangStatus :
                            ''
                ) : ''


                return (
                    <li onClick={() => this.detailRequest(value)} key={key} className='li-notification'>
                        <div className='information-notification'>
                            <div className='row'>
                                <div className='col-md-2'>
                                    <img style={{ borderRadius: '100%', width: '30px', height: '30px' }} src={value.image || imageDefault} />
                                </div>
                                <div className='col-md-8'>
                                    <div className='content-notification'>
                                        <span className='span-title span-content'>

                                            {
                                                title
                                            }
                                        </span>
                                        <span className='span-content'>
                                            {value.content}
                                        </span>
                                        <span className='span-content'>
                                            {'Ngày giờ'}
                                        </span>
                                    </div>
                                </div>


                                <div className='col-md-2'>
                                    <span>
                                        {parseInt(value.isRead) === 0 ?
                                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginLeft: '3px', backgroundColor: '#314c7c' }}></span>
                                            : ''}
                                    </span>
                                    <span>...</span>
                                </div>


                            </div>
                        </div>
                    </li>
                )
            })

        }
    }
    handleRedirect = (link) => {
        this.setState({ redirectTo: link }, () => {
            setTimeout(() => {
                this.setState({ redirectTo: null });
            }, 100);
        });
    }
    render() {
        const { activeTab, tooltipVisible, dataNotification, isLinkPur, isLinkRequest, isLinkWh, redirectTo } = this.state;


        if (redirectTo) {
            return <Navigate to={redirectTo} />;
        }

        return (
            <div id='titleNotification'>

                {dataNotification.length > 0 && <span className='notification-red'></span>}
                <span title='' className="tipClick" >
                    <span className='span-natification' onClick={() => this.handleTooltipToggle()}>
                        <i className="fa fa-bell" aria-hidden="true" />
                    </span>
                    {tooltipVisible && (
                        <strong className="tooltipT" ref={this.tooltipRef}>
                            <h3 className='titleNotification'>Thông báo</h3>
                            <div className="tabs-notification">
                                <div className={`tab ${activeTab === 'tab-content-all-notification' ? 'active' : ''}`} onClick={() => this.handleTabClick('tab-content-all-notification')}>
                                    Tất cả
                                </div>
                                <div className={`tab ${activeTab === 'tab-unread' ? 'active' : ''}`} onClick={() => this.handleTabClick('tab-unread')}>
                                    Chưa đọc
                                </div>
                            </div>
                            <div className='div-all-new-notification'>
                                <ul style={{ display: 'inline-flex' }}>
                                    <li className='li-new'>Mới</li>
                                    <li className='li-all'>Xem tất cả</li>
                                </ul>
                            </div>
                            <div className='row'>
                                <div className="tab-content" style={{ display: activeTab === 'tab-content-all-notification' ? 'block' : 'none' }}>
                                    <ul>
                                        {this.showFormNotification()}
                                    </ul>
                                </div>
                                <div className="tab-content" style={{ display: activeTab === 'tab-unread' ? 'block' : 'none' }}>
                                    <ul>
                                        {this.showFormNotification()}
                                    </ul>
                                </div>
                            </div>
                        </strong>
                    )}
                </span>
            </div>
        );
    }


}
function mapStateToProps(state) {
    return {
        permission: state.allReducer.permission,
        department: state.allReducer.department,
        memberName: state.allReducer.memberName,


    };
}

function mapDispatchToProps(dispatch) {
    return {
        // isSiderBar: (action_moreSiderbar) => {
        //     dispatch({ type: 'StatusSiderBar', action_moreSiderbar })
        // }
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(NotificationList);

