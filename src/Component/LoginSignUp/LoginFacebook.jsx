import axios from 'axios';
import React, { Component, Fragment } from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { Redirect } from 'react-router-dom/cjs/react-router-dom';
import Cookies from 'universal-cookie';
import { setCookie } from '../setCookie';

class LoginFacebook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            checkLogin: false,
        };
    }

    // setCookie = (username, token, profileObj) => {
    //     let cookie = new Cookies();
    //     let minutes = 1140; // 1140m 1 day

    //     let d = new Date();
    //     d.setTime(d.getTime() + minutes * 60 * 1000);

    //     // Tạo đối tượng cookieOptions để cấu hình cookie
    //     let cookieOptions = {
    //         path: '/',
    //         expires: d,
    //     };

    //     // Thêm thông tin profileObj vào cookieOptions
    //     if (profileObj) {
    //         cookieOptions = {
    //             ...cookieOptions,
    //             profileObj: profileObj,
    //         };
    //     }

    //     // Đặt cookie với các tùy chọn đã cấu hình
    //     // cookie.set(username, token, cookieOptions);
    //     document.cookie = `loginObject=${JSON.stringify(profileObj)}; expires=${d.toUTCString()}; path=/; SameSite=None; Secure`;
    // };

    responseFacebook = async (response) => {
        try {
            if (response.status === 'unknown') {
                return (response.status = 'connected');
            }
            if (response !== '' || response) {
                // console.log(response);
                let tokenId = response.accessToken;
                let profileObj = {
                    id: tokenId,
                    email: response.email,
                    name: response.name,
                    image: response.picture.data.url,
                    expiresIn: response.expiresIn,
                    graphDomain: response.graphDomain,
                    dateTime: response.data_access_expiration_time,
                    domain: 'facebook.com',
                };

                // await this.setCookie('loginCustomer', tokenId, profileObj);
                await setCookie('loginObject', profileObj, 1140)
                this.setState({ isLogin: true });
                window.location.reload();
            } else {
                this.setState({ isLogin: false });
            }
        } catch (error) {
            console.log('error User profile on the server:', error);
        }
        return response;
    };

    LoginFacebook = () => {
        return (
            <Fragment>
                {!this.state.isLogin && (
                    <FacebookLogin
                        appId="764638158270001"
                        render={(renderProps) => (
                            <a style={{ cursor: 'pointer' }} onClick={renderProps.onClick} className="btn-face m-b-20">
                                <img src="../../../../ProfileCustomer/LoginSignUp/images/icons/facebook.png" alt="FACEBOOK" />
                                Facebook
                            </a>
                        )}
                        textButton="Facebook"
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={this.responseFacebook}
                    />
                )}
            </Fragment>
        )
    }
    componentDidUpdate(prevProps, prevState) {
        // You can place your data fetching code or side effects here if needed
    }

    render() {
        return (
            this.LoginFacebook()
        );
    }
}

export default LoginFacebook;
