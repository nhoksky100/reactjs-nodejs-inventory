import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InternetStatusChecker } from './Connect/InternetStatusChecker';
import RouterUrl from './UrlRouter/RouterUrl';

class App extends Component {
  render() {
   
    return (
      <div>
        <InternetStatusChecker />
        <RouterUrl />
        <ToastContainer />
      </div>
    );
  }
}

export default App;
