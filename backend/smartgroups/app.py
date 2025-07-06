import json
import logging
import traceback

from services.srvLoggers import init as init_logger
init_logger(name="AKELAS")

# import requests
from logic_flows.smartgroups.generate import chain

_logger = logging.getLogger("AKELAS")

headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        "Content-Type": "application/json",
}


def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict

        Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """

    # try:
    #     ip = requests.get("http://checkip.amazonaws.com/")
    # except requests.RequestException as e:
    #     # Send some context about this error to Lambda Logs
    #     print(e)

    #     raise e
    _logger.debug("STARTING AKELAS!\n\n")
    _logger.debug(event.get('httpMethod'))
    _logger.debug(event.get('resource'))
    _logger.debug("BODY:")
    _logger.debug(event.get("body"))
    _logger.debug("EOF request")
    
    
    # ------ OPTIONS (all of them) ------
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps("Preflight OK"),
        }

    # ------ PING ------
    if event.get("resource") == "/smartgroups/ping":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": "pong",
        }        

    # ------ GENERATE A SMART GROUP ------
    if event.get("resource") == "/smartgroups/generate" and event.get('httpMethod') == "POST":        

        try:
            _logger.debug("CALL INVOKE")
            user_instruction_prompt = json.loads(event.get("body"))
            _logger.debug("CALL INVOKE - next")
            res=chain.invoke(user_instruction=user_instruction_prompt.get("content"))
            _logger.debug("I AM BACK IN APP")
            _logger.debug(res)
            _logger.debug("just CONTENT now")
            _logger.debug(res.content)
            
        except Exception as e:
            _logger.fatal(e)
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"error": str(e), "trace": traceback.format_exc()}),
            }    
        else:
            _logger.debug("ABOUT TO RETURN NOW")
            _logger.debug({
                "statusCode": 200,
                "headers": headers,
                "body": res.content,
            })
            
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"content": res.content}),
            }
    
    # ------ FIN ------

    return {
        "statusCode": 404,
        "headers": headers,
        "body": "Wut u try do to?!",
    }
