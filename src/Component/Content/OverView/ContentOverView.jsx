import React, { Component, Fragment } from 'react';

import { UpdateDateTime } from '../../UpdateDateTime';
import RequestListForm from './RequestListForm';
import axios from 'axios';
const getdataMember = () => axios.get('/getMember').then((res) => res.data)
const getdataItemsList = () => axios.get('/getItemsList').then((res) => res.data)
const getdataIntoWarehouse = () => axios.get('/getIntoWarehouse').then((res) => res.data)

class ContentOverView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'Ngày', // Tab mặc định được chọn ban đầu là 'Ngày'
      currentIndex: 0,
      dateTime: '',
      // activeSubTab: 'Nhập', // Tab con mặc định
      // canClick: true,
      // activeMenuInto: 'Đơn nhập chưa duyệt',
      // activeMenuExport: 'Đơn xuất chưa duyệt',
      // selectedComponent: null,
      // selectedComponentExport: null,
      totalDataMember: 0,
      totalDataItems: 0,
      totalIntoMoney: 0,
    };
    this._isMounted = false
  }


  updateDateTime() {
    const dateTime = UpdateDateTime();
    this.setState({ dateTime });
  }

  componentDidMount() {

    this._isMounted = true

    Promise.all([this.getData()]).then(() => {
      this.updateDateTime();

    });

  }
  getData = async () => {

    this._isMounted = true
    try {

      const [dataMember, dataItems, dataIntoWarehouse] = await Promise.all([
        getdataMember(),
        getdataItemsList(),
        getdataIntoWarehouse(),

      ]);


      if (dataMember) {

        if (this._isMounted) {

          this.setState({ totalDataMember: dataMember.rows.length })

        }
      }

      if (dataItems) {

        if (this._isMounted) {
          const dataFillter = dataItems.rows.filter((item) => item.itemsStatus === 'Đang sử dụng')
          this.setState({ totalDataItems: dataFillter.length })

        }
      }
      if (dataIntoWarehouse) {

        if (this._isMounted) {
          const totalIntoMoney = dataIntoWarehouse.rows
            .filter(item => item.intoMoney)
            .reduce((acc, item) => parseFloat(acc) + parseFloat(item.intoMoney), 0);

          this.setState({ totalIntoMoney: totalIntoMoney })

        }
      }

    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Error occurred while fetching data:", error);
    }




  }
  componentWillUnmount() {
    this._isMounted = false
    // this.setState({
    //   activeTab: 'Ngày',
    //   activeSubTab: 'Nhập',
    //   activeMenuInto: 'Đơn nhập chưa duyệt',
    //   activeMenuExport: 'Đơn xuất chưa duyệt',
    //   selectedComponent: null,
    //   selectedComponentExport: null,
    // })
    // clearInterval(this.interval);
  }

  showNetRowCurrent = () => {
    let rows = document.querySelectorAll('.table-add-row tbody tr');
    let currentIndex = 0;

    function showNextRow() {
      let currentRow = rows[currentIndex];
      currentRow.style.display = 'none';

      let tbody = currentRow.parentNode;
      let lastRow = tbody.lastElementChild;
      let nextSibling = lastRow.nextSibling;
      if (nextSibling) {
        tbody.insertBefore(currentRow, nextSibling);
      } else {
        tbody.appendChild(currentRow);
      }

      currentRow.style.display = 'table-row';

      currentIndex = (currentIndex + 1) % rows.length;
    }
    setInterval(showNextRow, 2000);
  };

  showNextRowDay = () => {
    this.interval = setInterval(this.showNextRow, 2000);
  };

  showNextRow = () => {
    let { currentIndex } = this.state;
    let rows = document.querySelectorAll('.table-add-row tbody tr');
    let currentRow = rows[currentIndex];
    currentRow.style.display = 'none';

    let tbody = currentRow.parentNode;
    let lastRow = tbody.lastElementChild;
    let nextSibling = lastRow.nextSibling;
    if (nextSibling) {
      tbody.insertBefore(currentRow, nextSibling);
    } else {
      tbody.appendChild(currentRow);
    }

    currentRow.style.display = 'table-row';

    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex + 1) % rows.length,
    }));
  };

  changeTab = (tabName) => {
    this.setState({ activeTab: tabName });
  };


  renderTabContent = () => {
    const { activeTab } = this.state;

    switch (activeTab) {
      case 'Ngày':
        return this.renderDayTab();
      case 'Tuần':
        return this.renderWeekTab();
      case 'Tháng':
        return this.renderMonthTab();
      case 'Năm':
        return this.renderYearTab();
      default:
        return null;
    }
  };



  // format date
  formatDateTime = (dateTimeStr) => {
    // Tách ngày và giờ từ chuỗi
    if (!dateTimeStr) {
      // Nếu dateTimeStr là null hoặc undefined, trả về null
      return null;
    }
    let [datePart, timePart] = dateTimeStr.split(' - ');

    // Tách ngày, tháng, năm
    let [day, month, year] = datePart.split('/').map(Number);

    // Tách giờ, phút và AM/PM
    let [time, period] = timePart.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    // Điều chỉnh giờ theo AM/PM
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Tạo đối tượng Date
    return new Date(year, month - 1, day, hours, minutes);
  }


  // renderDayTab = () => {
  //   const currentDate = new Date()
  //   const dayFormat = UpdateDateTime(currentDate) // format
  //   const currentDay = this.formatDateTime(dayFormat) // current
  //   return this.isShowForm(currentDate, currentDay);
  // };

  // renderWeekTab = () => {
  //   const date = new Date()
  //   const sevenDaysAgo = new Date(date); // Tạo một bản sao của ngày hiện tại
  //   sevenDaysAgo.setDate(date.getDate() - 7); // Lùi ngày hiện tại về 7 ngày

  //   const weekdayFormat = UpdateDateTime(sevenDaysAgo) //fomat 
  //   const dayFormat = UpdateDateTime(date) // format

  //   const currentDay = this.formatDateTime(dayFormat) // current
  //   const currentDate = this.formatDateTime(weekdayFormat)// current
  //   // const weekdayCurent = this.formatDateTime(weekdayFormat) //current
  //   return this.isShowForm(currentDate, currentDay);
  // };

  // renderMonthTab = () => {
  //   const date = new Date()
  //   const sevenDaysAgo = new Date(date); // Tạo một bản sao của ngày hiện tại
  //   sevenDaysAgo.setDate(date.getDate() - 30); // Lùi ngày hiện tại về 7 ngày

  //   const monthDayFormat = UpdateDateTime(sevenDaysAgo) //fomat 
  //   const dayFormat = UpdateDateTime(date) // format

  //   const currentDay = this.formatDateTime(dayFormat) // current
  //   const currentDate = this.formatDateTime(monthDayFormat)// current
  //   return this.isShowForm(currentDate, currentDay);
  // };

  // renderYearTab = () => {
  //   const date = new Date()
  //   const sevenDaysAgo = new Date(date); // Tạo một bản sao của ngày hiện tại
  //   sevenDaysAgo.setDate(date.getDate() - 365); // Lùi ngày hiện tại về 7 ngày

  //   const yeardayFormat = UpdateDateTime(sevenDaysAgo) //fomat 
  //   const dayFormat = UpdateDateTime(date) // format

  //   const currentDay = this.formatDateTime(dayFormat) // current
  //   const currentDate = this.formatDateTime(yeardayFormat)// current
  //   return this.isShowForm(currentDate, currentDay);
  // };

  renderDayTab = () => {
    const currentDate = new Date();
    const dayFormat = UpdateDateTime(currentDate);
    const currentDay = this.formatDateTime(dayFormat);
    return this.isShowForm(currentDate, currentDay);
  };

  renderWeekTab = () => {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(date);
    monday.setDate(date.getDate() - distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekdayFormat = UpdateDateTime(monday);
    const dayFormat = UpdateDateTime(sunday);

    const currentDay = this.formatDateTime(dayFormat);
    const currentDate = this.formatDateTime(weekdayFormat);
    return this.isShowForm(currentDate, currentDay);
  };

  renderMonthTab = () => {
    const date = new Date();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthDayFormat = UpdateDateTime(firstDayOfMonth);
    const dayFormat = UpdateDateTime(lastDayOfMonth);

    const currentDay = this.formatDateTime(dayFormat);
    const currentDate = this.formatDateTime(monthDayFormat);
    return this.isShowForm(currentDate, currentDay);
  };

  renderYearTab = () => {
    const date = new Date();
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(date.getFullYear(), 11, 31);

    const yeardayFormat = UpdateDateTime(firstDayOfYear);
    const dayFormat = UpdateDateTime(lastDayOfYear);

    const currentDay = this.formatDateTime(dayFormat);
    const currentDate = this.formatDateTime(yeardayFormat);
    return this.isShowForm(currentDate, currentDay);
  };


  isShowForm = (currentDate, currentDay) => {

    // const { imageProfile,  } = this.props || './images/profile.jpg';
    const { tokenObj } = this.props || [];
    const { totalDataMember, totalDataItems, totalIntoMoney } = this.state;
    // const { activeSubTab } = this.state;

    // const sevenDaysAgo = new Date(currentDate); // Tạo một bản sao của ngày hiện tại
    //  sevenDaysAgo.setDate(currentDate.getDate() + 8); // Lùi ngày hiện tại về 7 ngày



    return (
      <>
        <ul className="box-info">
          <li>
            <i className="bx bxs-calendar-check" />
            <span className="text">
              <h3>{totalDataItems.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
              <p title='mặt hàng đang sử dụng trong kho'>Tổng mặt hàng</p>
            </span>
          </li>
          <li>
            <i className="bx bxs-group" />
            <span className="text">
              <h3>{totalDataMember.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
              <p>Tổng Thành viên</p>
            </span>
          </li>
          <li>
            <i className="bx bxs-dollar-circle" />
            <span className="text">
              <h3>{totalIntoMoney.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
              <p>Tổng tiền thu mua</p>
            </span>
          </li>
        </ul>


        {/* 
        <div className="table-data">
          <div className="order">
            <div className="head">
              <h3>Đơn yêu cầu</h3>
           


            </div>
            <div className="table-add-row overView-table">
              <table>
                <thead>
                  <tr>
                    <th>Tên hàng</th>
                    <th>Đơn giá (VND)</th>
                    <th>Số lượng</th>
                    <th>Thành tiền (VND)</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <p>hàng 1</p>
                    </td>
                    <td>20.000</td>
                    <td>50</td>
                    <td>100000</td>
                    <td>01-10-2021</td>
                    <td>
                      <span className="status completed">Đã duyệt</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>hàng 1</p>
                    </td>
                    <td>20.000</td>
                    <td>40</td>
                    <td>80000</td>
                    <td>01-10-2021</td>
                    <td>
                      <span className="status process">Chờ duyệt</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>hàng 2</p>
                    </td>
                    <td>20.000</td>
                    <td>30</td>
                    <td>60000</td>
                    <td>01-10-2021</td>
                    <td>
                      <span className="status pending">Từ chối</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p>hàng 3</p>
                    </td>
                    <td>10.000</td>
                    <td>10</td>
                    <td>20000</td>
                    <td>01-10-2021</td>
                    <td>
                      <span className="status completed">Đã duyệt</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="todo">
            <div className="head">
              <h3>Đơn</h3>
              <i className="bx bx-plus" />
              <i className="bx bx-filter" />
            </div>

            <div className="overview">
              <table>
                <thead>
                  <tr>
                    <th>Đơn</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><p>Đơn chưa duyệt</p></td>
                    <td>2</td>
                  </tr>
                  <tr>
                    <td><p>Đơn đã duyệt</p></td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td><p>Đơn từ chối</p></td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td><p>Đơn nhập</p></td>
                    <td>7</td>
                  </tr>
                  <tr>
                    <td><p>Đơn xuất</p></td>
                    <td>2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div> */}

        <RequestListForm currentDay={currentDay} currentDate={currentDate} tokenObj={tokenObj} />
      </>
    );
  };

  render() {
    const { activeTab, dateTime } = this.state;

    return (
      <Fragment>
        <div className="tabsOverView">
          <div
            className={activeTab === 'Ngày' ? 'active tab' : 'tab'}
            onClick={() => this.changeTab('Ngày')}
          >
            Ngày
          </div>
          <div
            className={activeTab === 'Tuần' ? 'active tab' : 'tab'}
            onClick={() => this.changeTab('Tuần')}
          >
            Tuần
          </div>
          <div
            className={activeTab === 'Tháng' ? 'active tab' : 'tab'}
            onClick={() => this.changeTab('Tháng')}
          >
            Tháng
          </div>
          <div
            className={activeTab === 'Năm' ? 'active tab' : 'tab'}
            onClick={() => this.changeTab('Năm')}
          >
            Năm
          </div>
        </div>

        <div className='dateOverView'>
          {dateTime}
        </div>
        {this.renderTabContent()}
      </Fragment>
    );
  }
}


export default ContentOverView;
