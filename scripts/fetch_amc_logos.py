import os
import json
import logging
import urllib.request
import urllib.error

# Configure logging per user rules
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "logos", "amc")
os.makedirs(OUTPUT_DIR, exist_ok=True)

AMC_MAPPINGS = {
    "hdfc": {"domain": "hdfcfund.com", "name": "HDFC Mutual Fund"},
    "sbi": {"domain": "sbimf.com", "name": "SBI Mutual Fund"},
    "icici": {"domain": "icicibank.com", "name": "ICICI Prudential Mutual Fund"},
    "nippon": {"domain": "mf.nipponindiaim.com", "name": "Nippon India Mutual Fund"},
    "kotak": {"domain": "kotakmf.com", "name": "Kotak Mahindra Mutual Fund"},
    "axis": {"domain": "axismf.com", "name": "Axis Mutual Fund"},
    "quant": {"domain": "quantmutual.com", "name": "quant Mutual Fund"},
    "mirae": {"domain": "miraeassetmf.co.in", "name": "Mirae Asset Mutual Fund"},
    "ppfas": {"domain": "amc.ppfas.com", "name": "PPFAS Mutual Fund"},
    "motilal": {"domain": "motilaloswalmf.com", "name": "Motilal Oswal Mutual Fund"},
    "tata": {"domain": "tatamutualfund.com", "name": "Tata Mutual Fund"},
    "uti": {"domain": "utimf.com", "name": "UTI Mutual Fund"},
    "dsp": {"domain": "dspim.com", "name": "DSP Mutual Fund"},
    "bandhan": {"domain": "bandhanmutual.com", "name": "Bandhan Mutual Fund"},
    "aditya_birla": {"domain": "mutualfund.adityabirlacapital.com", "name": "Aditya Birla Sun Life Mutual Fund"},
    "canara_robeco": {"domain": "canararobeco.com", "name": "Canara Robeco Mutual Fund"},
    "edelweiss": {"domain": "edelweissmf.com", "name": "Edelweiss Mutual Fund"},
    "invesco": {"domain": "invescomutualfund.com", "name": "Invesco Mutual Fund"},
    "franklin": {"domain": "franklintempletonindia.com", "name": "Franklin Templeton Mutual Fund"},
    "sundaram": {"domain": "sundarammutual.com", "direct_url": "https://www.sundarammutual.com/favicon.ico", "name": "Sundaram Mutual Fund"},
    "hsbc": {"domain": "assetmanagement.hsbc.co.in", "name": "HSBC Mutual Fund"},
    "whiteoak": {"domain": "whiteoakamc.com", "name": "WhiteOak Capital Mutual Fund"},
    "mahindra": {"domain": "mahindramanulife.com", "name": "Mahindra Manulife Mutual Fund"},
    "bajaj": {"domain": "bajajamc.com", "name": "Bajaj Finserv Mutual Fund"},
    "pgim": {"domain": "pgimindiamf.com", "name": "PGIM India Mutual Fund"},
    "navi": {"domain": "navi.com", "name": "Navi Mutual Fund"},
    "groww": {"domain": "groww.in", "name": "Groww Mutual Fund"},
    "bank_of_india": {"domain": "boimf.com", "name": "Bank of India Mutual Fund"},
    "baroda_bnp": {"domain": "barodabnpparibasmf.in", "name": "Baroda BNP Paribas Mutual Fund"},
    "jm_financial": {"domain": "jmfinancial.com", "name": "JM Financial Mutual Fund"},
    "lic": {"domain": "licmf.com", "name": "LIC Mutual Fund"},
    "union": {"domain": "unionbank.in", "name": "Union Mutual Fund"},
    "iti": {"domain": "itiamc.com", "name": "ITI Mutual Fund"},
    "360_one": {"domain": "360.one", "name": "360 ONE Mutual Fund"},
    "taurus": {"domain": "taurusmutualfund.com", "name": "Taurus Mutual Fund"},
    "quantum": {"domain": "quantummf.com", "name": "Quantum Mutual Fund"},
    "shriram": {"domain": "shriramamc.in", "name": "Shriram Mutual Fund"},
    "nj": {"domain": "njgroup.in", "name": "NJ Mutual Fund"},
    "trust": {"domain": "trustmf.com", "name": "Trust Mutual Fund"},
    "samco": {"domain": "samco.in", "name": "Samco Mutual Fund"},
    "helios": {"domain": "heliosmf.in", "name": "Helios Mutual Fund"},
    "old_bridge": {"domain": "oldbridgecapital.com", "name": "Old Bridge Mutual Fund"},
    "capitalmind": {"domain": "capitalmindwealth.com", "name": "Capitalmind Mutual Fund"},
    "jio_blackrock": {"domain": "jioblackrock.com", "name": "Jio BlackRock Mutual Fund"},
    "unifi": {"domain": "unificap.com", "name": "Unifi Mutual Fund"},
    "abakkus": {"domain": "abakkusinvest.com", "name": "Abakkus Mutual Fund"},
    "wealth_company": {"domain": "thewealthcompany.in", "direct_url": "https://thewealthcompany.in/favicon.ico", "name": "The Wealth Company Mutual Fund"}
}

def fetch_logo(slug: str, meta: dict) -> bool:
    domain = meta["domain"]
    target_path = os.path.join(OUTPUT_DIR, f"{slug}.png")
    
    # URL candidates (Direct URL first, then Google Favicon 128px, then DuckDuckGo icon)
    urls = []
    if "direct_url" in meta:
        urls.append(meta["direct_url"])
    urls.extend([
        f"https://www.google.com/s2/favicons?domain={domain}&sz=128",
        f"https://icons.duckduckgo.com/ip3/{domain}.ico"
    ])
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    for url in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = response.read()
                    if len(data) > 100:  # Valid image payload
                        with open(target_path, "wb") as f:
                            f.write(data)
                        logging.info("Saved logo for %s (%s) -> %d bytes from %s", slug, domain, len(data), url)
                        return True
        except Exception as e:
            logging.debug("Could not fetch %s from %s: %s", slug, url, e)
    
    logging.warning("Failed to download logo for %s (%s)", slug, domain)
    return False

def main():
    logging.info("Starting AMC logo fetch pipeline for %d fund houses...", len(AMC_MAPPINGS))
    success_count = 0
    for slug, meta in AMC_MAPPINGS.items():
        if fetch_logo(slug, meta):
            success_count += 1
            
    logging.info("Logo fetch finished: %d/%d successfully downloaded into %s", success_count, len(AMC_MAPPINGS), OUTPUT_DIR)

if __name__ == "__main__":
    main()
