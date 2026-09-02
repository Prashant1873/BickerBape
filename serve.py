#!/usr/bin/env python3
"""BickerBape Local Development Server"""
import http.server
import os

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("Serving BickerBape on http://localhost:8080...")
    http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=8080)

