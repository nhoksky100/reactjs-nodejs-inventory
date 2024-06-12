import React, { Component, Fragment } from 'react';
import axios from 'axios';
import ProfileAccount from './ProfileAccount';
import { UpdateDateTime } from '../../UpdateDateTime';
import RequestHistoryForm from './RequestHistoryForm';
import RequestHistoryPDFForm from './RequestHistoryPDFForm';
import { connect } from 'react-redux';
import { isSearchFormHistoryProfile } from '../../../StoreRcd';

class ProfileForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'Thông tin',
    };
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.updateSearchFormHistoryProfile(this.state.activeTab);
  }
  componentWillUnmount = () => {
    this._isMounted = false
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeTab !== this.state.activeTab) {
      if (this._isMounted) {

        this.updateSearchFormHistoryProfile(this.state.activeTab);
      }
    }
  }

  updateSearchFormHistoryProfile = (tabName) => {
    if (tabName === 'Lịch sử đơn') {
      this.props.is_SearchFormHistoryProfile(true);
    } else {
      this.props.is_SearchFormHistoryProfile(false);
    }
  };

  changeTab = (tabName) => {
    if (this._isMounted) {

      this.setState({ activeTab: tabName });
    }
  };

  renderTabContent = () => {
    const { activeTab } = this.state;
    const { tokenObj } = this.props || '';
   
    switch (activeTab) {
      case 'Thông tin':
        return <ProfileAccount tokenObj={tokenObj} />;
      case 'Lịch sử đơn':
        return <RequestHistoryForm tokenObj={tokenObj} />;
      case 'Xuất file PDF':
        return <RequestHistoryPDFForm tokenObj={tokenObj} />;
      default:
        return null;
    }
  };

  render() {
    const { activeTab } = this.state;
    const dateTime = UpdateDateTime() || '';

    return (
      <Fragment>
        <div className="tabsOverView">
          <div
            className={activeTab === 'Thông tin' ? 'active tab' : 'tab'}
            onClick={() => this.changeTab('Thông tin')}
          >
            Thông tin
          </div>
          <div
            className={activeTab === 'Lịch sử đơn' ? 'active tab' : 'tab'}
            onClick={() => this.changeTab('Lịch sử đơn')}
          >
            Lịch sử đơn
          </div>
          <div
            className={activeTab === 'Xuất file PDF' ? 'active tab' : 'tab'}
            onClick={() => this.changeTab('Xuất file PDF')}
          >
            Xuất tệp PDF
          </div>
          <div>
            <h5 style={{ color: 'blue', fontFamily: 'cursive', position: 'absolute', right: '3px', top: '95px' }}>
              <span>Tường nhà của bạn</span>
            </h5>
          </div>
        </div>
        <div className='dateOverView'>
          <span style={{ color: 'blue' }}>
            {dateTime}
          </span>
        </div>
        {this.renderTabContent()}
      </Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    // permission: state.allReducer.permission
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    is_SearchFormHistoryProfile: (acttion_isSearchForm) => {
      dispatch(isSearchFormHistoryProfile(acttion_isSearchForm));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileForm);
