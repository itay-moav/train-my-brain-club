import axios from "axios";
import log from "./log";

//Set this up on init if u want some actions done on 401/403 responses
export const errorResponseHandler = {};
export const setErrorHandler = (httpCode,i_handler) => errorResponseHandler[httpCode] = i_handler;

axios.defaults.timeout = 900000;  

axios.interceptors.response.use(null, error => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status <= 500;

  if (!expectedError) {
    log.error('Axios response error',error);
    throw new Error(error);
  }

  //-------------------------------------------------------------------------------
  // According to http code, if a handler is found, call it.
  // Mostly handlers are set in main.js, but they can be set anywhere
  // and they can be switched.
  // 
  // This will always return a rejected promise.
  //-------------------------------------------------------------------------------
  if(error && error.response && error.response.status){//not authorized - login out
    console.error("HTTP module error:",error.response);
    const errorResponseStatus = error.response.status;//normlize to string
    if(errorResponseHandler[errorResponseStatus]){
      errorResponseHandler[errorResponseStatus]();//call specific error handler
    }
  }
  return Promise.reject(error);
});

function setJwt(jwt) {
  axios.defaults.headers.common["x-auth-token"] = jwt;
}

export function setAppApiRootUrl(app_url) {
  axios.defaults.baseURL = app_url;
  log.debug("APP api root url: ", axios.defaults.baseURL);
}

export function getApiRootUrl(){
  return axios.defaults.baseURL;
}

 const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
  setJwt
};

export default http;

/**
 * Wrapps a response from a TalisAPI call and check it is not an internal PHP error, which does not reflect as 500
 * @param {*} response 
 * @param {*} callback 
 */
export function fastApiWrapper(response,callback){
  log.debug("Response from FastAPI:",response);

  //TODO HEre u can add special status handlers (like 500, 404, 403 etc)
  if(!response.status || response.status>299 || response.status<200){
    console.error('fastApiWrapper error',response);
    throw new Error(response);    
  }

  return callback(response);
}

/**
 * Wraps an API call with all error handling functionality
 * 
 * @param {*} myPromise 
 * @param {*} successCallback 
 * @param {*} errorCallback 
 */
export function responsePromiseChainHandler(myPromise,successCallback,errorCallback,finallyCallback=null){
  if(finallyCallback){
    myPromise.then(response=>fastApiWrapper(response,successCallback)).catch(errorCallback).finally(finallyCallback);
  } else {
    myPromise.then(response=>fastApiWrapper(response,successCallback)).catch(errorCallback);
  }
}
