from typing import Dict, Any, List, Tuple

def evaluate_verification(
    maps_match: bool,
    website_found: bool,
    address_match: bool,
    phone_match: bool,
    independent_source_match: bool,
    registry_match: bool,
    weights: Dict[str, int] = None
) -> Tuple[int, str, List[Dict[str, Any]]]:
    """
    Evaluate 6-signal verification confidence score according to system specification:
    Maps match (+25), Website (+20), Address (+20), Phone (+15), Independent (+10), Registry (+10).
    """
    w = weights or {
        "mapsMatch": 25,
        "websiteFound": 20,
        "addressMatch": 20,
        "phoneMatch": 15,
        "independentSource": 10,
        "registryMatch": 10,
    }

    breakdown = [
        {
            "signal": "Maps / Places Match",
            "key": "mapsMatch",
            "passed": maps_match,
            "points": w["mapsMatch"] if maps_match else 0,
            "maxPoints": w["mapsMatch"],
            "evidence": "Verified spatial geometry on OpenStreetMap & Places index" if maps_match else "No verified maps polygon found"
        },
        {
            "signal": "Official Website Found",
            "key": "websiteFound",
            "passed": website_found,
            "points": w["websiteFound"] if website_found else 0,
            "maxPoints": w["websiteFound"],
            "evidence": "Valid top-level corporate/healthcare domain" if website_found else "No verified web domain listed"
        },
        {
            "signal": "Address Matches Locality",
            "key": "addressMatch",
            "passed": address_match,
            "points": w["addressMatch"] if address_match else 0,
            "maxPoints": w["addressMatch"],
            "evidence": "Physical address confirmed within target radius boundary" if address_match else "Address incomplete"
        },
        {
            "signal": "Phone Number Validated",
            "key": "phoneMatch",
            "passed": phone_match,
            "points": w["phoneMatch"] if phone_match else 0,
            "maxPoints": w["phoneMatch"],
            "evidence": "Valid national telecommunications format" if phone_match else "Phone number unverified or missing"
        },
        {
            "signal": "Independent Source Match",
            "key": "independentSource",
            "passed": independent_source_match,
            "points": w["independentSource"] if independent_source_match else 0,
            "maxPoints": w["independentSource"],
            "evidence": "Cross-verified with secondary independent directory" if independent_source_match else "Single-source observation"
        },
        {
            "signal": "Public / Healthcare Registry Match",
            "key": "registryMatch",
            "passed": registry_match,
            "points": w["registryMatch"] if registry_match else 0,
            "maxPoints": w["registryMatch"],
            "evidence": "Corporate ROC or Clinical Establishments Act record found" if registry_match else "No formal registry link available"
        },
    ]

    total_score = sum(b["points"] for b in breakdown)
    total_score = min(100, max(0, total_score))

    if total_score >= 90:
        status = "VERIFIED"
    elif total_score >= 70:
        status = "LIKELY_VERIFIED"
    else:
        status = "UNVERIFIED"

    return total_score, status, breakdown
