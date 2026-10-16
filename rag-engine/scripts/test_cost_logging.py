"""
test_cost_logging.py

Quick script to:
1. Kill any existing server on port 8000
2. Start the FastAPI server with updated code (logs to file)
3. Send a test request to the RAG pipeline
4. Display the server logs (with per-block cost breakdown)

Usage:
    uv run python -m scripts.test_cost_logging
"""

import subprocess
import time
import os
import signal
import sys
import dotenv

dotenv.load_dotenv()

SERVER_PORT = 8000
SERVER_HOST = "0.0.0.0"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE = os.path.join(PROJECT_ROOT, "server.log")


def kill_existing_server():
    """Kill any process listening on the server port."""
    print(f"🔍 Checking for existing server on port {SERVER_PORT}...")
    try:
        result = subprocess.run(
            ["lsof", "-t", f"-i:{SERVER_PORT}"],
            capture_output=True, text=True
        )
        if result.stdout.strip():
            pids = result.stdout.strip().split("\n")
            for pid in pids:
                if pid:
                    print(f"  Killing process {pid}...")
                    os.kill(int(pid), signal.SIGKILL)
            time.sleep(1)
            print("✅ Old server killed.")
        else:
            print("  No existing server found.")
    except Exception as e:
        print(f"  Note: {e}")


def start_server():
    """Start the FastAPI server in background, logs to file."""
    print(f"\n🚀 Starting server on port {SERVER_PORT}...")

    # Remove old log file
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)

    server_cmd = [
        "uv", "run", "fastapi", "run", "app/main.py",
        "--host", SERVER_HOST,
        "--port", str(SERVER_PORT)
    ]

    # Start server, redirect output to log file
    with open(LOG_FILE, "w") as log_f:
        proc = subprocess.Popen(
            server_cmd,
            cwd=PROJECT_ROOT,
            stdout=log_f,
            stderr=subprocess.STDOUT,
        )

    # Wait for server to be ready
    print("  Waiting for server to start...")
    for _ in range(20):
        time.sleep(1)
        try:
            result = subprocess.run(
                ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
                 f"http://localhost:{SERVER_PORT}/docs"],
                capture_output=True, text=True, timeout=2
            )
            if result.stdout.strip() == "200":
                print(f"✅ Server started successfully!")
                return proc
        except Exception:
            pass
        if proc.poll() is not None:
            print(f"❌ Server failed to start (exit code: {proc.poll()})")
            sys.exit(1)

    print("⚠️  Server may not be ready yet, but continuing...")
    return proc


def send_test_request():
    """Send a test request to the RAG pipeline and display cost with FULL precision."""
    print(f"\n📤 Sending test request to /rag/stream...")

    payload = {
        "org_id": "lepetitcoin",
        "query": "What do you know ?",
        "pipeline": {
            "pipeline_name": "test_cost",
            "blocks": [
                {"type": "query", "name": "query"},
                {
                    "type": "retrieve",
                    "name": "retrieve",
                    "collection_name": "genrag_knowledge_base",
                    "top_k": 5
                },
                {
                    "type": "answer",
                    "name": "answer",
                    "model": "google/gemini-2.5-flash",
                    "temperature": 0.7,
                    "max_tokens": 256
                }
            ]
        }
    }

    api_key = os.getenv("RAG_ENGINE_API_KEY", "test-key")

    cmd = [
        "curl", "-s", "-X", "POST",
        f"http://localhost:{SERVER_PORT}/rag/stream",
        "-H", f"X-API-Key: {api_key}",
        "-H", "Content-Type: application/json",
        "-d", str(payload).replace("'", '"')
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        print(f"✅ Request completed (exit code: {result.returncode})")

        response = result.stdout

        # Extract and display COST_SUMMARY with FULL precision
        if "COST_SUMMARY" in response:
            print("\n" + "=" * 60)
            print("  COST SUMMARY FROM RESPONSE (FULL PRECISION)")
            print("=" * 60)

            # Extract the COST_SUMMARY JSON
            import re
            match = re.search(r'COST_SUMMARY: (.+?) -->', response)
            if match:
                cost_json_str = match.group(1)
                try:
                    cost_data = json.loads(cost_json_str)
                    print(f"\n  Raw JSON: {json.dumps(cost_data, indent=2)}")

                    # Display with full precision
                    if "data" in cost_data:
                        data = cost_data["data"]
                        print(f"\n  📊 Total cost (float): ${data.get('total_cost_usd', 0):.10f}")
                        print(f"  📊 Total cost (raw string): ${data.get('total_cost_usd_raw', 'N/A')}")
                        print(f"  📊 By model: {data.get('by_model', {})}")
                        print(f"  📊 By type: {data.get('by_type', {})}")
                except json.JSONDecodeError as e:
                    print(f"  ⚠️  Error parsing cost JSON: {e}")
                    print(f"  Raw string: {cost_json_str[:200]}")

            print("=" * 60)
        else:
            print("\n⚠️  No COST_SUMMARY found in response")
            print(f"Last 500 chars of response:\n{response[-500:]}")

    except subprocess.TimeoutExpired:
        print("❌ Request timed out after 60 seconds")
    except Exception as e:
        print(f"❌ Error sending request: {e}")


def show_server_logs():
    """Read and display the server logs, focusing on cost breakdown."""
    print("\n" + "=" * 60)
    print("  SERVER LOGS (Cost Breakdown)")
    print("=" * 60)

    if not os.path.exists(LOG_FILE):
        print("  No log file found.")
        return

    with open(LOG_FILE, "r") as f:
        lines = f.readlines()

    # Print lines that contain cost-related keywords
    cost_lines = []
    in_cost_section = False

    for line in lines:
        if "COST BREAKDOWN" in line or "=== COST" in line:
            in_cost_section = True
        if in_cost_section:
            cost_lines.append(line.rstrip())
            if line.strip() == "=" * 40 or "=====" in line:
                in_cost_section = False

    if cost_lines:
        print("\n".join(cost_lines))
    else:
        # If no cost section found, show last 30 lines
        print("  (No cost breakdown found, showing last 30 log lines)")
        for line in lines[-30:]:
            print(f"  {line.rstrip()}")

    print("=" * 60)


def main():
    print("=" * 60)
    print("  RAG Pipeline Cost Logging Test")
    print("=" * 60)

    # Step 1: Kill existing server
    kill_existing_server()

    # Step 2: Start server
    server_proc = start_server()

    try:
        # Step 3: Send test request
        send_test_request()

        # Small delay to let server finish logging
        time.sleep(1)

        # Step 4: Show server logs
        show_server_logs()

    finally:
        # Keep server running so user can see logs
        print("\n⚠️  Server is still running. Press Ctrl+C to stop it.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping server...")
            server_proc.terminate()
            server_proc.wait(timeout=5)
            print("✅ Server stopped.")


if __name__ == "__main__":
    main()
