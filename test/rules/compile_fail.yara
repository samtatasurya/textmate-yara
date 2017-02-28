/*
    Basic example YARA file for testing failed YARA compilations
    Should fail with "unterminated string - syntax error, unexpected $end, expecting _TEXT_STRING_"
*/
rule Fail
{
    strings:
        $a = "failed
    condition:
        false
}