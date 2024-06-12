import React, { Component } from 'react'

export default class RequestAmountOrder extends Component {
    render() {
        const { countRequestNotApprove, countRequestApproved, countRequestApproveReturn, countRequestAll } = this.props

        const requestOrderText = sessionStorage.getItem('requestOverView') || 'Nhập'
        return (
            <div style={{ marginTop: '20px' }} className="todo">
                <div className="head">
                    <h3>Đơn {requestOrderText}</h3>
                    {/* <i className="bx bx-plus" /> */}
                    {/* <i className="bx bx-filter" /> */}
                </div>

                <div className="overview">
                    <table>
                        <thead>
                            <tr>
                                <th>Đơn {requestOrderText}</th>
                                <th>Số Lượng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><p>Đơn chưa duyệt</p></td>
                                <td>{countRequestNotApprove}</td>
                            </tr>
                            <tr>
                                <td><p>Đơn đã duyệt</p></td>
                                <td>{countRequestApproved}</td>
                            </tr>
                            <tr>
                                <td><p>Đơn từ chối</p></td>
                                <td>{countRequestApproveReturn}</td>
                            </tr>
                            <tr>
                                <td><p>Tổng đơn</p></td>
                                <td>{countRequestAll.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
