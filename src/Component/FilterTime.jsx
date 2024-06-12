import React, { Component, Fragment } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { searchDatetimeEnd, searchDatetimeStart } from '../StoreRcd';
import { connect } from 'react-redux';

class FilterTime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: '',
            endDate: ''
        }
    }
    componentDidMount() {
        const startDate = null;
        const endDate = new Date();
        this.setState({
            startDate: startDate,
            endDate: endDate
        })

    }
    setStartUpdateDate = (date) => {

        this.props.SearchDateTimeStart(date.toISOString())

        this.setState({
            startDate: date
        })
    }
    setEndDate = (date) => {

        this.props.SearchDateTimeEnd(date.toISOString())

        this.setState({
            endDate: date
        })
    }
    datePicker = () => {
        const { startDate, endDate } = this.state;
        let handleColor = (time) => {
            return time.getHours() > 12 ? "text-success" : "text-error";
        };
        return (
            <div className='pickerForm' style={{ display: 'inline-flex' }} >

                <div style={{ marginRight: '10px' }}>
                    <span style={{ position: 'relative', background: 'none' }}>Từ: </span>
                    <DatePicker
                        dateFormat="dd/MM/yyyy"
                        showTimeSelect
                        selected={startDate}
                        onChange={(date) => this.setStartUpdateDate(date)}
                        selectsStart

                        startDate={startDate}
                        // className="datePickerInput"

                        endDate={endDate}
                        timeClassName={handleColor}

                    />
                </div>

                <div style={{ marginRight: '10px' }} >
                    <span style={{ position: 'relative', background: 'none' }}>Đến: </span>
                    < DatePicker
                        dateFormat="dd/MM/yyyy"
                        showTimeSelect
                        selected={endDate}
                        onChange={(date) => this.setEndDate(date)}
                        selectsEnd

                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        timeClassName={handleColor}

                    />
                </div>

                {/* <form id="external-form">
                    <input type="submit" />
                </form> */}
            </div>


        )




    }
    render() {

        return (
            <Fragment>



                {this.datePicker()}

            </Fragment>




        );
    }
}
const mapStateToProps = (state, ownProps) => {
    return {

    }
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        SearchDateTimeStart: (act_search_datetime) => {
            dispatch(searchDatetimeStart(act_search_datetime))
        },
        SearchDateTimeEnd: (act_search_datetime) => {
            dispatch(searchDatetimeEnd(act_search_datetime))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FilterTime);
