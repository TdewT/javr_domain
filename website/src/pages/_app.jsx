import "@/src/styles/global.scss"
import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect} from "react";


function App({Component, pageProps}) {
    useEffect(() => {
        // noinspection JSFileReferences
        require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, []);

    return <Component {...pageProps} />;
}

export default App;