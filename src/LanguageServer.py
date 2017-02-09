'''
A language server for Visual Studio Code

https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md

Bases many function/variable names on
https://github.com/Microsoft/vscode-languageserver-node-example/blob/master/server/src/server.ts
'''
import logging
import json
import queue

logging.getLogger(__name__).addHandler(logging.NullHandler())
logging.basicConfig(format="%(message)s", level=logging.DEBUG)

# To ensure that both client and server split the string into the same line representation
EOL = ["\n", "\r", "\r\n"]

class ClientCapabilities(object):
    '''
    Define capabilities for dynamic registration, workspace and text document features the client supports
    The experimental can be used to pass experimential capabilities under development
    Input
        (WorkspaceClientCapabilites) workspace: Optional. Workspace specific client capabilities
        (TextDocumentClientCapabilities) textDocument: Optional. Text document specific client capabilities
        (any) experimental: Optional. Experimental client capabilities
    '''
    def __init__(self, workspace=None, textDocument=None, experimental=None):
        self.experimental = experimental
        self.workspace = workspace
        self.textDocument = textDocument

class Command(object):
    '''
    Represents a reference to a command
    Provides a title which will be used to represent a command in the UI
    Commands are identitifed using a string identifier and the protocol
        currently doesn't specify a set of well known commands
    So executing a command requires some tool extension code
    Input
        (string) title: Title of the command (e.g. save)
        (string) command: The identifier of the actual command handler
        (list) arguments: Optional. Arguments that the command handler should be invoked with
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
        (Range) msg_range: The range at which the message applies
        (string) message: The diagnostic's message
        (int) severity: Optional. The diagnostic's severity.
            If omitted, it is up to the client to interpret diagnostics as error, warning, info or hint
        (int|string) code: Optional. The diagnostic's code
        (string) source: Optional. A human-readable string describing the source of this diagnostic (e.g. 'typescript' or 'super lint')
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

class DocumentFilter(object):
    '''
    Denotes a document through properties like language, schema or pattern
        (e.g. a filter that applies to TypeScript files on disk or a filter the applies to JSON files with name package.json)
        Example 1: { language: 'typescript', scheme: 'file' }
        Example 2: { language: 'json', pattern: '**/package.json' }
    Input
        (string) language: Optional. A language id, like `typescript`
        (string) scheme: Optional. A Uri [scheme](#Uri.scheme), like `file` or `untitled`
        (string) pattern: Optional. A glob pattern, like `*.{ts,js}`
    '''
    def __init__(self, language=None, scheme=None, pattern=None):
        self.language = language
        self.scheme = scheme
        self.pattern = pattern

class DocumentSelector(list):
    '''
    The combination of one or many document filters
    Input
        (list) documents: One or more DocumentFilters
    '''
    def __init__(self, documents):
        super(DocumentSelector, self).__init__(documents)

class InitializeParams(object):
    '''
    Required parameters for the first request between the client and server
    Input
        (int|None) processId: The process Id of the parent process that started the server
            Is null if the process has not been started by another process
            If the parent process is not alive then the server should exit (see exit notification) its process
        (string|None) rootPath: The rootPath of the workspace. Is null if no folder is open. Deprecated in favour of rootUri
        (string|None) rootUri: The rootUri of the workspace. Is null if no folder is open
        (ClientCapabilities) capabilities: The capabilities provided by the client (editor or tool)
        (any) initializationOptions: Optional. User provided initialization options
        (string) trace: Optional. The initial trace setting. If omitted trace is disabled ('off')
    '''
    def __init__(self, processId, rootUri, capabilities, initializationOptions=None, trace="off"):
        self.processId = processId
        self.rootUri = rootUri
        self.initializationOptions = initializationOptions
        self.capabilities = capabilities
        self.trace = trace

class Location(object):
    '''
    Represents a location inside a resource, such as a line inside a text file
    Input
        (string) uri: Uniquely identifies the document. For documents store on disk this is a file URI
        (Range) doc_range: Range in a text document; comparable to an editor selection
    '''
    def __init__(self, uri, doc_range):
        self.uri = uri
        self.range = doc_range

class Position(object):
    '''
    Position in a text document expressed as zero-based line and character offset
    A position is between two characters like an 'insert' cursor in a editor
    Input
        (int) line: Line position in a document (zero-based)
        (int) character: Character offset on a line in a document (zero-based)
    '''
    def __init__(self, line, character):
        self.line = line
        self.character = character

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
            (TextDocumentIdentifier) uri: Uniquely identifies the document. For documents store on disk this is a file URI
            text: The initial full content of the document
        '''
        self.logger.debug("onDidOpenTextDocument")

    def onDidCloseTextDocument(self, uri):
        '''
        A text document got closed in VSCode
        Input
    	    (TextDocumentIdentifier) uri: Uniquely identifies the document
        '''
        self.logger.debug("onDidCloseTextDocument")

    def onDidChangeTextDocument(self, uri, contentChanges):
        '''
        The content of a text document changed in VSCode
        Input
            (TextDocumentIdentifier) uri: Uniquely identifies the document
	        contentChanges: Describe the content changes to the document
        '''
        self.logger.debug("onDidChangeTextDocument")

    def publishDiagnostics(self):
        '''
        The server identifies errors/warnings and notifies the client
        Output
            (Diagnostic) diagnostics: Diagnostic data about the editor
        '''
        self.logger.debug("publishDiagnostics")
        diagnostics = {"errors": 0, "warnings": 0}
        return diagnostics

class Range(object):
    '''
    A range in a text document expressed as (zero-based) start and end positions
    A range is comparable to a selection in an editor. Therefore the end position is exclusive
    Input
        (Position) start: Start position
        (Position) end: End position
    '''
    def __init__(self, start, end):
        self.start = start
        self.end = end

class TextDocumentClientCapabilities(object):
    '''
    Define capabilities the editor / tool provides on text documents
    Input
    '''
    def __init__(self):
        self.synchronization = self.docSynchronization()

    class docSynchronization(object):
        '''
        Capabilities specific to the `textDocument/synchronization`
        Input
            (bool) dynamicRegistration: Optional. Whether text document synchronization supports dynamic registration
            (bool) willSave: Optional. The client supports sending will save notifications
            (bool) willSaveWaitUntil: Optional. The client supports sending a will save request and
                    waits for a response providing text edits which will be applied to the document before it is saved
            (bool) didSave: Optional. The client supports did save notifications
        '''
        def __init__(self, dynamicRegistration=False, willSave=False, willSaveWaitUntil=False, didSave=False):
            self.dynamicRegistration = dynamicRegistration
            self.willSave = willSave
            self.willSaveWaitUntil = willSaveWaitUntil
            self.didSave = didSave

    class docCompletion(object):
        '''
        Capabilities specific to the `textDocument/completion`
        Input
            (bool) dynamicRegistration: Optional. Whether text document completion supports dynamic registration
            ()
        '''
        def __init__(self, dynamicRegistration=False, completionItem=None):
            self.dynamicRegistration = dynamicRegistration
            self.completionItem = completionItem

class TextDocumentIdentifier(object):
    '''
    TextDocuments are identified using a URI. On the protocol level, URIs are passed as strings
    Input
        (string) uri: The text document's URI
    '''
    def __init__(self, uri):
        self.uri = uri

class TextDocumentItem(object):
    '''
    An item to transfer a text document from the client to the server
    Input
        (string) uri: The text document's URI
        (string) languageId: The text document's language identifier
        (int) version: The version number of this document. It will strictly increase after each change, including undo/redo
        (string) text: The content of the opened text document
    '''
    def __init__(self, uri, languageId, version, text):
        self.uri = uri
        self.languageId = languageId
        self.version = version
        self.text = text

class TextDocumentPositionParams(object):
    '''
    A parameter literal used in requests to pass a text document and a position inside that document
    Input
        (TextDocumentIdentifier) textDocument: The text document
        (Position) position: The position inside the text document
    '''
    def __init__(self, textDocument, position):
        self.textDocument = textDocument
        self.position = position

class TextEdit(object):
    '''
    A textual edit applicable to a text document
    Input
        (Range) doc_range: The range of the text document to be manipulated
            To insert text into a document create a range where start === end
        (string) new_text: The string to be inserted. For delete operations use an empty string
    '''
    def __init__(self, doc_range, new_text):
        self.doc_range = doc_range
        self.new_text = new_text

class WorkspaceClientCapabilities(object):
    '''
    Define capabilities the editor / tool provides on the workspace
    Input
        (bool) applyEdit: Optional. The client supports applying batch edits to the workspace. Defaults to False
        (bool) changeConfig: Optional. Did change configuration notification supports dynamic registration
        (bool) changeWatched: Optional. Did change watched files notification supports dynamic registration
        (bool) symbol: Optional. Symbol request supports dynamic registration
        (bool) execCmd: Optional. Execute command supports dynamic registration
    '''
    def __init__(self, applyEdit=False, changeConfig=False, changeWatched=False, symbol=False, execCmd=False):
        self.applyEdit = applyEdit
        self.didChangeConfiguration = self.Notification(changeConfig)
        self.didChangeWatchedFiles = self.Notification(changeWatched)
        self.symbol = self.Request(symbol)
        self.executeCommand = self.Request(execCmd)

    class Notification(object):
        '''
        Capabilities specific to the `workspace/didChangeConfiguration` and `workspace/didChangeWatchedFiles` notifications
        Input
            (bool) dynamicRegistration: Optional. Notification supports dynamic registration
        '''
        def __init__(self, dynamicRegistration=False):
            self.dynamicRegistration = dynamicRegistration

    class Request(object):
        '''
        Capabilities specific to the `workspace/symbol` and `workspace/executeCommand` requests
        Input
            (bool) dynamicRegistration: Optional. Request supports dynamic registration
        '''
        def __init__(self, dynamicRegistration=False):
            self.dynamicRegistration = dynamicRegistration

class WorkspaceEdit(object):
    '''
    Changes to many resources managed in the workspace
    Input
        (dictionary) changes: Holds changes to existing resources
            Takes the form { [uri: string]: TextEdit[]; };
    '''
    def __init__(self, changes):
        self.changes = changes

class VersionedTextDocumentIdentifier(object):
    '''
    An identifier to denote a specific version of a text document
    Input
        (int) version: The version number of this document
    '''
    def __init__(self, version):
        self.version = version
