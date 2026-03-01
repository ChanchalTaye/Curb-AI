import urllib.request
import json
import time
import uuid
from datetime import datetime, timezone, timedelta

def generate_timestamp(seconds_offset=0):
    now = datetime.now(timezone.utc) + timedelta(seconds=seconds_offset)
    return now.isoformat()

def simulate():
    print("Starting CurbAI Browser Simulation...")
    device_id = "sim-device-" + str(uuid.uuid4())[:8]
    session_id = str(uuid.uuid4())

    # Create a realistic timeline of events
    events = [
        # 1. User opens GitHub to do some work
        {
            "event_category": "navigation",
            "event_type": "page_load",
            "event_timestamp": generate_timestamp(0),
            "payload": {"url": "https://github.com/ArjunBora/curb-v1", "domain": "github.com", "tab_id": 1},
            "session_id": session_id
        },
        # 2. Page engagement (scrolling)
        {
            "event_category": "page_engagement",
            "event_type": "scroll",
            "event_timestamp": generate_timestamp(5),
            "payload": {"url": "https://github.com/ArjunBora/curb-v1", "scroll_depth_percent": 45},
            "session_id": session_id
        },
        # 3. User opens a sketchy website
        {
            "event_category": "tab_management",
            "event_type": "tab_created",
            "event_timestamp": generate_timestamp(15),
            "payload": {"tab_id": 2},
            "session_id": session_id
        },
        {
            "event_category": "navigation",
            "event_type": "navigation_completed",
            "event_timestamp": generate_timestamp(16),
            "payload": {"url": "http://free-cracked-games-online.ru/installer.exe", "domain": "free-cracked-games-online.ru", "tab_id": 2},
            "session_id": session_id
        },
        # 4. EXECUTABLE FILE DOWNLOAD (High Risk)
        {
            "event_category": "download",
            "event_type": "executable_download",
            "event_timestamp": generate_timestamp(20),
            "payload": {
                "filename": "installer.exe",
                "source_url": "http://free-cracked-games-online.ru/installer.exe",
                "file_size": 15400000,
                "mime_type": "application/x-msdownload"
            },
            "session_id": session_id
        },
        # 5. User goes idle
        {
            "event_category": "session_timing",
            "event_type": "idle_locked",
            "event_timestamp": generate_timestamp(30),
            "payload": {"idle_state": "locked"},
            "session_id": session_id
        }
    ]

    payload = {
        "device_id": device_id,
        "events": events
    }

    req = urllib.request.Request(
        'http://localhost:8001/ingest/events',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )

    try:
        response = urllib.request.urlopen(req)
        print(f"Successfully sent {len(events)} events to CurbAI Ingestion Service!")
        print("Response:", response.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed to send events: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))

if __name__ == "__main__":
    simulate()
