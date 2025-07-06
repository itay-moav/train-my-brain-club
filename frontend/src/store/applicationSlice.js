/**
 * This file is for application level data and application level UI.
 * Examples:
 *   general UI events like a click of a mouse happened somewhere.
 *                          Dark mode vs Light mode 
 *      state member wil start with `ui`
 *   General application data like User prefered settings
 *                                 app status (initialized or not)
 *      state member will start with `app`
 */

import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import http from "../services/http";
import log from "../services/log";
// ---------------------------------------------------------------- API / THUNKS -------------------------------------------------------

//Generic appInit call
export const appInit = createAsyncThunk('application/init', async () => {
    log.debug('START application/init');
    
    // Check local storage for user data
    const storedUserData = localStorage.getItem('trainMyBrainUser');
    let userData = null;
    
    if (storedUserData) {
        try {
            userData = JSON.parse(storedUserData);
            log.debug('Found returning user data in local storage', userData);
        } catch (error) {
            log.error('Failed to parse user data from local storage', error);
        }
    }
    
    const {data} = await http.get("/appinit");
    log.debug('END application/init done with',data);
    
    // Return both API data and local storage data
    return { ...data, userData };
});

// ---------------------------------------------------------------- CONFIGURE SLICE ----------------------------------------------------

const initialState = {
    appInitialized: false,
    user: {
        isReturningUser: false,
        performance: null,
        lastVisit: null
    }
};


/**
 * SLICE
 */
const ApplicationSlice = createSlice({
    name: "application",
    initialState,
    reducers: {
    },
    
    //handlers/reducers for the Thunks/api calls
    extraReducers(builder) {
        builder
        /**
         * App init mark complete
         */
        .addCase(appInit.fulfilled, (state, action) => {
            state.appInitialized = true;
            
            // Process user data if found in local storage
            if (action.payload.userData) {
                state.user.isReturningUser = true;
                state.user.performance = action.payload.userData.performance || null;
                state.user.lastVisit = action.payload.userData.lastVisit || new Date().toISOString();
                
                // TODO: Process user performance data to determine game selection
            } else {
                // New user
                state.user.isReturningUser = false;
                state.user.lastVisit = new Date().toISOString();
            }
            
            // Store updated user data in localStorage
            localStorage.setItem('trainMyBrainUser', JSON.stringify(state.user));
        })
    }


  });
  
  export default ApplicationSlice.reducer;
  export const ApplicationActions = {...ApplicationSlice.actions};
  





// ---------------------------------------------------------------- SELECTORS -------------------------------------------------------
export const isAppInitialized = () => {
    return state => {
        return state.application.appInitialized;
    }
}

export const isReturningUser = () => {
    return state => {
        return state.application.user.isReturningUser;
    }
}

export const getUserPerformance = () => {
    return state => {
        return state.application.user.performance;
    }
}

export const getLastVisit = () => {
    return state => {
        return state.application.user.lastVisit;
    }
}
