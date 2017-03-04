//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
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
            assert.equal(yara.compileRule(), 0);
            done();
        // }, (error) => {
        //     assert.fail("failed");
        //     done();
        });
    });
    test("Compile Fail", (done) => {
        let yara = new ext.Yara();
        vscode.workspace.openTextDocument(".\\rules\\compile_fail.yara").then((document) => {
            assert.notEqual(yara.compileRule(), 0);
            done();
        // }, (error) => {
        //     assert.fail("failed");
        //     done();
        });
    });
    test("Execute", (done) => {
        let yara = new ext.Yara();
        vscode.workspace.openTextDocument(".\\rules\\test.yara").then((document) => {
            assert.notEqual(yara.executeRule(), 0);
            done();
        // }, (error) => {
        //     assert.fail(error);
        //     done();
        });
    });
});