export const environ = {
    logHandler: import.meta.env.VITE_APP_LOG_HANDLER,
    logLevel: import.meta.env.VITE_APP_LOG_LEVEL,
    apiRootUrl:import.meta.env.VITE_APP_API_ENDPOINT,
    //authTokenKeyName: import.meta.env.VITE_APP_AUTH_TOKEN_NAME,
    //authOauthLogoutUrl: import.meta.env.VITE_APP_OAUTH_LOGOUT_URL,
    rootUrl: "/akelas" // I suspect this comes empty sometimes -> import.meta.env.BASE_URL
}

export const promptConfig = {
    minPromptSizeToSubmit: 2
}