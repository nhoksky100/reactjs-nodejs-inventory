import React, { Component } from 'react';
import { connect } from 'react-redux';
// import Cookies from 'universal-cookie';
import NotificationList from './NotificationList';
import Search from './Search/Search';
import { NavLink } from 'react-router-dom';
import imageDefault from './imageDefault';
import {StatusSiderBar}from '../../StoreRcd.jsx'
class HeaderTopProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statusBar: false,
            statusLightDark: false,
            // tokenObj:{}
            // activeTab: 'tab-content-all-notification',

        }

    }
    componentDidMount() {

        const moreSiderbarValue = localStorage.getItem('moreSiderbar');
        const lightDarkValue = localStorage.getItem('lightDark');

        // Kiểm tra nếu giá trị là rỗng, null, hoặc undefined
        if (moreSiderbarValue) {
            this.props.isSiderBar(moreSiderbarValue)
            this.setState({ statusBar: true })
        }
        if (lightDarkValue) {
            document.body.classList.add('dark')
            this.setState({ statusLightDark: true })
        }

        // const cookies = new Cookies()
        // const username = 'loginObject'; // Thay thế bằng tên cookie bạn đã sử dụng
        // const tokenObj = cookies.get(username);
        // if (tokenObj) {
        //     this.setState({ tokenObj: tokenObj.codeToken })
        // }

    }



    // Hàm xử lý sự kiện click tab
    // handleTabClick = (tabId) => {
    //     this.setState({ activeTab: tabId }); // Cập nhật activeTab thành tab được click
    // };
    handleClickBar = () => {
        if (!this.state.statusBar) {
            this.props.isSiderBar('s-hide')
            localStorage.setItem('moreSiderbar', 's-hide')
        } else {
            this.props.isSiderBar('')
            localStorage.setItem('moreSiderbar', '')
        }
        this.setState({
            statusBar: !this.state.statusBar
        })
    }
    isLightDark = () => {
        // dark

        if (!this.state.statusLightDark) {
            document.body.classList.add('dark')
            localStorage.setItem('lightDark', 'dark')
        } else {
            document.body.classList.remove('dark')
            localStorage.setItem('lightDark', '')
        }
        this.setState({
            statusLightDark: !this.state.statusLightDark
        })
    }
    isShowNavProfile = () => {
        try {

            // let profileCustomer = JSON.parse(localStorage.getItem('tokenProfileCustomer')) || null;
            // const { tokenObj } = this.props || '';
            const { imageProfile, tokenObj } = this.props;
           
            const { activeTab } = this.state;
          
            return (


                <nav>
                    <i className="bx bx-menu" onClick={() => this.handleClickBar()} title={!this.state.statusBar ? 'mở rộng' : 'thu nhỏ'} />



                    {/* search */}

                  

                        <Search
                            pathUrl={this.props.pathUrl}
                            dataSearch={this.props.dataSearch}
                        />

                    
                   

                        <input style={{ display: 'none' }} defaultChecked={localStorage.getItem('lightDark') ? true : false} onClick={() => this.isLightDark()} type="checkbox" id="switch-mode" hidden="" />
                        <label htmlFor="switch-mode" className="switch-mode" />
                        {/* <a href="#tooltip" className="notification ">
                        
                        <i className="bx bxs-bell" />
                        <span className="num">8</span>
                    </a> */}
                        {/* <span title='ghi chú' className="tipClick">
                        <a href="#tooltip"><i className="fa fa-bell" aria-hidden="true" /></a>
                        <strong className="tooltipT">
                            <h3 className='titleNotification'>Thông báo</h3>
                            <div className="tabs">
                                <div className={`tab ${activeTab === 'tab-content-all-notification' ? 'active' : ''}`} onClick={() => this.handleTabClick('tab-content-all-notification')}>Tất cả</div>
                                <div className={`tab ${activeTab === 'tab-unread' ? 'active' : ''}`} onClick={() => this.handleTabClick('tab-unread')}>Chưa đọc</div>
                            </div>

                           
                            <div className='row'>

                                <div className="tab-content" style={{ display: activeTab === 'tab-content-all-notification' ? 'block' : 'none' }}>
                                    Nội dung của tab 1
                                </div>
                                <div className="tab-content" style={{ display: activeTab === 'tab-unread' ? 'block' : 'none' }}>
                                    Nội dung của tab 2
                                </div>
                            </div>
                            <p> 'Danh số hôm nay' sẽ được tính khi giao dịch thành công & đã thanh toán & đã gửi hàng cho khách! </p>

                        
                        </strong>

                    </span> */}
                        <NotificationList  tokenObj={tokenObj} />
                        <NavLink to='/profile-account' className="profile">
                            <img src={imageProfile || imageDefault} />
                        </NavLink>
                  
                </nav>

            )
        }
        catch (error) {
            return <div>
                <p>Đã xảy ra lỗi khi xử lý dữ liệu JSON.</p>
            </div>
            // console.log(' lỗi', error);
        }
    }
    render() {
        // window.ris
        return (
            this.isShowNavProfile()
        );
    }
}
function mapStateToProps(state) {
    return {
        moreSiderbar: state.allReducer.moreSiderbar,
        dataSearch: state.allReducer.dataSearch,
      

    };
}

function mapDispatchToProps(dispatch) {
    return {
        isSiderBar: (action_moreSiderbar) => {
            dispatch(StatusSiderBar(action_moreSiderbar));
        }
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(HeaderTopProfile);
