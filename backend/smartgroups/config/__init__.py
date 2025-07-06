def get_app_name() -> str:
    return "Akelas LMS coding assistant"


def get_version() -> str:
    """
    Notice frontend maintains it's own version.
    We do not load the version in the appinit to the front end.
    This is for 2 reasons:
    1. I want to see the previous version files are not cached
    2. Frontend version might diverge from backend in the future.
    JUST BE DISCIPLINED!
    """
    return "v0.1.0"

def conf_logger() -> dict:
    """
    Logger configuration values
    read by the srvLoggers package
    For the sake of simplicity I have values for all possible logger types
    just leave unused logger type values empty
    """
    return {
        "LOGGER_LEVEL": "DEBUG",
        "LOGGER_HANDLER": "stdout",
    }
