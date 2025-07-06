import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import { setAppApiRootUrl,setErrorHandler } from "./services/http";
import { environ } from './utilities/config.js';
import log  from "./services/log.js";
import { store } from './store/store';
import App from './App.jsx'

import "./furia.css";

//setup
log.init.setLogHandler(environ.logHandler);
log.init.setLogLevel(environ.logLevel);
setAppApiRootUrl(environ.apiRootUrl);

//Launch the UI
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </Provider>
  ,
);//EOF render(
