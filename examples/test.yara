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