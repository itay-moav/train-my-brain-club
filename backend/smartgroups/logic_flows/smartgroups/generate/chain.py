import logging

from botocore.config import Config
from langchain_core.messages import BaseMessage
from langchain.prompts.chat import ChatPromptTemplate
from langchain_aws import ChatBedrockConverse

from .system_prompt_v2 import construct_system_prompt


_logger = logging.getLogger("AKELAS")


def invoke(user_instruction: str, ticket_name: str="")->BaseMessage:
    """
    Loads system prompt and all the context needed to
    generate a SmartGroup
    """
    # 1. Build a botocore Config with 15 min read & connect timeouts
    timeout_seconds = 900  # 15 minutes
    boto_cfg = Config(
        read_timeout=timeout_seconds,
        connect_timeout=timeout_seconds,
    )
    _logger.debug("START INIT LLM")
    llm = ChatBedrockConverse(
        #credentials_profile_name="lmsuser",
        model_id="us.anthropic.claude-3-7-sonnet-20250219-v1:0", #"us.anthropic.claude-opus-4-20250514-v1:0",
        region_name="us-east-1",
        temperature=0.2,
        max_tokens=4096,
        config=boto_cfg,
    )
    _logger.debug("FINISHED INIT LLM")
    system_prompt_parts = construct_system_prompt()
    _logger.debug("SYSTEM PROMPT PARTS:\n")
    _logger.debug(system_prompt_parts)
    messages = [
        ("system", system_prompt_parts["system_prompt_template"]),
        ("human", "{input}"),
    ]
    prompt = ChatPromptTemplate.from_messages(messages=messages)
    chain = prompt | llm
    _logger.debug("ABOUT TO INVOKE LLM\n")
    res = chain.invoke(          
        input={
            "type": "human",
            "input": user_instruction,
            "lib":  system_prompt_parts["lib"], # I take this approach as PHP has {} and it is easier to escape like so
            "lmsLib": system_prompt_parts["lmsLib"],
            "examples": system_prompt_parts["examples"],
        },
    )
    _logger.debug("OUTPUT FROM LLM:\n\n")
    _logger.debug(res)
    _logger.debug("\n\n")
    return res
