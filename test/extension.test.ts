//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
// Copied/modified example from
// https://github.com/Microsoft/vscode-wordcount/blob/master/test/extension.test.ts
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as ext from '../src/yara';

// Defines a Mocha test suite to group tests of similar kind together
suite("Yara Tests", () => {
    test("Compile Success", (done) => {
        let yara = new ext.Yara();
        vscode.workspace.openTextDocument(".\\rules\\compile_success.yara").then((document) => {
            // assert.
        });
    });
});