"""
A language server for the YARA pattern-matching language.

This implementation integrates with the 'yara-python' library to provide real-time feedback
for compilation errors and warnings for YARA rules
"""
import logging
import yara


def set_logger():
    """Create a logger to use as our 'root' logger"""
    logger = logging.getLogger(name="server")
    logger.setLevel(logging.DEBUG)
    return logger

def compile_rules(filepath, logger):
    """Compile YARA rules and report back with any errors"""
    try:
        errors = []
        rules = yara.compile(filepath=filepath)
    except yara.SyntaxError as errormsg:
        logger.error(errormsg)
        errors.append(errormsg)
        return errors


if __name__ == '__main__':
    BASELOGGER = set_logger()
    BASELOGGER.debug("Test debug statement")
    TESTPATH = "./examples/test.yara"
    errors = compile_rules(TESTPATH, BASELOGGER)
    for error in errors:
        print("Args: %s", error.args)
        print("Traceback: %s" % error.with_traceback(None))
        print("Error: %s", error)