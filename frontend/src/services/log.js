import http from "./http";

//TODO let logBuffer = [];
let logFunction = NaN;

const LEVEL = {
  DEBUG: 0,
  INFO:  1,
  WARNING: 2,
  ERROR: 3,
  FATAL: 4
};

const HANDLER = {
  CONSOLE: (...someMixedValues) => {
    console.log(...someMixedValues);
  },
  /*     TODO
  TALIS:  (...someMixedValues) => {
    http.post('/log/message',someMixedValues);
  }*/
  /* ,   TODO
  TALIS_BUFFERED:  (...someMixedValues) => {
    logBuffer.push(someMixedValues);
    if(logBuffer.length > 10){
      http.post('/log/message',{logEntries:logBuffer});
      logBuffer = [];
    }
  },*/
  /*     TODO
  LAMBDA:  (...someMixedValues) => {
    console.log(...someMixedValues);
  }*/
};

function setLogLevel(log_level){
  localStorage.setItem('bhDebugLevel',log_level);
}

function setLogHandler(logHandler){
  console.log('Setup log function',logHandler);
  logFunction = HANDLER[logHandler];
}

/*TODO
function flushBuffer(){
  if(logBuffer.length>0){
     http.post('/log/message',{logEntries:logBuffer});
  }
  logBuffer = [];
}
*/
/**
 * Either going by log level, or in case emergency flag, log EVERYTHING to console.
 */
function logger(message_log_level,...someMixedValues) {
  const debugMode = localStorage.getItem('bhDebugMode');
  if(debugMode && debugMode === 'cef8d978-169e-4759-bddf-18b06007f11e'){
      console.log(...someMixedValues);
  } else {
      const env_log_level = localStorage.getItem('bhDebugLevel');
      if(env_log_level <= message_log_level){
        try{
          logFunction(...someMixedValues);
        } catch(error){
          console.fatal("We had an issue using the log module. Writing to console.");
          console.log(...someMixedValues);
        }
      }
  }
}

function debug(...someMixedValues){
  logger(LEVEL.DEBUG,...someMixedValues);
}

function info(...someMixedValues){
  logger(LEVEL.INFO,...someMixedValues);
}

function warning(...someMixedValues){
  logger(LEVEL.WARNING,...someMixedValues);
}

function error(...someMixedValues){
  logger(LEVEL.ERROR,...someMixedValues);
}

function fatal(...someMixedValues){
  logger(LEVEL.FATAL,...someMixedValues);
}

const log = {
  LEVEL,
  HANDLER,
  init:{
    setLogHandler,
    setLogLevel        
  },
  //TODO flushBuffer,
  debug,
  info,
  warning,
  error,
  fatal
};

export default log;
