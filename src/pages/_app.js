import "@/styles/globals.css";
import {Bounce, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function App({Component, pageProps}) {
    return <><Component {...pageProps} />
        <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            closeOnClick
            draggable
            theme="dark"
            transition={Bounce}
        />
    </>;
}
