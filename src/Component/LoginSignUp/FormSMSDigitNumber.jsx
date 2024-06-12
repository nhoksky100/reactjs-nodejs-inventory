
import React, { Component, Fragment, createRef } from 'react';
import { connect } from 'react-redux';
import { codeConfirmInput, isClearFormInput } from '../../StoreRcd';
// const getDataAccountCustomer = () => axios.get('/sendEmailConfirm').then((res) => res.data)

class FormSMSDigitNumber extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataConfirmCode: null,
            values: [1, 2, 3, 4, 5, 6],
            focusedInput: 0,
            flagConfirm: true,
            confirmedValues: [],
            changeCount: 0,

            numbers: ['', '', '', '', '', ''], countNumber: 0, isConfirmCode: false
        };
        // Tạo một ref cho mỗi input
        this.inputRefs = Array.from({ length: 6 }, () => createRef());
    }

    componentDidMount() {
        this.setupInputFields();


    }
    setupInputFields = () => {
        const in1 = document.getElementById('otc-1');
        const ins = document.querySelectorAll('input[type="number"]');

        if (ins && ins !== undefined && in1 && in1 !== undefined) {
            const splitNumber = function (e) {
                let data = e.data || e.target.value;
                if (!data) return;
                if (data.length === 1) return;

                popuNext(e.target, data);
            };

            const popuNext = function (el, data) {
                el.value = data[0];
                data = data.substring(1);
                if (el.nextElementSibling && data.length) {
                    popuNext(el.nextElementSibling, data);
                }
            };

            ins.forEach(function (input) {
                input.addEventListener('keyup', function (e) {
                    if (e.keyCode === 16 || e.keyCode == 9 || e.keyCode == 224 || e.keyCode == 18 || e.keyCode == 17) {
                        return;
                    }

                    if ((e.keyCode === 8 || e.keyCode === 37) && this.previousElementSibling && this.previousElementSibling.tagName === "INPUT") {
                        this.previousElementSibling.select();
                    } else if (e.keyCode !== 8 && this.nextElementSibling) {
                        this.nextElementSibling.select();
                    }

                    if (e.target.value.length > 1) {
                        splitNumber(e);
                    }
                });

                input.addEventListener('focus', function (e) {
                    if (this === in1) return;

                    if (in1.value === '') {
                        in1.focus();
                    }

                    if (this.previousElementSibling.value === '') {
                        this.previousElementSibling.focus();
                    }
                });
            });

            in1.addEventListener('input', splitNumber);
        }
    }
    isChangeConfirm = (e, index) => {
        try {
            const { value, name } = e.target;
            if (value && value.length >= 1) {
                e.preventDefault();
            }
            this.setState({ [name]: value })
            // const filteredValues = updatedConfirmedValues.filter((val) => val !== "");
            this.setState((prevState) => {
                const updatedNumbers = [...prevState.numbers];
                let countNumber = 0;

                if (prevState.countNumber <= 6) {
                    countNumber = prevState.countNumber + 1;
                } else {
                    countNumber = prevState.countNumber;
                }

                updatedNumbers[index - 1] = value;

                return {
                    numbers: updatedNumbers,
                    countNumber: countNumber
                };
            }, () => {
                // Gọi hàm sau khi setState đã hoàn thành
                this.props.CODE_CONFIRM_INPUT(this.state.numbers);
            });
        } catch (error) {
            console.log('Lỗi form SMS', error);
        }
    };
    onKeyPressChange = (e) => {
        // let { countNumber } = this.state;
        const { countNumber, numbers } = this.state;
        const charCode = e.charCode || e.keyCode;
        // if (e.keyCode === 8) {

        //     this.setState((prevState) => {
        //         if (prevState.countNumber > 0) {
        //             let countNumber = prevState.countNumber -= 2;
        //             return {
        //                 countNumber: countNumber
        //             }
        //         }
        //     })
        //     // this.setState({ countNumber: countNumber })

        // }


        if (charCode >= 48 && charCode <= 57) {
            // Ký tự là số từ 0 đến 9
            this.props.CODE_CONFIRM_INPUT(numbers);
        } else if (charCode === 8) {
            // Người dùng nhấn backspace
            this.setState((prevState) => {
                if (prevState.countNumber > 0) {
                    const updatedNumbers = [...prevState.numbers];
                    updatedNumbers.pop(); // Loại bỏ phần tử cuối cùng
                    return {
                        numbers: updatedNumbers,
                        countNumber: prevState.countNumber - 1
                    };
                }
                return null;
            });
        }
    }
    clearInputValues = () => {
        // Lặp qua mảng ref và xóa giá trị của từng input
        this.inputRefs.forEach((ref) => {
            if (ref.current) {
                ref.current.value = '';
            }
        });

        // Xóa giá trị trong state
        this.setState({
            numbers: ['', '', '', '', '', ''],
            countNumber: 0
        });
    };
    componentDidUpdate(prevProps, prevState) {
        const { countNumber, numbers } = this.state;
        const { isClearFormInput } = this.props;
        // console.log(this.props.isConfirm, 'props');
        if (countNumber >= 6 && countNumber !== prevState.countNumber) {
            // Kiểm tra xem có sự thay đổi về countNumber hay không
            this.props.CODE_CONFIRM_INPUT(numbers);
        }

        if (isClearFormInput !== prevProps.isClearFormInput && isClearFormInput) {
            this.props.ISCLEARFORMINPUT(false);

            setTimeout(this.clearInputValues, 2000);
        }

    }

    render() {

        const { values } = this.state;

        return (
            <Fragment>
                <form className="otc" name="one-time-code" action="#">
                    <fieldset>
                        <legend>Nhập mã xác nhận</legend>
                        <div>
                            {values.map((index) => (
                                <label key={index} htmlFor={`otc-${index}`}>{`Number ${index}`}</label>
                            ))}
                            <div>
                                {values.map((index) => (

                                    <input
                                        onKeyPress={(e) => this.onKeyPressChange(e)}
                                        ref={this.inputRefs[index - 1]}
                                        key={index}
                                        type="number"
                                        pattern="[0-9]*"
                                        min={0}
                                        max={9}
                                        maxLength={1}

                                        inputtype="numeric"
                                        id={`otc-${index}`}
                                        autoComplete="one-time-code"
                                        required=""
                                        name={'number' + index}
                                        onChange={(e) => this.isChangeConfirm(e, index)}
                                        autoFocus={index === 1 && true}
                                    />
                                ))}
                            </div>

                        </div>
                    </fieldset>
                </form>



            </Fragment>
        );

    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        isConfirmCode: state.allReducer.isConfirmCode,
        isClearFormInput: state.allReducer.isClearFormInput,
    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        CODE_CONFIRM_INPUT: (action_codeConfirmInput) => {
            dispatch(codeConfirmInput(action_codeConfirmInput))
        },
        ISCLEARFORMINPUT: (action_isClearFormInput) => {
            dispatch(isClearFormInput(action_isClearFormInput))
        }

    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FormSMSDigitNumber)

