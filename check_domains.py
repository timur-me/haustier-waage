import requests
import whois
from datetime import datetime
import time
import json
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

# You would need to sign up for these API keys
GODADDY_API_KEY = os.getenv('GODADDY_API_KEY')
GODADDY_API_SECRET = os.getenv('GODADDY_API_SECRET')
NAMECHEAP_API_KEY = os.getenv('NAMECHEAP_API_KEY')


class DomainChecker:
    def __init__(self):
        self.domains = [
            "scale.pet",
            "paw.watch",
            "pet.weight",
            "purr.fect",
            "wag.stat",
            "pet.fit",
            "weight.watch",
            "scale.mate",
            "pet.mass",
            "weight.track",
            "pet.metrics",
            "pet.care",
            "tail.scale",
            "paw.track",
            "pet.health",
            "weight.wise",
            "pet.life",
            "pawsome.pet",
            "healthy.pet",
            "smart.scale",
            "pet.zone",
            "weight.buddy"
        ]

        self.results: Dict[str, Dict] = {}

    def check_availability_whois(self, domain: str) -> bool:
        """Check domain availability using whois."""
        try:
            domain_info = whois.whois(domain)
            # If no expiration date is found, domain might be available
            if domain_info.expiration_date is None:
                return True
            # If expiration date is a list, check the latest one
            if isinstance(domain_info.expiration_date, list):
                latest_expiration = max(domain_info.expiration_date)
                return latest_expiration < datetime.now()
            return domain_info.expiration_date < datetime.now()
        except Exception as e:
            print(f"Error checking {domain}: {str(e)}")
            return None

    def check_price_godaddy(self, domain: str) -> Optional[float]:
        """Check domain price using GoDaddy API."""
        if not (GODADDY_API_KEY and GODADDY_API_SECRET):
            return None

        headers = {
            'Authorization': f'sso-key {GODADDY_API_KEY}:{GODADDY_API_SECRET}',
            'Accept': 'application/json'
        }

        try:
            response = requests.get(
                f'https://api.godaddy.com/v1/domains/available?domain={domain}',
                headers=headers
            )
            data = response.json()
            return data.get('price', None)
        except Exception as e:
            print(f"Error checking price for {domain} on GoDaddy: {str(e)}")
            return None

    def check_all_domains(self):
        """Check availability and prices for all domains."""
        print("\nChecking domain availability and prices...")
        print("=" * 50)

        for domain in self.domains:
            print(f"\nChecking {domain}...")

            # Check availability
            available = self.check_availability_whois(domain)

            # Check price if available
            price = None
            if available:
                price = self.check_price_godaddy(domain)

            self.results[domain] = {
                'available': available,
                'price': price
            }

            # Avoid rate limiting
            time.sleep(1)

    def print_results(self):
        """Print results in a formatted table."""
        print("\nDomain Availability and Pricing Report")
        print("=" * 50)
        print(f"{'Domain':<30} {'Available':<10} {'Price':<10}")
        print("-" * 50)

        for domain, info in self.results.items():
            available = "Yes" if info['available'] else "No"
            price = f"${info['price']}" if info['price'] else "N/A"
            print(f"{domain:<30} {available:<10} {price:<10}")

    def save_results(self):
        """Save results to a JSON file."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"domain_check_results_{timestamp}.json"

        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\nResults saved to {filename}")


def main():
    checker = DomainChecker()
    checker.check_all_domains()
    checker.print_results()
    checker.save_results()


if __name__ == "__main__":
    main()
