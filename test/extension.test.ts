//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as ext from "../src/yara";

suite("YARA: Commands", function() {
/*
    Ensure no diagnostics are created when a file has proper syntax
*/
    test("Compile Success", function(done) {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, '..', '..', "test/rules/compile_success.yara");
        vscode.workspace.openTextDocument(filepath).then(function(document) {
            let config = vscode.workspace.getConfiguration();
            console.log(JSON.stringify(config.get("yara")));
            const promise = yara.compileRule(document);
            promise.then(function(diagnostics) {
                let count:number = 0;
                for (var i in diagnostics) { count++; }
                assert.equal(count, 0, `Found ${count} errors. 0 expected`);
                done();
            }).catch(function(err) {
                console.log(err);
            });
        });
    });
/*
    Check the number of diagnostics returned when a file fails to compile
*/
    test("Compile Fail", function(done) {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, "..", "..", "test/rules/compile_fail.yara");
        vscode.workspace.openTextDocument(filepath).then(function(document) {
            const promise = yara.compileRule(document);
            promise.then(function(diagnostics) {
                let count:number = 0;
                for (var i in diagnostics) { count++; }
                assert.equal(count, 2, `Found ${count} errors. 2 expected`);
                done();
            }).catch(function(err) {
                console.log(err);
            });
        });
    });

    test("Compile Error", function(done) {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, "..", "..")
    });
/*
    Ensure the appropriate number of diagnostics are returned when executing a collection of rules
    Display to the user which rules executed successfully
*/
    test("Execute", function(done) {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, "..", "..", "test/rules/execute.yara");
        vscode.workspace.openTextDocument(filepath).then(function(document) {
            const promise = yara.executeRule(document);
            promise.then(function(diagnostics) {
                let count:number = 0;
                for (var i in diagnostics) { count++; }
                assert.equal(count, 0, `Found ${count} errors. 0 expected`);
                done();
            }).catch(function(err) {
                console.log(err);
            });
        });
    });
});

suite("YARA: Settings", function() {
/*
    warning.yara file should return 1 diagnostic normally
    returns 0 diagnostics when --no-warning flag is set
    The next two tests also serve as a test on the $flags in general
*/
    test("No Warnings Enabled", function(done) {
        let yara = new ext.Yara();
        let filepath = path.join(__dirname, "..", "..", "test/rules/warning.yara");
        // set the --no-warning flag and check if warnings are present
        vscode.workspace.openTextDocument(filepath).then(function(document) {
            const promise = yara.compileRule(document);
            promise.then(function(diagnostics) {
                let count:number = 0;
                for (var i in diagnostics) {
                    // Diagnostic Severity of 1 == Warning
                    assert.equal(diagnostics[i].severity, 1);
                }
                done();
            }).catch(function(err) {
                console.log(err);
            });
        });
    });
/*
    Let user know an option they have set doesn't exist
    and that their compilation fails
*/
    test("Unknown Option Flag", function(done) {
        let yara = new ext.Yara();
        done();
    });
/*
    Gracefully handle scenario where YARA isn't found at installPath
*/
    test("Install Path", function(done) {
        let yara = new ext.Yara();
        done();
    });
});