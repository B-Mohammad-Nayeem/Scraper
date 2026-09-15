import math
import httpx
from typing import Dict, Any, Optional

EARTH_RADIUS_KM = 6371.0

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate geodesic Haversine distance in kilometers between two coordinates."""
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(EARTH_RADIUS_KM * c, 2)

async def resolve_location(query: str) -> Dict[str, Any]:
    """Resolve location text to geographic coordinates using OpenStreetMap Nominatim."""
    clean_query = query.strip()
    headers = {"User-Agent": "GeoDiscover-Pipeline/1.0"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            url = f"https://nominatim.openstreetmap.org/search?format=json&q={clean_query}&limit=1"
            res = await client.get(url, headers=headers)
            if res.status_code == 200 and len(res.json()) > 0:
                first = res.json()[0]
                lat = float(first["lat"])
                lon = float(first["lon"])
                bbox = [float(b) for b in first.get("boundingbox", [lat - 0.05, lat + 0.05, lon - 0.05, lon + 0.05])]
                return {
                    "query": clean_query,
                    "formatted_address": first.get("display_name", clean_query),
                    "latitude": lat,
                    "longitude": lon,
                    "bounding_box": bbox,
                    "name": first.get("display_name", "").split(",")[0],
                }
        except Exception as e:
            pass

    # Default fallback
    return {
        "query": clean_query,
        "formatted_address": f"{clean_query}, India",
        "latitude": 17.4483,
        "longitude": 78.3915,
        "bounding_box": [17.40, 17.48, 78.35, 78.43],
        "name": clean_query,
    }
