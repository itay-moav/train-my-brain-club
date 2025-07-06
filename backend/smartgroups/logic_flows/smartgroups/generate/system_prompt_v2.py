import os
import logging

from .examples import examples_list
_logger = logging.getLogger("AKELAS")
script_dir = os.path.dirname(__file__)            # '/var/task/soob1'

def construct_system_prompt() -> dict:
    """
    Combine all the pieces into one big string
    """
    _logger.debug(f"About to open {os.path.join(script_dir, "system_prompt_v2.md")}")
    with open(os.path.join(script_dir, "system_prompt_v2.md"), "r", encoding="utf-8") as fa:
        template_prompt = fa.read()

    _logger.debug(f"About to open {os.path.join(script_dir, "smartgroups-context-file-lib.php")}")
    with open(os.path.join(script_dir, "smartgroups-context-file-lib.php"), "r", encoding="utf-8") as fb:
        smrtgroups_lib = fb.read()

    _logger.debug(f"About to open {os.path.join(script_dir, "smartgroups-context-file-lms.php")}")
    with open(os.path.join(script_dir, "smartgroups-context-file-lms.php"), "r", encoding="utf-8") as fc:
        lms_lib = fc.read()

    examples_as_string = "".join(
        f"<example><human>{h}</human><codeGenerated>{c}</codeGenerated></example>"
        for h, c in examples_list
    )

    # return parts to be combined in the invoke
    return {
        "system_prompt_template": template_prompt,
        "lib": smrtgroups_lib,
        "lmsLib": lms_lib,
        "examples": examples_as_string,
    }
