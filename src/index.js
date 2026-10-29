import React from "react";
import ReactDOM from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import "./styles/styles.scss";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./containers/App";
import * as serviceWorker from "./serviceWorker";
import IntlProviderWrapper from "./hoc/IntlProviderWrapper";

import { Provider } from "react-redux";
import reduxStore, { persistor } from "./redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

const renderApp = () => {
  ReactDOM.render(
    <Provider store={reduxStore}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <IntlProviderWrapper>
          <App persistor={persistor} />
        </IntlProviderWrapper>
      </GoogleOAuthProvider>
    </Provider>,
    document.getElementById("root")
  );
};

renderApp();
serviceWorker.unregister();
// Trigger dev rebuild for socket config updates

