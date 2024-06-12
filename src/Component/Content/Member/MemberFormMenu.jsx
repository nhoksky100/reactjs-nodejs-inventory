import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

export default class MemberFormMenu extends Component {
    render() {
        const {permission}=this.props || ''
        return (
            <div className="head-content-menu">
                <NavLink to='/member' type="button" className="btn btn-success">Danh sách thành viên</NavLink>
                <NavLink to='/list-account' type="button" className="btn btn-success">Danh sách tài khoản</NavLink>
                {permission === 'Admin' && <NavLink to='/add-member' type="button" className="btn btn-success">Tạo thành viên</NavLink>}
                {permission === 'Admin' && <NavLink to='/add-account' type="button" className="btn btn-success">Tạo tài khoản</NavLink>}

            </div>
        )
    }
}
