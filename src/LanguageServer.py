"""
A language server for the YARA pattern-matching language.

This implementation integrates with the 'yara-python' library to provide real-time feedback
for compilation errors and warnings for YARA rules
"""
import logging
import yara

logging.basicConfig(format="%(message)s", level=logging.DEBUG)

# Bases many function/variable names on
# https://github.com/Microsoft/vscode-languageserver-node-example/blob/master/server/src/server.ts
class Protocol(object):
    '''
    The Language Server protocol is used between a tool (the client) and
        a language smartness provider (the server) to integrate features like
        auto complete, goto definition, find all references and alike into the tool
    '''
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def onDidOpenTextDocument(self, uri, text):
        '''
        A text document got opened in VSCode.
        Input
            uri: uniquely identifies the document. For documents store on disk this is a file URI.
            text: the initial full content of the document.
        '''
        self.logger.debug("onDidOpenTextDocument")

    def onDidCloseTextDocument(self, uri):
        '''
        A text document got closed in VSCode.
        Input
    	    uri: uniquely identifies the document.
        '''
        self.logger.debug("onDidCloseTextDocument")

    def onDidChangeTextDocument(self, uri, contentChanges):
        '''
        The content of a text document changed in VSCode.
        Input
            uri: uniquely identifies the document.
	        contentChanges: describe the content changes to the document.
        '''
        self.logger.debug("onDidChangeTextDocument")

    def publishDiagnostics(self):
        '''
        The server identifies errors/warnings and notifies the client
        '''
        self.logger.debug("publishDiagnostics")


def compile_rules(filepath):
    """Compile YARA rules and report back with any errors"""
    try:
        error_msgs = []
        yara.compile(filepath=filepath)
        return None
    except yara.SyntaxError as errormsg:
        logging.error(errormsg)
        error_msgs.append(errormsg)
        return error_msgs

if __name__ == '__main__':
    TESTPATH = "../examples/test.yara"
    errors = compile_rules(TESTPATH)
    for error in errors:
        print("Args: %s", error.args)
        print("Traceback: %s" % error.with_traceback(None))
        print("Error: %s", error)
