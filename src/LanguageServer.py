'''
A language server for the YARA pattern-matching language.

This implementation integrates with the 'yara-python' library to provide real-time feedback
for compilation errors and warnings for YARA rules

https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
'''
import logging
import json
import yara

logging.basicConfig(format="%(message)s", level=logging.DEBUG)

# To ensure that both client and server split the string into the same line representation
EOL = ["\n", "\r", "\r\n"]

class Command(object):
    '''
    Represents a reference to a command
    Provides a title which will be used to represent a command in the UI
    Commands are identitifed using a string identifier and the protocol
        currently doesn't specify a set of well known commands
    So executing a command requires some tool extension code
    Input
        title: Title of the command (e.g. save)
        command: The identifier of the actual command handler
        arguments: Arguments that the command handler should be invoked with
    '''
    def __init__(self, title, command, arguments=None):
        self.title = title
        self.command = command
        self.arguments = arguments

class Diagnostic(object):
    '''
    Represents a diagnostic, such as a compiler error or warning.
    Diagnostic objects are only valid in the scope of a resource.
    Input
        msg_range: The range at which the message applies
        message: The diagnostic's message
        severity: The diagnostic's severity. If omitted, it is up to the client to interpret diagnostics as error, warning, info or hint
        code: The diagnostic's code
        source: A human-readable string describing the source of this diagnostic (e.g. 'typescript' or 'super lint')
    '''
    def __init__(self, msg_range, message, severity=None, code=None, source=None):
        self.range = msg_range
        self.message = message
        self.severity = severity
        self.code = code
        self.source = source

class DiagnosticSeverity(object):
    '''
    Report message severities
    '''
    Error = 1
    Warning = 2
    Information = 3
    Hint = 4

class Location(object):
    '''
    Represents a location inside a resource, such as a line inside a text file
    Input
        uri: Uniquely identifies the document. For documents store on disk this is a file URI
        doc_range: Range in a text document; comparable to an editor selection
    '''
    def __init__(self, uri, doc_range):
        self.uri = uri
        self.range = doc_range

class Position(object):
    '''
    Position in a text document expressed as zero-based line and character offset
    A position is between two characters like an 'insert' cursor in a editor
    Input
        line: Line position in a document (zero-based)
        character: Character offset on a line in a document (zero-based)
    '''
    def __init__(self, line, character):
        self.line = line
        self.character = character

class Range(object):
    '''
    A range in a text document expressed as (zero-based) start and end positions
    A range is comparable to a selection in an editor. Therefore the end position is exclusive
    Input
        start: Start position
        end: End position
    '''
    def __init__(self, start, end):
        self.start = start
        self.end = end

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
        A text document got opened in VSCode
        Input
            uri: uniquely identifies the document. For documents store on disk this is a file URI
            text: the initial full content of the document
        '''
        self.logger.debug("onDidOpenTextDocument")

    def onDidCloseTextDocument(self, uri):
        '''
        A text document got closed in VSCode
        Input
    	    uri: uniquely identifies the document
        '''
        self.logger.debug("onDidCloseTextDocument")

    def onDidChangeTextDocument(self, uri, contentChanges):
        '''
        The content of a text document changed in VSCode
        Input
            uri: uniquely identifies the document
	        contentChanges: describe the content changes to the document
        '''
        self.logger.debug("onDidChangeTextDocument")

    def publishDiagnostics(self):
        '''
        The server identifies errors/warnings and notifies the client
        '''
        self.logger.debug("publishDiagnostics")
        diagnostics = {"errors": 0, "warnings": 0}
        return diagnostics


