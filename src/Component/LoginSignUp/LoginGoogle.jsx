import axios from 'axios';
import React, { Component, Fragment } from 'react';
import { GoogleLogin } from 'react-google-login';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';
import Cookies from 'universal-cookie';
import { setCookie } from '../setCookie';
class LoginCusTomer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false
        }
    }
    componentDidMount() {
        let cookie = new Cookies();
        let username = localStorage.getItem('tokenProfileCustomer');
        
        let tokenIdCustomerCookie = cookie.get(username)
        if (tokenIdCustomerCookie) {
            this.setState({ isLogin: true })
        }
    }
    // setCookie = (username, token, profileObj) => {
    //     let cookie = new Cookies();
    //     let minutes = 1140; // 1140m 1 day

    //     let d = new Date();
    //     d.setTime(d.getTime() + minutes * 60 * 1000);

    //     // Tạo đối tượng cookieOptions để cấu hình cookie
    //     let cookieOptions = {
    //         path: "/",
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



    responseGoogle = (response) => {
        try {

            if (response.profileObj) {
                // console.log(response.profileObj);
                // console.log(response);
                let tokenId = response.tokenId;
                let profileObj = {
                    id: response.tokenId,
                    email: response.profileObj.email,
                    name: response.profileObj.name,
                    image: response.profileObj.imageUrl,
                    expiresIn: response.tokenObj.expires_in,
                    expiresAt: response.tokenObj.expires_at,
                    firstIssuedAt: response.tokenObj.first_issued_at,
                    graphDomain: response.tokenObj.idpId,
                    dateTime: response.data_access_expiration_time,
                    domain: 'google.com'

                }



                // localStorage.setItem('tokenProfileCustomer', JSON.stringify(profileObj))
                // this.setCookie('loginCustomer', tokenId)



                // this.setCookie('loginCustomer', tokenId, profileObj);
                setCookie('loginObject', profileObj, 1140)
                this.setState({ isLogin: true });
                window.location.reload();



            } else {
                this.setState({ isLogin: false })
            }
        } catch (error) {
            console.log('error User profile  on the server:', error);
        }
    }

    render() {

        return (
            <Fragment>

                <GoogleLogin
                    clientId='588217232596-pufnbf116c5orf5l2vnbudhe2kqf3bou.apps.googleusercontent.com'
                    render={renderProps => (
                        <a style={{ cursor: 'pointer' }} onClick={renderProps.onClick} disabled={renderProps.disabled} className="btn-google m-b-20">
                            <img src="../../../../ProfileCustomer/LoginSignUp/images/icons/icon-google.png" alt="GOOGLE" />

                            Google
                        </a>
                    )}
                    buttonText="Google"

                    onSuccess={this.responseGoogle}
                    onFailure={this.responseGoogle}
                    cookiePolicy={'single_host_origin'}

                />

            </Fragment>
        );
    }
}

export default LoginCusTomer;