/*
    Basic example YARA file for testing YARA matches
*/
rule Test
{
    meta:
        author = "infosec_intern"
        description = "Basic YARA file for testing"
    strings:
        $basicString = "test"
    condition:
        $basicString
}

rule File
{
    meta:
        author = "infosec_intern"
        description = "Second basic YARA file for testing"
    strings:
        $basicString = "file"
    condition:
        $basicString
}

rule Failed
{
    meta:
        author = "infosec_intern"
        description = "This rule won't match"
    strings:
        $basicString = "not in file"
    condition:
        $basicString
}