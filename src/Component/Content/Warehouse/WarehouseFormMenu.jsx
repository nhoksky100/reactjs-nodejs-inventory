import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class WarehouseFormMenu extends Component {
    render() {
        return (
            <div className="head-content-menu">
                <NavLink to='/warehouse' type="button" className="btn btn-success">Danh sách kho</NavLink>
                <NavLink to='/into-warehouse-list' type="button" className="btn btn-success">Danh sách nhập kho</NavLink>
                <NavLink to='/export-warehouse' type="button" className="btn btn-success">Xuất Kho</NavLink>
                <NavLink to='/check-warehouse' type="button" className="btn btn-success">Kiểm Kho</NavLink>
                <NavLink to='/transfer-warehouse-export' type="button" className="btn btn-success">Chuyển Kho</NavLink>

            </div>
        );
    }
}

export default WarehouseFormMenu;