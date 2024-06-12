import axios from 'axios';
import React, { Component, Fragment } from 'react';
import { toast } from 'react-toastify';
const getDataListFindFriend = () => axios.get('/account_Customer').then((res) => res.data)
const getDataImageProfile = () => axios.get('/imageFile').then((res) => res.data)
const getListSendFriend = () => axios.get('/listSendFriend').then((res) => res.data)

class ListFindFriend extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataFindFriend: null,
            dataListSendFriend: null,
            dataImageProfileFriend: null,
            imageProfileYou: '',
            isTextFriend: '',
            statusSendFriend: false,
            statusSender: false,
        }
    }
    componentDidMount() {
        // this.dataImageProfile()
        this.getData();
    }

    getData = () => {
        getDataImageProfile().then((res) => {
            this.setState({ dataImageProfileFriend: res })
            // res.map((value) => {

            //     if (this.props.tokenObj.email === value.email) {

            //         this.setState({ imageProfileYou: value.image })
            //         // return;
            //     }

            // })

        })
        getDataListFindFriend().then((res) => {
            // console.log(res, 'res');
            this.setState({ dataFindFriend: res })
        })
        getListSendFriend().then((res) => {
            // console.log(res, 'res');
            this.setState({ dataListSendFriend: res })
        })


            .catch((error) => {
                toast(<div className="advertise"><i className="fa fa-minus-circle" aria-hidden="true" />
                    <i>Không tìm thấy dữ liệu FindFriend {error} !</i></div>)
            })

    }



    componentDidUpdate(prevProps, prevState) {
        const { statusSender } = this.state;
        if (statusSender && statusSender !== prevState.statusSender) {
            this.getData()
            this.setState({ statusSender: false })
        }
    }




    statusSendFriend = (dataFriend, dataFriendSender) => {
        // dataFriend || lấy được thông tin người dùng này
        const { statusSendFriend, } = this.state;
        this.setState({ statusSendFriend: !statusSendFriend, statusSender: true })

        axios.post('/listSendFriend', { dataFriend, statusSendFriend, dataFriendSender })
    }

    dataListSender = () => {
        const { dataListSendFriend } = this.state;
        if (dataListSendFriend) {
            dataListSendFriend.map((value, key) => {

            })
        }
    }

    showFindFriend = () => {
        const { dataFindFriend, dataListSendFriend, dataImageProfileFriend, } = this.state;

        const { tokenObj } = this.props;
        // let textSend = []
        // Nối các mảng thành một mảng duy nhất

        if (dataFindFriend && tokenObj && dataListSendFriend) {
            // Nối các mảng thành một mảng duy nhất

            return dataFindFriend.map((value, key) => {
                // console.log(dataImageProfileFriend[key].email);


                // console.log(dataImageProfileFriend[key].email);
                if (tokenObj.email !== value.email) {
                    return (
                        <li key={key}>
                            <img className="card-img-top" src={dataImageProfileFriend[key].image !== undefined && dataImageProfileFriend[key].image || ''} alt="" />
                            <div className="card-body">
                                <h3 className="card-title">{value.name || value.username}</h3>
                                <h5 className="card-title"> 0 bạn chung</h5>
                                {/* <p className="card-text">
                            Some quick example text to build on the card title and make up the bulk
                            of the card's content.
                        </p> */}



                                <a onClick={() => this.statusSendFriend(value, tokenObj)} href="#"
                                    style={{ display: 'block', margin: '10px', cursor: 'pointer' }} className="btn btn-primary">
                                   Thêm bạn
                                    {/* {this.state.statusSendFriend ? 'Đã gửi kết bạn' : 'Thêm bạn'} */}
                                </a>
                                <a style={{ display: 'block', margin: '10px', cursor: 'pointer' }} className="btn btn-primary">
                                    Ẩn
                                </a>

                            </div>
                        </li>
                    )
                }
            })
        }
    }
    render() {

        return (
            // <main>
                <ul className='box-info-friend' >
                    {this.showFindFriend()}
                    <li >
                        <img className="card-img-top" src={'../images/profile.jpg'} alt="" />
                        <div className="card-body">
                            <h3 className="card-title">.</h3>
                            <h5 className="card-title"> 0 bạn chung</h5>
                            {/* <p className="card-text">
                            Some quick example text to build on the card title and make up the bulk
                            of the card's content.
                        </p> */}



                            <a style={{ display: 'block', margin: '10px' }} href="#" className="btn btn-primary">
                                Thêm bạn
                            </a>
                            <a style={{ display: 'block', margin: '10px' }} href="#" className="btn btn-primary">
                                Ẩn
                            </a>

                        </div>
                    </li>
                    <li >
                        <img className="card-img-top" src={'../images/profile.jpg'} alt="" />
                        <div className="card-body">
                            <h3 className="card-title">.</h3>
                            <h5 className="card-title"> 0 bạn chung</h5>
                            {/* <p className="card-text">
                            Some quick example text to build on the card title and make up the bulk
                            of the card's content.
                        </p> */}



                            <a style={{ display: 'block', margin: '10px' }} href="#" className="btn btn-primary">
                                Thêm bạn
                            </a>
                            <a style={{ display: 'block', margin: '10px' }} href="#" className="btn btn-primary">
                                Ẩn
                            </a>

                        </div>
                    </li>
                    <li >
                        <img className="card-img-top" src={'../images/profile.jpg'} alt="" />
                        <div className="card-body">
                            <h3 className="card-title">.</h3>
                            <h5 className="card-title"> 0 bạn chung</h5>
                            {/* <p className="card-text">
                            Some quick example text to build on the card title and make up the bulk
                            of the card's content.
                        </p> */}



                            <a style={{ display: 'block', margin: '10px' }} href="#" className="btn btn-primary">
                                Thêm bạn
                            </a>
                            <a style={{ display: 'block', margin: '10px' }} href="#" className="btn btn-primary">
                                Ẩn
                            </a>

                        </div>
                    </li>

                </ul>
            // </main>

        );
    }
}

export default ListFindFriend;