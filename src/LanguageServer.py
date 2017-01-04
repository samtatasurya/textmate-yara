"""
A language server for the YARA pattern-matching language.

This implementation integrates with the 'yara-python' library to provide real-time feedback
for compilation errors and warnings for YARA rules
"""
import logging
import yara

logging.basicConfig(format="%(message)s", level=logging.DEBUG)

def compile_rules(filepath):
    """Compile YARA rules and report back with any errors"""
    try:
        error_msgs = []
        yara.compile(filepath=filepath)
        return None
    except yara.SyntaxError as errormsg:
        logging.error(errormsg)
        error_msgs.append(errormsg)
    finally:
        return error_msgs

if __name__ == '__main__':
    TESTPATH = "../examples/test.yara"
    errors = compile_rules(TESTPATH)
    for error in errors:
        print("Args: %s", error.args)
        print("Traceback: %s" % error.with_traceback(None))
        print("Error: %s", error)
