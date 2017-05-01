![Source - https://raw.githubusercontent.com/blacktop/docker-yara/master/logo.png](./images/logo.png)

# textmate-yara
Syntax Highlighting and Snippets support for the YARA pattern matching language

## Snippets
* A new file skeleton (or `rule:` skeleton)
* `meta:` section skeleton
* `strings:` section skeleton
* `condition:` section skeleton
* `import` statement
* `author` statement
* `description` statement
* `cve` statement
* `version` statement

## Extension Functionality
* Periodically compile YARA rulefiles using pre-compiled binaries in the user's $PATH
* Allow the user to run YARA rules manually through VSCode commands
  * Use configuration settings to modify how command is run
* Display any compiler errors to the user through the VSCode workspace
  * Uses diagnostics already integrated into VSCode to display "squiggle" lines and right ruler

## Future Plans
* Intellisense: Add Typescript definitions for integration with VSCode's Intellisense program
* Include compatibility with Unix-based OSes from the get-go for the linter/intellisense, and YARA tools

## Problems?
If you encounter any issues, feel free to create an issue or pull request

## Screenshot
![Image as of 04 Sept 2016](./images/04092016.PNG)

## References
#### Syntax Reference:<br>
https://yara.readthedocs.io/

#### TextMate Docs:<br>
http://manual.macromates.com/en/language_grammars

#### Regular Expressions:<br>
http://www.regular-expressions.info/modifiers.html

#### Other Code Inspirations:<br>
https://github.com/mmcgrana/textmate-clojure/blob/master/Syntaxes/Clojure.tmLanguage <br>
https://github.com/textmate/python.tmbundle/blob/master/Syntaxes/Python.tmLanguage <br>
https://github.com/nyx0/YaraSyntax/blob/master/yara.tmLanguage <br>
https://github.com/blacktop/language-yara
