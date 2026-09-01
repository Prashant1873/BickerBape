#!/usr/bin/env python3
"""
BickerBape Local Server Runner
Serves the BickerBape web application locally on http://localhost:8080
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class BickerBapeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), BickerBapeHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("  BICKERBAPE - INDIAN EQUITY MUTUAL FUND SCREENER")
        print(f"  Running locally at: {url}")
        print("  Press Ctrl+C to stop the server.")
        print("=" * 60)
        
        # Open in browser if --open flag is provided
        if "--open" in sys.argv:
            webbrowser.open(url)
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run()
