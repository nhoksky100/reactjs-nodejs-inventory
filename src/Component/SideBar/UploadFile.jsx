import React, { Component, createRef } from 'react';
import axios from 'axios';
// import {toast} from 'react-toastify';
// import UpdateDateTime from '../UpdateDateTime'
import { UpdateDateTime } from '../UpdateDateTime';
import { randomId } from '../RandomId/randomId';
class UploadFile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryMusic: 'Đang cập nhật',
            nameSong: 'Đang cập nhật',
            nameSinger: 'Đang cập nhật',
            describe: 'Đang cập nhật',
            categoryMusicOrder: 'Đang cập nhật',
            isMusicOrder: false,
            imageProfile: '',
            audioFile: '',
            errorMessageImage: '',
            errorMessageAudio: '',
            idTokenUser:'',
            emailUser:'',
        }
        this.typingTimeoutRef = createRef()
    }


    componentWillUnmount() {
        // Kiểm tra và thu hồi Object URL trước khi component bị hủy
        this.revokeObjectURL();

    }
    revokeObjectURL = () => {
        const { imageProfile } = this.state;
        if (imageProfile) {
            URL.revokeObjectURL(imageProfile[0]);
        }
    }
    isChange = (e) => {
        const val = e.target.value;
        const name = e.target.name;
        if (this.typingTimeoutRef.current) {
            clearTimeout(this.typingTimeoutRef.current);
        }
        this.typingTimeoutRef.current = setTimeout(() => {
            if (val === 'order-music' || name === 'categoryMusicOrder') {
                this.setState({
                    categoryMusicOrder: val,
                    categoryMusic: '',
                    isMusicOrder: true
                })
            } else if (name === 'categoryMusic') {
                this.setState({ [name]: val, isMusicOrder: false, categoryMusicOrder: '' })
            }

            else {
                this.setState({ [name]: val })
            }

        }, 500); // Khoảng thời gian 0.5 giây


    }
    // image file

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
                        errorMessageImage: '',

                    })

                }.bind(this);
            }
            else {

                this.setState({
                    imageProfile: '',
                    errorMessageImage: 'Chỉ chấp nhận file hình ảnh (jpg, png, etc.)',
                });
            }
        }

    }
    // audio file
    getAudioFile = (e) => {
        const filesAudio = e.target.files[0];

        if (filesAudio !== undefined) {
            if (this.isMp3File(filesAudio)) {
                // Xử lý file mp3
                this.setState({
                    audioFile: filesAudio,
                    errorMessageAudio: '',
                });
            } else {
                this.setState({
                    audioFile: '',
                    errorMessageAudio: 'File không phải là định dạng .mp3',
                });
            }
        }
    };

    isMp3File = (file) => {
        // Kiểm tra nếu định dạng file là .mp3
        return /\.(mp3)$/i.test(file.name);
    };
    handleClickUploadFile = () => {
        const { nameSong, nameSinger, describe, imageProfile, audioFile, categoryMusic, categoryMusicOrder } = this.state;
      
        if (categoryMusic === '') {
            categoryMusic = categoryMusicOrder
        }

        if (audioFile !== '' && imageProfile !== '') {
            var formData = new FormData();
            formData.append("audio", audioFile);
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }

            axios.post('/uploadFileMp3', formData, config)
                .then((res) => {
                    var filePath = res.data.fileNameInServer;

                    // let list_image = Array.prototype.join.call(filePath); // tách 1 array => nhiều array
                    
                    // listImage.push(filePath.slice(31)); // bỏ ký tự từ 0 ->31 và thêm nó vào vùng chứa chung 1 vùng

                   
                    const audioFileName = audioFile.name;
                    const audioFileSize = audioFile.size;
                    // console.log(audioFileSize);
                    let id = randomId();
                    let dateTime = UpdateDateTime(new Date())

                    axios.post('/uploadFile', { id, nameSong, nameSinger, describe, imageProfile, audioFileName, audioFileSize, categoryMusic, dateTime })
                        .then(resp => {
                            console.log('thanh cong');
                            
                            // toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                            //     <i>Có lỗi xảy ra, kiểm tra lại!</i></div>)


                        })
                })
            .catch(error => {
                console.error('Error updating file .mp3:', error);
                // Hiển thị thông báo lỗi nếu cần
            });

        }
    }
    render() {
        // console.log(this.props.match.path,'ủl');



        return (
            <div className='container' id='container-upload'>
                <div className='row'>



                    <div className='wrapper'>
                        {/* <form className="form" id="form"> */}
                            <fieldset>
                                <div className='col-md-9'>


                                    <div className='formRow' id='form-upload'>


                                        <div className="form-group">
                                            <div className="col-md-4">
                                                <label className="formLeft" htmlFor="song-ip">Tên bài hát:</label>
                                                <div className="formRight">
                                                    <input onChange={(e) => this.isChange(e)} name='nameSong' id='song-ip' className="form-control form-control-sm" type="text" placeholder="" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-md-4">
                                                <label className="formLeft" htmlFor="singer-ip">Tên ca sĩ/Nghệ sĩ:</label>
                                                <div className="formRight">
                                                    <input onChange={(e) => this.isChange(e)} name='nameSinger' id='singer-ip' className="form-control form-control-sm" type="text" placeholder="" />
                                                </div>
                                            </div>
                                        </div>


                                        <div className="form-group">
                                            <div className="col-md-4">
                                                <label className="formLeft" htmlFor="category-ip">Thể loại:</label>
                                                <div className="formRight">
                                                    <select id="inputState" onChange={(e) => this.isChange(e)} defaultValue={'Đang cập nhật'} name='categoryMusic' className="form-control">
                                                        <option value={'Đang cập nhật'}>Đang cập nhật...</option>
                                                        <option>Nhạc trẻ</option>
                                                        <option>Nhạc nước ngoài</option>
                                                        <option>Nhạc Hàn</option>
                                                        <option>Nhạc Âu Mỹ</option>
                                                        <option>Nhạc Hoa</option>
                                                        <option>Nhạc Việt</option>
                                                        <option>Nhạc remix</option>
                                                        <option>Nhạc Dance</option>
                                                        <option>Nhạc trữ tình & Bolero</option>
                                                        <option value={'order-music'}>Khác</option>
                                                    </select>
                                                    {this.state.isMusicOrder &&
                                                        <input onChange={(e) => this.isChange(e)} name='categoryMusicOrder' id='singer-ip' className="form-control form-control-sm" type="text" placeholder="" />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <div className="col-md-4">

                                                <div className="formRight">
                                                    <div className="form-group">
                                                        <label style={{ marginTop: '15px' }} className="formLeft" htmlFor="singer-ip">Giới thiệu:</label>
                                                        <textarea className="form-control" name="describe" id="" rows="3"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-9'>


                                    <div className='formRow'>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="exampleFormControlFile1">
                                                    Tải lên file nhạc:<span className="req">*</span>
                                                </label>

                                                <input
                                                    type="file"
                                                    accept="audio/*"
                                                    className="form-control-file"
                                                    id="exampleFormControlFile1"
                                                    ref={'file'}
                                                    onChange={(e) => this.getAudioFile(e)}
                                                    style={{ color: 'red' }}
                                                />
                                                {this.state.errorMessageAudio && (
                                                    <div style={{ color: 'red' }}>{this.state.errorMessageAudio}</div>
                                                )}
                                                {this.state.audioFile && (
                                                    <p>Đã chọn file âm thanh: {this.state.audioFile.name}</p>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                    <div className='formRow'>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="exampleFormControlFile1">
                                                    Tải lên hình đại diện bài hát:<span className="req">*</span>
                                                </label>
                                                <input type="file" className="form-control-file" id="exampleFormControlFile1" ref={'file'}
                                                    onChange={(e) => this.getFile(e)}
                                                    style={{ color: 'red' }}
                                                />
                                                {this.state.errorMessageImage && (
                                                    <div style={{ color: 'red' }}>{this.state.errorMessageImage}</div>
                                                )}
                                                {this.state.imageProfile !== '' &&
                                                    <img style={{ width: '200px' }} className="" src={this.state.imageProfile[0]} alt='' />

                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-5'>

                                    <div className="col-md-4">
                                        <div className='submit-uploadFile'>


                                            <a onClick={() => this.handleClickUploadFile()} className="btn-upload">
                                                <i className="bx bxs-cloud-upload" />
                                                <span className="text">Tải lên</span>
                                            </a>
                                        </div>
                                        {/* <button style={{marginTop:'15px',border:'none'}} type="button" className="btn btn-primary" >Gửi</button> */}
                                    </div>
                                    {/* <div id="contents">

                                        <input type="file" id="thefile" accept="audio/*" />

                                        <canvas id="canvas"></canvas>

                                        <audio id="audio" controls></audio>

                                    </div> */}

                                </div>
                            </fieldset>
                        {/* </form> */}
                    </div>
                </div>
            </div>
        );
    }
}

export default UploadFile;