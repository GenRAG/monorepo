import asyncio
import os
import httpx
import dotenv
import time

dotenv.load_dotenv()

API_KEY = os.getenv("RAG_ENGINE_API_KEY")
BASE_URL = "http://141.94.174.134:8000"

async def test_website_ingestion():
    url = f"{BASE_URL}/ingest/website"
    website_url = "https://www.nhs.uk"
    org_id = "test_org"

    payload = {
        "url": website_url,
        "org_id": org_id,
        "max_pages": 5
    }

    print(f"Triggering website ingestion for {website_url}...")

    async with httpx.AsyncClient(timeout=60.0, headers={"X-API-Key": API_KEY}) as client:
        try:
            response = await client.post(url, data=payload)
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                print(response.text)
                return

            data = response.json()
            job_id = data.get("job_id")
            print(f"Job started: {job_id}")

            # Poll status
            status_url = f"{BASE_URL}/job/{job_id}/status"
            while True:
                resp = await client.get(status_url)
                status_data = resp.json()
                status = status_data.get("status")
                print(f"Status: {status} (Progress: {status_data.get('progress')})")

                if status in ["completed", "failed"]:
                    break
                await asyncio.sleep(5)

            print(f"Final status: {status}")

        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_website_ingestion())
