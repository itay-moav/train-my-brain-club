import logging
import sys

from config import conf_logger


def init(name):
    """
    Decides which logger to use and sets it
    """
    c = conf_logger()
    log_level = logging.getLevelNamesMapping()[c["LOGGER_LEVEL"]]
    logger = logging.getLogger(name)
    logger.setLevel(level=log_level)

    match c["LOGGER_HANDLER"]:
        case "stdout":
            set_stdout_logger(logger)
        case _:
            set_stdout_logger(logger)

    logger.info(f"Logger {c['LOGGER_HANDLER']} is set and ready, here we go.")


def set_stdout_logger(logger: logging.Logger):
    """
    Simplest stdout capture all log.
    To be used in dev and on prod to be seen under journalctl
    """
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_stdout_formatter())
    logger.addHandler(handler)


def _stdout_formatter() -> logging.Formatter:
    """
    StdOUT FORMATTER
    """
    # Define the ANSI escape codes for bold text
    BOLD = "\033[1m"
    RESET = "\033[0m"
    formatter = logging.Formatter(
        f"{BOLD}%(asctime)s::%(name)s::%(levelname)s{RESET}> %(message)s",
        datefmt="%Y-%m-%d %H:%M",
    )
    return formatter
