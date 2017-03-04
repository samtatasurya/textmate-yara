//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
// Based on https://github.com/Microsoft/vscode-wordcount/blob/master/test/extension.test.ts
//

import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import * as ext from '../src/yara';

suite("Yara Tests", () => {
    test("Compile Success", (done) => {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test\\rules\\compile_success.yara");
        vscode.workspace.openTextDocument(filepath).then((document) => {
            // the YARA rule should've compiled successfully
            // errors/warnings don't get returned
            assert.equal(yara.compileRule(), 0);
            done();
        },
        (error) => {
            console.log(error);
            done();
        });
    });
    test("Compile Fail", (done) => {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test\\rules\\compile_fail.yara");
        vscode.workspace.openTextDocument(filepath).then((document) => {
            // the YARA rule should've failed
            // errors/warnings get returned
            assert.notEqual(yara.compileRule(), 0);
            done();
        },
            (error) => {
            console.log(error);
            done();
        });
    });
    test("Execute", (done) => {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test\\rules\\test.yara");
        vscode.workspace.openTextDocument(filepath).then((document) => {
            let results = yara.executeRule();
            // ensure our test YARA rule matches our test file
            // and that no errors or warnings were returned
            assert.equal(results.matches, 1);
            assert.equal(results.diagnostics, 0);
            done();
        },
            (error) => {
            console.log(error);
            done();
        });
    });
});