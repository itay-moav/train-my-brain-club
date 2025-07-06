import log from "./log";
import http,{ getApiRootUrl,responsePromiseChainHandler } from "./http";

export function exampleapi({content},setResponse,setError,setLoading){
    responsePromiseChainHandler(
        http.post("/save/score",{content}),
        response => {
            setResponse(response);
        },
        () => setError('Failed to generate code. Check console for error.'),
        () => setLoading(false)
    );
}