import React, { Component } from 'react';
// import { connect } from 'react-redux';
//import { connect } from 'react-redux';


class NotPage404 extends Component {

    // goBack(){
    //     this.props.history.goBack();
    // }
    // componentWillUpdate(nextProps, nextState) {
    //     this.props.is_status_app();
    // }
    comback = () => {
        window.history.back();
    }
    render() {
        //  var isExact =this.props.match.isExact

        // alert('co 404');
        return (
            <div className=''>
                    <h1 className="text-center">404 page!</h1>
                    <a onClick={() => this.comback()} title='comback' className="btn btn-info center"><i className="fa fa-arrow-left" aria-hidden="true" /></a>
                    {/* { onClick={()=>window.history.go(-1)} } */}
                <div id='not-404'>
                </div>
            </div>
        );
    }
}

export default NotPage404