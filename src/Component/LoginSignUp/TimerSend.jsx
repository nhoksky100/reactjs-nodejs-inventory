import React, { Component } from 'react';
import { connect } from 'react-redux';
import Cookies from 'universal-cookie';
import { isDisableInput, reSendEmail } from '../../StoreRcd';

class TimerSend extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timer: 300, // 300 seconds = 5 minutes
            isTimerRunning: false,
        };
    }
    componentDidMount() {
        this._isMounted = true;
        const remainingTimeFromCookie = this.getRemainingTimeFromCookie();
        if (remainingTimeFromCookie !== null) {
            this.setState({ timer: remainingTimeFromCookie });
            this.startTimer();
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
        this.stopTimer();
    }
    getRemainingTimeFromCookie = () => {
        const cookies = new Cookies();
        const codeConfirmCookie = cookies.get('codeConfirm');

        if (codeConfirmCookie) {
            const expirationTime = new Date(codeConfirmCookie.expires);
            const currentTime = new Date();
            const remainingSeconds = Math.floor((expirationTime - currentTime) / 1000);

            return remainingSeconds > 0 ? remainingSeconds : 0;
        }
        return null;
    };
    startTimer = () => {
        this.setState({ isTimerRunning: true });

        if (this._isMounted) {
            this.timerInterval = setInterval(() => {
                if (this._isMounted) {
                    this.setState((prevState) => {
                        const newTimer = prevState.timer - 1;
                        return { timer: newTimer >= 0 ? newTimer : 0 };
                    });

                    if (this.state.timer <= 0) {
                        this.props.ISDISABLEINPUT(false);
                        this.stopTimer();
                    }
                }
            }, 1000);
        }
    };

    stopTimer = () => {
        clearInterval(this.timerInterval);
        this.setState({
            timer: 300,
            isTimerRunning: false,
        });

    };

    handleClickResend = () => {
        // vô hiệu hóa email input
        this.props.ISDISABLEINPUT(true)
        //gửi lại mã đến email
        this.props.IS_RE_SENDEMAIL(true);
        // chạy lại thời gian đếm ngược cho mỗi lần xác minh khi gửi lại
        this.startTimer()
        // send  email confirm
    }

    render() {
        const { timer, isTimerRunning } = this.state;
        return (
            <div style={{ position: 'relative' }} className=" p-l-110 p-r-110 p-t-62 p-b-33">
                <div className="row ">
                    {/* ... Your existing JSX code ... */}
                    {isTimerRunning ? (
                        <div id='timerSend'>
                            <p className='timer'>thời gian còn: {Math.floor(timer / 60)}:{timer % 60}</p>

                        </div>
                    ) : <div id='re-send' onClick={() => this.handleClickResend()}><i>Gửi lại mã</i></div>
                    }
                </div></div>
        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        isDisableInput: state.allReducer.isDisableInput
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        ISDISABLEINPUT: (action_isDisableInput) => {
            dispatch(isDisableInput(action_isDisableInput))
        },
        IS_RE_SENDEMAIL: (action_reSendEmail) => {
            dispatch(reSendEmail(action_reSendEmail))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TimerSend)
