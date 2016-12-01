![Source - https://raw.githubusercontent.com/blacktop/docker-yara/master/logo.png](./images/logo.png)

# textmate-yara
Syntax Highlighting and Snippets support for the YARA pattern matching language

## Snippets
* A new file skeleton (or `rule:` skeleton)
* `import` statement completion
* `strings:` section skeleton
* `meta:` section skeleton
* `author` statement
* `description` statement
* `cve` statement
* `version` statement

## Extension Functionality
* Periodically compile YARA rulefiles using either (a) yara-python or (b) pre-compiled yara binaries
* Allow the user to run her YARA rules manually through VSCode commands
  * Use configuration settings to modify how command is run
  * Install path (for pre-compiled binaries), timeout
* Display any compiler errors to the user through the VSCode workspace
  * Number of errors in status bar
  * Integration with right ruler (similar to Git differences)

## Future Plans
* YARA Tool Integration: Add commands for testing and compiling YARA rules in the current workspace
* Intellisense: Add Typescript definitions for integration with VSCode's Intellisense program
* Include compatibility with Unix-based OSes from the get-go for the linter/intellisense, and YARA tools

## Problems?
If you encounter an issue with the syntax, feel free to create an issue or pull request!
Alternatively, check out some of the YARA syntaxes for Sublime and Textmate (i.e. those in the <b>Example Code</b> section below).
They use the same syntax engine as VSCode and should work the same way

## Screenshot
![Image as of 04 Sept 2016](./images/04092016.PNG)

## References
#### Syntax Reference:<br>
https://yara.readthedocs.io/

#### TextMate Docs:<br>
http://manual.macromates.com/en/language_grammars

#### Regular Expressions:<br>
http://www.regular-expressions.info/modifiers.html

#### Example Code:<br>
https://github.com/mmcgrana/textmate-clojure/blob/master/Syntaxes/Clojure.tmLanguage <br>
https://github.com/textmate/python.tmbundle/blob/master/Syntaxes/Python.tmLanguage <br>
https://github.com/nyx0/YaraSyntax/blob/master/yara.tmLanguage <br>
https://github.com/blacktop/language-yara
