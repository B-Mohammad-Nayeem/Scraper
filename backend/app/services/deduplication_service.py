import re
from typing import List, Dict, Any
from app.services.location_service import calculate_haversine

def normalize_text(text: str) -> str:
    """Normalize organization names by removing legal suffix tokens and punctuation."""
    t = (text or "").lower()
    t = re.sub(r"[^\w\s]", " ", t)
    # Remove corporate/hospital noise words
    t = re.sub(r"\b(pvt|ltd|limited|private|inc|corp|corporation|enterprise|llc|co|hospital|hospitals)\b", " ", t)
    return " ".join(t.split())

def string_similarity(s1: str, s2: str) -> float:
    """Compute token-based Jaccard similarity coefficient."""
    tokens1 = set(s1.split())
    tokens2 = set(s2.split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)

def deduplicate_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Merge duplicate records across sources using spatial proximity (<150m-300m)
    and name/domain/phone similarity.
    """
    deduped: List[Dict[str, Any]] = []

    for item in records:
        norm_name = normalize_text(item.get("name", ""))
        lat = item.get("latitude", 0.0)
        lon = item.get("longitude", 0.0)
        phone = item.get("phone", "")
        website = item.get("website", "")

        matched_index = -1

        for i, existing in enumerate(deduped):
            ex_norm = normalize_text(existing.get("name", ""))
            dist_km = calculate_haversine(lat, lon, existing.get("latitude", 0.0), existing.get("longitude", 0.0))

            # Rule 1: Very close physical distance (< 150m) and high name similarity
            if dist_km < 0.15 and string_similarity(norm_name, ex_norm) > 0.4:
                matched_index = i
                break

            # Rule 2: Same valid phone number within 1.0 km
            if phone and phone != "Not available" and phone == existing.get("phone") and dist_km < 1.0:
                matched_index = i
                break

            # Rule 3: Identical normalized web domain and same city
            if website and website != "Not available" and existing.get("website"):
                dom1 = website.replace("https://", "").replace("http://", "").split("/")[0]
                dom2 = existing.get("website", "").replace("https://", "").replace("http://", "").split("/")[0]
                if dom1 and dom1 == dom2 and dist_km < 2.0:
                    matched_index = i
                    break

        if matched_index >= 0:
            # Merge sources and retain highest verification score
            target = deduped[matched_index]
            if item.get("verification_score", 0) > target.get("verification_score", 0):
                # Update with higher score
                target["verification_score"] = item["verification_score"]
                target["verification_status"] = item["verification_status"]
            # Combine sources
            existing_sources = {s["url"]: s for s in target.get("verification_sources", [])}
            for s in item.get("verification_sources", []):
                existing_sources[s["url"]] = s
            target["verification_sources"] = list(existing_sources.values())
        else:
            deduped.append(item)

    return deduped
