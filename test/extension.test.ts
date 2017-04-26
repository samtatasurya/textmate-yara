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
        let filepath = path.join(__dirname, '..', '..', "test/rules/compile_success.yara");
        vscode.workspace.openTextDocument(filepath).then((document) => {
            yara.compileRule(document).then(
                function (result) {
                    console.log('CompileSuccess promise complete: ' + JSON.stringify(result));
                    done();
                }
            ).catch((err) => {
                console.log('CompileSuccess promise rejected: ' + JSON.stringify(err));
            });
        });
    });
    test("Compile Fail", (done) => {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test/rules/compile_fail.yara");
        vscode.workspace.openTextDocument(filepath).then((document) => {
            yara.compileRule(document).then(
                function (result) {
                    console.log('CompileFail promise complete: ' + JSON.stringify(result));
                    done();
                }
            ).catch((err) => {
                    console.log('CompileFail promise rejected: ' + JSON.stringify(err));
            });
        });
    });
    test("Execute", (done) => {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test/rules/test.yara");
        vscode.workspace.openTextDocument(filepath).then((document) => {
            yara.executeRule(document).then(
                function (result) {
                    console.log('Execute promise complete: ' + JSON.stringify(result));
                    done();
                }
            ).catch((err) => {
                console.log('Execute promise rejected: ' + JSON.stringify(err));
            });
        });
    });
});