/*
    Basic example YARA file for testing
    successful YARA matches
*/
rule TestRule
{
    meta:
        author = "infosec_intern"
        description = "Basic YARA file for testing"
    strings:
        $basicString = "test"
    condition:
        $basicString
}

rule Dummy
{
    condition:
        true
}