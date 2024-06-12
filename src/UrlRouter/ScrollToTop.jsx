import { useEffect } from "react";
import { useLocation, BrowserRouter as Router } from "react-router-dom";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        document.documentElement.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }, [pathname]);

    return null;
}

export default function withScrollToTop(Component) {
    return function WithScrollToTop(props) {
        return (
            <Router>
                <ScrollToTop />
                <Component {...props} />
            </Router>
        );
    };
}
