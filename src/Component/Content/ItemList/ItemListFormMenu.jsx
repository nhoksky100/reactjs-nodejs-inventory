import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'


export default class ItemListFormMenu extends Component {
    render() {
        const { permission } = this.props || ''
        return (
            <div className="head-content-menu">
                <NavLink to='/category/items-list' type="button" className="btn btn-success">Danh mục mặt hàng</NavLink>
                <NavLink to='/warehouse-list' type="button" className="btn btn-success">Danh mục Kho</NavLink>

                {permission === 'Admin' && <NavLink to='/add-itemlist' type="button" className="btn btn-success">Tạo mặt hàng</NavLink>}
                {permission === 'Admin' &&
                    <NavLink to='/create-warehouse' type="button" className="btn btn-success">Tạo Kho</NavLink>}


            </div>
        )
    }
}
