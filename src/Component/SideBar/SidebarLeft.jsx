import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Navigate } from 'react-router-dom';

import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';

import bcrypt from 'bcryptjs';
import axios from 'axios';

// import { NavLink } from 'react-router-dom';
const getdataListAccount = () => axios.get('/getAccount').then((res) => res.data)

class Siderbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toggleSibar: '',
            isLogout: false,
            dataAccount: [],
            permission: '',
            // tokenObj: {}
            
            lastClickedIndex:'',
        }
    }
    componentDidMount() {
        // const username = 'loginObject'; // Thay thế bằng tên cookie bạn đã sử dụng
        // const cookies = new Cookies()
        // const tokenObj = cookies.get(username);
        // if (tokenObj) {
        //     this.setState({ tokenObj: tokenObj.codeToken })
        // }
        const { pathname } = window.location;
      
        this.activeClass()
        this.getData()
        this.isBcrypt()
    }

    activeClass = () => {
        const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
        
        if (allSideMenu && allSideMenu.length !== 0) {
            allSideMenu.forEach(item => {
                const li = item.parentElement;

                item.addEventListener('click', () => {
                    if (allSideMenu) {
                        allSideMenu.forEach(i => {
                            if (i.parentElement) {
                                i.parentElement.classList.remove('active');
                            }
                        });

                        if (li) {
                            li.classList.add('active');
                        }
                    }
                });
            });
        }
    }

    async isBcrypt(dataAccount) {
        const { tokenObj } = this.props;
       
        let permission = '';

        if (dataAccount) {
            for (let value of dataAccount) {
                if (tokenObj.id === value.id) {
                    const isPermission = await bcrypt.compare(value.accountPermission, tokenObj.accountPermission);
                    if (isPermission) {
                        permission = value.accountPermission;
                        break; // Không cần duyệt các phần tử khác nữa nếu đã tìm thấy quyền
                    }
                }
            }
        }
        this.setState({ permission: permission });
    }
    getData = () => {
        getdataListAccount().then((res) => {
            if (res) {

                this.setState({ dataAccount: res.rows })
                this.isBcrypt(res.rows)
            }
        })
    }
    clearCookiesForDomain = (domain) => {
        var cookies = document.cookie.split(";") || null;

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            while (cookie.charAt(0) === " ") {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(domain) === 0) {
                var cookieName = cookie.split("=")[0];
                document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            }
        }
    }
    isLogout = (tokenObj) => {
        // this.clearCookiesForDomain(tokenObj.domain)

        this.setState({ isLogout: true })
        const cookies = new Cookies();
        // Xóa cookie bằng cách đặt hết hạn sớm hơn hiện tại
        cookies.remove('loginCustomer', { path: '/' });
        cookies.remove('loginObject', { path: '/' });
    }
    handleNotPermission = () => {
       window.history.back()
      
        toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
            <i>Quyền hạn không đúng!</i></div>)

    }
    isShowForm = () => {
        try {
           
            // let profileCustomer = JSON.parse(localStorage.getItem('tokenProfileCustomer')) || null;
            const { tokenObj } = this.props;
            const { permission } = this.props;
           
            return (

                <section id="sidebar" className={this.props.moreSiderbar || ''}>
                    <a style={{ cursor: 'pointer' }} className="brand">
                        <i className="bx bxs-smile" />
                        <span className="text">{tokenObj.name || tokenObj.accountUserName || tokenObj.accountEmail}</span>

                    </a>

                    <div className='textPermission'>

                        <label style={{ textAlign: 'center', }} className="text">{permission || ''}</label>
                    </div>



                    <ul className= 'side-menu top'  >
                        <li >
                            <NavLink to="/" >
                                <i className="bx bxs-dashboard" title='Tổng quan' />
                                <span className="text">Tổng quan</span>
                            </NavLink>
                        </li>
                        <li >
                                <NavLink to="/warehouse">
                                    <i className='bx bxs-home' title='Kho'></i>
                                    <span className="text">Kho</span>
                                </NavLink>
                            {/* {permission === 'Thành viên kho' || permission === 'Lãnh đạo' ?
                                : <a onClick={() => this.handleNotPermission()} style={{ cursor: 'pointer' }}>
                                    <i className="bx bxs-home" title='Kho' />
                                    <span className="text">Kho</span>
                                </a>
                            } */}
                        </li>
                        <li  >
                            {
                                <NavLink to="/purchase">
                                    <i className="bx bxs-shopping-bag-alt" title='Thu mua' />
                                    <span className="text">Thu mua</span>
                                </NavLink>


                               
                            }
                        </li>
                        <li  >
                            <NavLink to="/supplier">
                                <i className='bx bxs-user-detail' title='Đối tác' ></i>
                                <span className="text">Đối tác</span>
                            </NavLink>
                        </li>
                        <li  >
                                <NavLink to="/member">
                                    <i className='bx bxs-user' title='Thành viên'></i>
                                    <span className="text">Thành viên</span>
                                </NavLink>
                            {/* {permission === 'Admin' || permission === 'Lãnh đạo' ?

                                : <a onClick={() => this.handleNotPermission()} style={{ cursor: 'pointer' }}>
                                    <i className="bx bxs-user" title='Thành viên' />
                                    <span className="text">Thành viên</span>
                                </a> 
                            } */}
                        </li>
                        <li >
                            <NavLink to="/request">
                                <i className='bx bx-highlight' title='Yêu cầu'></i>
                                <span className="text">Yêu cầu</span>
                            </NavLink>
                        </li>

                        <li  >
                            {/* {permission === 'Admin' || permission === 'Lãnh đạo' ? */}

                                <NavLink to="/category/items-list">
                                    <i className='bx bxs-customize' title='Danh mục'></i>
                                    <span className="text">Danh mục </span>
                                </NavLink>
                                {/* // : <a onClick={() => this.handleNotPermission()} style={{ cursor: 'pointer' }}>
                                //     <i className="bx bxs-customize" title='Danh mục' />
                                //     <span className="text">Danh mục</span>
                                // </a> */}
                            {/* // } */}
                        </li>
                        <li  >
                            <NavLink to="/findfriend">
                                <i className='bx bxs-report' title='Báo cáo' ></i>
                                <span className="text">Báo cáo</span>
                            </NavLink>
                        </li>

                        <li  >
                            <a href="#Message">
                                <i className="bx bxs-message-dots" title='Tin nhắn' />
                                <span className="text">Tin Nhắn</span>
                            </a>
                        </li>

                    </ul>
                    <ul className="side-menu">
                        <li >
                            <NavLink to="/setting">
                                <i className="bx bxs-cog" title='Cài đặt' />
                                <span className="text">Cài đặt</span>
                            </NavLink>
                        </li>
                        <li  >
                            <a style={{ cursor: 'pointer' }} onClick={() => this.isLogout(tokenObj)} className="logout">
                                <i className="bx bxs-log-out-circle" title='Thoát' />
                                <span className="text">Thoát</span>
                            </a>
                        </li>
                    </ul>
                </section>
            )
        }
        catch (error) {
            return <div>
                <p>Đã xảy ra lỗi khi xử lý dữ liệu.</p>
            </div>
            // console.log(' lỗi', error);
        }


    }
    render() {
        if (this.state.isLogout) {
            return <Navigate to='/' />
        }
        return (
            this.isShowForm()


        );
    }
}
function mapStateToProps(state) {
    return {
        moreSiderbar: state.allReducer.moreSiderbar,
        permission: state.allReducer.permission
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // isSiderBar: (moreSiderbar) => {
        //     dispatch({ type: 'StatusSiderBar', moreSiderbar })
        // }
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(Siderbar);
// export default Siderbar;