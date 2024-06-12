import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const withScrollToTop = (WrappedComponent) => {
  const WithScrollToTop = (props) => {
    const location = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);

    return <WrappedComponent {...props} />;
  };

  return WithScrollToTop;
};

export default withScrollToTop;
