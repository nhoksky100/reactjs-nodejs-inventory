import React, { Component } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import axios from 'axios';
import { toast } from 'react-toastify';
import { randomId } from '../../RandomId/randomId'

const getdataDocument = () => axios.get('/getDocument').then((res) => res.data)

class AddDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTeamp: null,
            dataDocument: [],
            isPrev: false,
            flagPosition: false,
            rowAddIndex: 0,
            columnValues: ['documentCode', 'documentImage', 'documentDateCreated',],
            documentImage: '',
            imageProfile: '',
            errorMessageImage: '',
            // input select

            id: '',

        };
        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true
        this.getData()
    }
    componentWillUnmount() {
        this._isMounted = false
    }

    getData = () => {
        getdataDocument().then((res) => {

            if (res) {



                let id = randomId();
                const isDuplicateitemsCode = (id) => {
                    return res.rows.some(item => item.id === id);
                };

                // Kiểm tra và tạo itemsCode mới nếu trùng lặp
                while (isDuplicateitemsCode(id)) {
                    id = randomId();
                }
                if (this._isMounted) {
                    this.setState({
                        dataDocument: res.rows.reverse(),
                        id: id
                    })
                }
                // this.setState({ itemsCode: itemsCode })
            }
        })
    }
    undoClearAddRow = () => {
        this.setState({ isPrev: true })
    }
    isChange = (e) => {
        const { value, name } = e.target;
        const { dataDocument } = this.state;
        // Kiểm tra xem giá trị nhập vào có tồn tại trong danh sách không


        this.setState({
            [name]: value,
        })


    }

    handleSave = () => {
        const { dataDocument, id, documentCode, documentImage, documentDateCreated, flagPosition, errorMessageImage } = this.state;
        if (!documentImage || !documentCode) {
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Lỗi điền thông tin hoặc đang rỗng!</i></div>)

            return
        }


        axios.post('/addDocument', {
            id,
            documentCode,
            documentImage,
            documentDateCreated: UpdateDateTime(),

        }).then(response => {
            // Xử lý sau khi yêu cầu được thêm thành công
            // console.log("Yêu cầu đã được thêm thành công:", response.data);

            // Cập nhật lại state hoặc thực hiện các hành động khác tại đây nếu cần
            // if (flagPosition) {
            this.getData();
            if (this._isMounted) {

                this.setState({
                    id: id,
                    documentCode: '',
                    documentImage: '',
                    documentDateCreated: UpdateDateTime(),
                    isPrev: !flagPosition ? true : false,
                    dataDocument: [...dataDocument, response.data] // Thêm dữ liệu mới vào state
                })
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Thêm chứng từ thành công!</i></div>)
            }



            // Gọi lại hàm để lấy dữ liệu mới từ máy chủ và cập nhật state dataDocument

        }).catch(error => {
            // Xử lý khi có lỗi xảy ra
            toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                <i>Đã xảy ra lỗi</i></div>)
            console.error("Đã xảy ra lỗi:", error);
        });

    }

    componentWillUnmount() {
        // Kiểm tra và thu hồi Object URL trước khi component bị hủy
        this.revokeObjectURL();

    }
    revokeObjectURL = () => {
        const { imageProfile, documentImage } = this.state;
        if (imageProfile) {
            URL.revokeObjectURL(imageProfile[0]);
        }
        if (documentImage) {
            URL.revokeObjectURL(documentImage[0]);
        }
    }
    isImageFile = (file) => {
        // Kiểm tra nếu định dạng file là hình ảnh
        return file.type.startsWith('image/');
        // return /\.(jpe?g|png|gif|bmp)$/i.test(file.name);
    };
    getFile = (e) => {
        const filesImg = e.target.files[0]; // lay ten file


        if (filesImg !== undefined) {
            if (this.isImageFile(filesImg)) {

                let reader = new FileReader();
                reader.readAsDataURL(filesImg);
                reader.onloadend = function (e) {
                    // Thu hồi Object URL cũ trước khi cập nhật state
                    this.revokeObjectURL();
                    this.setState({
                        imageProfile: [reader.result],
                        documentImage: [reader.result],
                        errorMessageImage: '',

                    })

                }.bind(this);
            }
            else {

                this.setState({
                    documentImage: '',
                    imageProfile: '',
                    errorMessageImage: 'Chỉ chấp nhận file hình ảnh (jpg, png, etc.)',
                });
            }
        }

    }

    arrayInputAddRow = () => {
        const { columnValues, dataDocument, isItemExist } = this.state;
        let pusInput = [];
        for (let i = 0; i < columnValues.length; i++) {
            if (columnValues[i] === 'documentImage') {
                // Thêm một thẻ select và input/textarea vào mảng pusInput

                // Nếu dataList rỗng
                pusInput.push(
                    <td key={i}>
                        <div style={{ display: 'inline-block', position: 'relative', margin: '10px' }}>


                            <input
                                type="file"
                                accept=".png, .jpeg, .jpg" // Chỉ chấp nhận các file có định dạng .png và .jpeg
                                onChange={(event) => this.getFile(event, columnValues[i])} // Gọi hàm handleFileChange khi có sự thay đổi
                                autoFocus={i === 0 ? true : false}
                                name={columnValues[i]}
                                // style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    opacity: 0,
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer'
                                }}
                                ref={columnValues[i]}
                            />
                            {this.state.imageProfile === '' && <label htmlFor={columnValues[i]} style={{ cursor: 'pointer' }}>
                                <i className='bx bxs-file-image' style={{ cursor: 'pointer', fontSize: '14px', color: '#007bff' }}>Tải lên file ảnh</i>
                            </label>
                            }
                            {this.state.errorMessageImage && (
                                <div style={{ color: 'red' }}>{this.state.errorMessageImage}</div>
                            )}
                            {this.state.imageProfile !== '' &&
                                <img style={{ width: '200px', borderRadius: 0, objectFit: 'unset' }} className="" src={this.state.imageProfile[0]} alt='' />

                            }
                        </div>
                    </td>
                );


            } else {
                // Thêm một textarea cho các trường khác
                pusInput.push(
                    <td key={i}>

                        <textarea
                            readOnly={
                                columnValues[i] === 'id' ||
                                columnValues[i] === 'documentDateCreated'
                                && true}
                            onChange={(event) => this.isChange(event)}
                            name={columnValues[i]}
                            value={
                                // (columnValues[i] === 'id')
                                //     ? id
                                // :
                                // (columnValues[i] === 'itemsCode')
                                //     ? itemsCode
                                //     :
                                (columnValues[i] === 'documentDateCreated')
                                    ? UpdateDateTime()
                                    : this.state[columnValues[i]]
                            }
                            autoFocus={i === 0 ? true : false}
                            style={{ marginLeft: '10px', border: '1px solid #cdcdcd' }}
                        />
                    </td>
                );
            }
        }
        return pusInput;
    };
    render() {
        if (this.state.isPrev) {
            window.history.back()
            
        }
        return (
            <div className='table-data'>
                <div className="order">
                    <div className='head'>
                        <div className="head-content-menu">
                            <img onClick={() => this.undoClearAddRow()} title='Quay lại' src='../icons/color/undo.png' />
                        </div>
                    </div>
                    <div className="head">
                        <h3>Thêm nhà cung cấp</h3>
                        {/* <i className="bx bx-search" /> */}
                        <i className="bx bx-filter" />
                    </div>
                    <div className='table-add-row '>

                        <table>
                            <thead>
                                <tr>
                                    <th ><i className='bx bxs-flag-checkered'></i></th>

                                    <th >Mã chứng từ</th>
                                    <th >Hình ảnh</th>
                                    <th >Ngày tạo</th>

                                    <th >Hành động</th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr>
                                    <td><input onClick={() => this.setState({ flagPosition: !this.state.flagPosition })}
                                        style={{ cursor: 'pointer' }} type="checkbox" name="" id="" title='Chọn để giữ lại form nếu tiếp tục thêm hàng tiếp theo' /></td>
                                    {this.arrayInputAddRow()}

                                    <td >

                                        <img onClick={() => this.undoClearAddRow()} title='Quay lại' src='../icons/color/undo.png' />
                                        <img onClick={() => this.handleSave()} title='Đồng ý lưu' src='../icons/color/check.png' />
                                    </td>

                                </tr>


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddDocument;