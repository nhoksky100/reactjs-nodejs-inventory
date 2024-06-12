import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'


export class PurchaseFormMenu extends Component {

    render() {
        const { permission } = this.props || ''
        const pathName = window.location.pathname || ''

        return (
            <div className="head-content-menu">
                <NavLink to='/purchase' className={`btn btn-success ${pathName === '/purchase' ? 'active' : 'none-active'}`}>Đơn chưa duyệt</NavLink>
                <NavLink to='/purchase/request-approved' className="btn btn-success">Đơn đã duyệt</NavLink>
                <NavLink to='/purchase/document' className="btn btn-success">Xem chứng từ</NavLink>
                {permission === 'Thành viên thu mua' &&

                    <NavLink to='/purchase/add-document' className="btn btn-success">Nhập chứng từ</NavLink>
                }
                {permission === 'Thành viên thu mua' &&
                    <NavLink to='/purchase/into-warehouse' className="btn btn-success">Nhập kho</NavLink>
                }
                <NavLink to='/purchase/request-all' className="btn btn-success">Lịch sử</NavLink>
            </div>
        )
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        permission: state.allReducer.permission,
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {


    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PurchaseFormMenu)
