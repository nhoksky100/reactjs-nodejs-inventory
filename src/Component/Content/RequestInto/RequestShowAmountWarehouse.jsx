import React, { Component } from 'react';

class RequestShowAmountWarehouse extends Component {
    showDataItemListApprove = () => {
        const { dataRequest, dataWarehouse, newRowDataList, rowIndex } = this.props;

        // console.log(newRowDataList, 'newRowDataList');
        // console.log(rowIndex, 'valueIndex');

        // Lọc dataWarehouse dựa trên điều kiện orderCode === warehouseItemsCode
        let filteredWarehouse = []
        if (newRowDataList.length !== 0) {
            filteredWarehouse = dataWarehouse.filter(item => item.warehouseItemsCode === newRowDataList[rowIndex].orderCode);
        }
        console.log(filteredWarehouse, 'filteredWarehouse');
        if (filteredWarehouse.length !== 0 && newRowDataList.length !== 0) {
            // Lọc dataRequest để chỉ lấy các mục có orderCode tương tự như warehouseItemsCode trong filteredWarehouse
            const filteredRequests = dataRequest.filter(request => request.orderCode === newRowDataList[rowIndex].orderCode
                && parseInt(request.orderComplete !== null ? request.orderComplete : 0) !== 3);

            // Tính tổng amount của các mục trong filteredRequests
            const totalAmount = filteredRequests.length !== 0 ? filteredRequests.reduce((acc, curr) => parseInt(acc) + parseInt(curr.amount), 0) : 0

            return (
                <>
                    {filteredWarehouse.map((value, key) => (
                        <tr key={key}>
                            <td>{value.warehouseItemsCode}</td>
                            <td>{value.warehouseResidual}</td>
                            <td>{totalAmount}</td>
                            <td>{value.warehouseQuotaMin}</td>
                            <td>{value.warehouseQuotaMax}</td>
                            <td>{value.warehouseUnit}</td>
                            <td>{value.warehouseStatus}</td>
                            <td>{filteredRequests.length !== 0 ? filteredRequests[0].dateCreated : ''}</td>
                            <td>{filteredRequests.length !== 0 ? filteredRequests[0].dateUpdate : ''}</td>
                        </tr>
                    ))}
                </>
            );
        }
    };
    render() {
        const { isSelected } = this.props || false;
        const { newRowDataList } = this.props || [];
        return (
            <div className='order'>

                {newRowDataList.length !== 0 &&
                    <table className=''>
                        <thead>
                            <tr>
                                <th>Mã hàng</th>
                                <th>Hàng tồn</th>
                                <th>Số lượng đã đặt</th>
                                <th>Số lượng tồn nhỏ nhất</th>
                                <th>Số lượng tồn lớn nhất</th>
                                <th>Đơn vị tính</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Ngày cập nhật</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isSelected &&
                                this.showDataItemListApprove()

                            }
                        </tbody>
                    </table>

                }

            </div>
        );
    }
}

export default RequestShowAmountWarehouse;