import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class HeaderMidProfile extends Component {
    isCase = () => {
        let { pathUrl } = this.props;
       
        if (pathUrl && typeof pathUrl === 'string') {
            switch (pathUrl) {
                case '/profile': case '/profile/':
                    return 'Bảng thông tin'
                case '/profile/uploadfile':
                    return 'Tải lên'
                case '/profile/statistical':
                    return 'Thống kê'
                case '/profile/withdraw':
                    return 'Rút'
                case '/profile/setting':
                    return 'Cài đặt'
                default:
                    return;
            }
        }
    }
    isShowForm = () => {
        let { pathUrl } = this.props;

        // let isCase ='', isTestCase =''
        // console.log(pathUrl);
        // if(pathUrl && typeof pathUrl==='string'){
        //     switch (key) {
        //         case value:

        //             break;

        //         default:
        //             break;
        //     }
        // }
        return (
            <div className="head-title">
                <div className="left">
                    <h1>{this.isCase()}</h1>
                    <ul className="breadcrumb">
                        {pathUrl === '/profile' || pathUrl === '/profile/' ? (
                            <li>
                                <NavLink to={pathUrl}>{this.isCase()}</NavLink>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <NavLink to={'/profile'}>Bảng thông tin</NavLink>
                                </li>
                                {/* <li>
                                    <i className="bx bx-chevron-right" />
                                </li> */}
                                <li>
                                    <NavLink className="active" to={pathUrl}>
                                        {this.isCase()}
                                    </NavLink>
                                </li>
                            </>
                        )}

                    </ul>
                </div>
                <NavLink to={'/profile/uploadfile'} className="btn-upload">
                    <i className="bx bxs-cloud-upload" />
                    <span className="text">Tải lên</span>
                </NavLink>
            </div>
        )
    }
    render() {
        return (
            <section id='header-mid-profile' style={{maxHeight:'none'}}>
                {this.isShowForm()}
            </section>
        );
    }
}

export default HeaderMidProfile;