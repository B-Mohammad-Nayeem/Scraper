import re

def normalize_indian_phone(raw: str) -> str:
    if not raw:
        return "Not available"
    cleaned = re.sub(r"[^\d+]", "", raw.strip())
    if cleaned.startswith("+91"):
        digits = cleaned[3:]
    elif cleaned.startswith("91") and len(cleaned) == 12:
        digits = cleaned[2:]
    elif cleaned.startswith("0") and len(cleaned) in [11, 12]:
        digits = cleaned[1:]
    else:
        digits = cleaned

    if len(digits) == 10 and digits[0] in "6789":
        return f"+91 {digits[:5]} {digits[5:]}"
    elif len(digits) == 10 and digits.startswith("40"):
        return f"+91 40 {digits[2:6]} {digits[6:]}"
    elif len(digits) >= 10:
        return f"+91 {digits}"
    return "Not available"

def test_mobile_number_normalization():
    assert normalize_indian_phone("9876543210") == "+91 98765 43210"
    assert normalize_indian_phone("+91-9876543210") == "+91 98765 43210"
    assert normalize_indian_phone("09876543210") == "+91 98765 43210"

def test_landline_std_normalization():
    assert normalize_indian_phone("040 2311 0000") == "+91 40 2311 0000"

def test_invalid_phone():
    assert normalize_indian_phone("") == "Not available"
    assert normalize_indian_phone("123") == "Not available"
