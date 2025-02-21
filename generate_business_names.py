import itertools
from typing import List, Dict, Tuple
import random
import string
from check_domains import DomainChecker


class BusinessNameGenerator:
    def __init__(self):
        self.pet_related = [
            "pet", "paw", "tail", "furry", "purr", "wag", "bark",
            "whisker", "animal", "buddy", "companion"
        ]

        self.weight_related = [
            "weight", "scale", "measure", "track", "fit", "health",
            "monitor", "balance", "metrics", "stats"
        ]

        self.descriptive = [
            "smart", "wise", "pro", "plus", "care", "perfect",
            "precise", "accurate", "easy", "simple"
        ]

        self.suffixes = [
            "hub", "tech", "app", "tracker", "pal", "mate",
            "guard", "watch", "keeper", "master"
        ]

    def generate_combinations(self) -> List[str]:
        """Generate different combinations of business names."""
        combinations = []

        # Pattern 1: pet + weight
        combinations.extend([
            f"{p}{w}".title()
            for p in self.pet_related
            for w in self.weight_related
        ])

        # Pattern 2: weight + pet
        combinations.extend([
            f"{w}{p}".title()
            for w in self.weight_related
            for p in self.pet_related
        ])

        # Pattern 3: descriptive + pet/weight
        combinations.extend([
            f"{d}{p}".title()
            for d in self.descriptive
            for p in self.pet_related + self.weight_related
        ])

        # Pattern 4: pet/weight + suffix
        combinations.extend([
            f"{p}{s}".title()
            for p in self.pet_related + self.weight_related
            for s in self.suffixes
        ])

        # Special combinations
        special_combinations = [
            "PetScalePro",
            "PawMetrics",
            "PetWeightGuard",
            "ScaleBuddy",
            "PawTracker",
            "PetFitPro",
            "WeightWise",
            "PetMetrics",
            "ScaleMaster",
            "PawHealth",
            "PetBalancePro",
            "SmartPetScale",
            "PrecisePaw",
            "PetWeightHub",
            "FurryFitness"
        ]
        combinations.extend(special_combinations)

        return list(set(combinations))  # Remove duplicates

    def evaluate_name(self, name: str) -> Dict[str, float]:
        """Evaluate a business name based on various criteria."""
        scores = {}

        # Length score (ideal length 8-15 characters)
        length = len(name)
        scores['length'] = 1.0 if 8 <= length <= 15 else 0.5 if 5 <= length <= 20 else 0.0

        # Pronounceability score (simplified)
        vowels = sum(1 for c in name.lower() if c in 'aeiou')
        consonants = sum(1 for c in name.lower()
                         if c in 'bcdfghjklmnpqrstvwxyz')
        scores['pronounceability'] = 1.0 if 0.3 <= vowels / \
            length <= 0.6 else 0.5

        # Memorability score (based on patterns and repetition)
        repeated_chars = len(set(name.lower())) / length
        scores['memorability'] = 0.8 if repeated_chars > 0.6 else 0.4

        # Relevance score (contains pet/weight related terms)
        relevant_terms = self.pet_related + self.weight_related
        scores['relevance'] = 1.0 if any(
            term.lower() in name.lower() for term in relevant_terms) else 0.0

        # Calculate average score
        scores['overall'] = sum(scores.values()) / len(scores)

        return scores

    def generate_domains(self, name: str) -> List[str]:
        """Generate possible domain variations for a business name."""
        # Remove spaces and special characters
        base_name = ''.join(c.lower() for c in name if c.isalnum())

        tlds = ['.com', '.io', '.app', '.tech', '.pet', '.care']
        domains = [f"{base_name}{tld}" for tld in tlds]

        # Add hyphenated versions for longer names
        if len(base_name) > 10:
            words = self.split_into_words(name)
            if len(words) > 1:
                hyphenated = '-'.join(words).lower()
                domains.extend([f"{hyphenated}{tld}" for tld in tlds])

        return domains

    def split_into_words(self, name: str) -> List[str]:
        """Split camelCase or PascalCase into words."""
        words = []
        current_word = ""

        for char in name:
            if char.isupper() and current_word:
                words.append(current_word.lower())
                current_word = char
            else:
                current_word += char

        if current_word:
            words.append(current_word.lower())

        return words

    def get_top_suggestions(self, num_suggestions: int = 10) -> List[Tuple[str, Dict[str, float], List[str]]]:
        """Get top business name suggestions with scores and domain variations."""
        names = self.generate_combinations()
        evaluated_names = []

        for name in names:
            scores = self.evaluate_name(name)
            domains = self.generate_domains(name)
            evaluated_names.append((name, scores, domains))

        # Sort by overall score
        evaluated_names.sort(key=lambda x: x[1]['overall'], reverse=True)

        return evaluated_names[:num_suggestions]


def print_suggestions(suggestions: List[Tuple[str, Dict[str, float], List[str]]]):
    """Print business name suggestions in a formatted way."""
    print("\nTop Business Name Suggestions")
    print("=" * 50)

    for i, (name, scores, domains) in enumerate(suggestions, 1):
        print(f"\n{i}. {name}")
        print("-" * 20)
        print(f"Overall Score: {scores['overall']:.2f}")
        print(f"Length: {scores['length']:.2f}")
        print(f"Pronounceability: {scores['pronounceability']:.2f}")
        print(f"Memorability: {scores['memorability']:.2f}")
        print(f"Relevance: {scores['relevance']:.2f}")
        print("\nPossible Domains:")
        for domain in domains:
            print(f"  - {domain}")


def main():
    generator = BusinessNameGenerator()
    top_suggestions = generator.get_top_suggestions(15)
    print_suggestions(top_suggestions)

    # Optional: Check domain availability for top suggestions
    print("\nWould you like to check domain availability for these suggestions? (y/n)")
    if input().lower() == 'y':
        domain_checker = DomainChecker()
        all_domains = []
        for _, _, domains in top_suggestions:
            all_domains.extend(domains)
        domain_checker.domains = all_domains
        domain_checker.check_all_domains()
        domain_checker.print_results()
        domain_checker.save_results()


if __name__ == "__main__":
    main()
