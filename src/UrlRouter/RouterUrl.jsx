import React, { Component, Fragment } from 'react';
import { Route, Routes, } from 'react-router-dom';
import FormViewCustomer from '../Component/Views/FormViewCustomer';
import LoginCustomer from '../Component/LoginSignUp/LoginCustomer';
import PasswordRetrieval from '../Component/LoginSignUp/PasswordRetrieval';
import FormChangePassword from '../Component/LoginSignUp/FormChangePassword';
import NotPage404 from '../Component/NotPage404';
// import ScrollToTop from './ScrollToTop';

class RouterUrl extends Component {
    render() {
     
        return (
            <Fragment>
                <Routes>
                    <Route path="/" element={<FormViewCustomer  />} />
                    <Route path="/warehouse" element={<FormViewCustomer />} />
                    <Route path="/create-warehouse" element={<FormViewCustomer />} />
                    <Route path="/warehouse-list" element={<FormViewCustomer />} />
                    <Route path="/into-warehouse-list" element={<FormViewCustomer />} />
                    <Route path="/transfer-warehouse-export" element={<FormViewCustomer />} />
                    <Route path="/purchase" element={<FormViewCustomer />} />
                    <Route path="/purchase/document" element={<FormViewCustomer />} />
                    <Route path="/purchase/request-approved" element={<FormViewCustomer />} />
                    <Route path="/purchase/request-all" element={<FormViewCustomer />} />
                    <Route path="/purchase/into-warehouse" element={<FormViewCustomer />} />
                    <Route path="/purchase/add-document" element={<FormViewCustomer />} />
                    <Route path="/supplier" element={<FormViewCustomer />} />
                    <Route path="/add-supplier" element={<FormViewCustomer />} />
                    <Route path="/member" element={<FormViewCustomer />} />
                    <Route path="/add-member" element={<FormViewCustomer />} />
                    <Route path="/list-account" element={<FormViewCustomer />} />
                    <Route path="/add-account" element={<FormViewCustomer />} />
                    <Route path="/request" element={<FormViewCustomer />} />
                    <Route path="/category/items-list" element={<FormViewCustomer />} />
                    <Route path="/add-itemlist" element={<FormViewCustomer />} />
                    <Route path="/profile-account" element={<FormViewCustomer />} />
                    <Route path="/login" element={<LoginCustomer />} />
                    <Route path="/login/password-retrieval" element={<PasswordRetrieval />} />
                    <Route path="/new-password" element={<FormChangePassword />} />
                    <Route path="*" element={<NotPage404 />} />
                </Routes>
                {/* <ScrollToTop /> */}
            </Fragment>
        );
    }
}

export default RouterUrl;
