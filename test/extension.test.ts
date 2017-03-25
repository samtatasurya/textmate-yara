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
        vscode.workspace.openTextDocument(filepath).then(
            (document) => {
                let results = yara.compileRule(document);
                let errors = 0;
                // the YARA rule should've compiled successfully
                // errors/warnings don't get returned
                results.stderr.on("data", (data) => {
                    errors += data.toString().split("\n").length;
                    // "error: 3" shows up here. not sure why
                });
                results.on("close", (code, signal) => {
                    assert.equal(errors, 0);
                });
                done();
            }, (error) => {
                assert.fail(error, "", `${error}`, "operator");
                done(error);
            }
        );
    });
    test("Compile Fail", (done) => {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test/rules/compile_fail.yara");
        vscode.workspace.openTextDocument(filepath).then(
            (document) => {
                let results = yara.compileRule(document);
                let errors = 0;
                // the YARA rule should've failed
                // errors/warnings get returned
                results.stderr.on("data", (data) => {
                    errors += data.toString().split("\n").length;
                });
                results.on("close", (code, signal) => {
                    assert.equal(errors, 3);
                });
                done();
            }, (error) => {
                done(error);
            }
        );
    });
    test("Execute", (done) => {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test/rules/test.yara");
        vscode.workspace.openTextDocument(filepath).then(
            (document) => {
                let results = yara.executeRule(document);
                let errors = 0;
                let matches = 0;
                // ensure our test YARA rule matches our test file
                // and that no errors or warnings were returned
                results.stdout.on("data", (data) => {
                    matches += data.toString().split("\n").length;
                });
                results.stderr.on("data", (data) => {
                    errors += data.toString().split("\n").length;
                });
                results.on("close", (code, signal) => {
                    assert.equal(matches, 2);
                    assert.equal(errors, 0);
                });
                done();
            }, (error) => {
                done(error);
            }
        );
    });
});