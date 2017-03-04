//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
// Based on https://github.com/Microsoft/vscode-wordcount/blob/master/test/extension.test.ts
//

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as ext from '../src/yara';

suite("Yara Tests", () => {
    test("Compile Success", () => {
        let yara = new ext.Yara();
        vscode.workspace.openTextDocument(".\\rules\\compile_success.yara").then((document) => {
            assert.equal(yara.compileRule(), 0);
        });
    });
    test("Compile Fail", () => {
        let yara = new ext.Yara();
        vscode.workspace.openTextDocument(".\\rules\\compile_fail.yara").then((document) => {
            assert.notEqual(yara.compileRule(), 0);
        });
    });
    test("Execute", () => {
        let yara = new ext.Yara();
        vscode.workspace.openTextDocument(".\\rules\\test.yara").then((document) => {
            assert.equal(yara.executeRule(), 0);
        });
    });
});