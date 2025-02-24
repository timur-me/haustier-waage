# 🤝 Contributing Guide

## Introduction

Thank you for considering contributing to Haustier Waage! This document provides guidelines and workflows for contributing to the project.

## Code of Conduct

This project adheres to the Contributor Covenant code of conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### Development Environment Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/yourusername/petscale.git
   cd petscale
   ```

3. Set up the backend:

   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   cp .env.example .env
   ```

4. Set up the frontend:

   ```bash
   cd frontend
   npm install
   ```

5. Start the development servers:

   ```bash
   # Backend (in project root)
   uvicorn app.main:app --reload

   # Frontend (in frontend directory)
   npm start
   ```

## Development Workflow

### Branch Naming Convention

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Performance improvements: `perf/description`

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

Example:

```
feat(auth): add email verification flow

- Add email templates
- Implement token generation
- Add verification endpoints

Closes #123
```

### Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Update documentation if needed
4. Run tests and ensure they pass
5. Push your changes
6. Create a Pull Request

#### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

Describe the tests you ran

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass
```

## Coding Standards

### Python Style Guide

Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) with these additions:

```python
# Imports
from typing import List, Optional
import standard_library
import third_party
import local_package

# Type hints
def function_name(param1: str, param2: Optional[int] = None) -> List[str]:
    pass

# Docstrings
def complex_function(param1: str, param2: int) -> bool:
    """
    Brief description of function.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value

    Raises:
        ValueError: Description of when this is raised
    """
    pass
```

### TypeScript Style Guide

Follow the [Angular Style Guide](https://angular.io/guide/styleguide):

```typescript
// Naming
interface HeroData {
  id: number;
  name: string;
}

// Single responsibility
@Component({
  selector: "app-hero-list",
  template: "./hero-list.component.html",
})
export class HeroListComponent {
  heroes: Hero[] = [];

  constructor(private heroService: HeroService) {}
}

// Use strong typing
function getHero(id: number): Observable<Hero> {
  return this.http.get<Hero>(`/api/heroes/${id}`);
}
```

### CSS/SCSS Style Guide

Follow BEM methodology with Tailwind CSS:

```scss
// Component structure
.block {
  @apply bg-white p-4;

  &__element {
    @apply text-gray-800;

    &--modifier {
      @apply font-bold;
    }
  }
}

// Variables
:root {
  --primary-color: theme("colors.blue.500");
  --secondary-color: theme("colors.gray.700");
}
```

## Testing Guidelines

### Backend Testing

Use pytest for backend tests:

```python
import pytest
from fastapi.testclient import TestClient

def test_create_user(client: TestClient):
    """Test user creation endpoint."""
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "test@example.com"
```

### Frontend Testing

Use Jasmine and Karma for frontend tests:

```typescript
describe("HeroComponent", () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeroComponent],
      providers: [HeroService],
    }).compileComponents();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load heroes", (done) => {
    component.loadHeroes();
    fixture.detectChanges();

    expect(component.heroes.length).toBeGreaterThan(0);
    done();
  });
});
```

## Documentation Guidelines

### Code Documentation

- Use descriptive variable and function names
- Add comments for complex logic
- Include JSDoc/docstring for public APIs
- Document assumptions and edge cases

### API Documentation

Use OpenAPI/Swagger annotations:

```python
@router.post("/pets", response_model=PetResponse)
async def create_pet(
    pet: PetCreate,
    current_user: User = Depends(get_current_user)
) -> PetResponse:
    """
    Create a new pet.

    Args:
        pet: Pet creation data
        current_user: Authenticated user

    Returns:
        Created pet details

    Raises:
        HTTPException: If validation fails
    """
    pass
```

### Component Documentation

Document Angular components:

```typescript
/**
 * Displays a list of user's pets with weight tracking functionality.
 *
 * @example
 * <app-pet-list [showArchived]="false"></app-pet-list>
 */
@Component({
  selector: "app-pet-list",
  templateUrl: "./pet-list.component.html",
})
export class PetListComponent {
  /** Whether to show archived pets */
  @Input() showArchived = false;
}
```

## Review Process

### Code Review Guidelines

1. **Architecture**

   - Does the change fit the project architecture?
   - Are there any potential performance issues?

2. **Functionality**

   - Does the code work as intended?
   - Are edge cases handled?
   - Is error handling appropriate?

3. **Code Quality**

   - Is the code clean and maintainable?
   - Does it follow our style guides?
   - Are there any code smells?

4. **Testing**

   - Are there appropriate tests?
   - Do all tests pass?
   - Is there sufficient coverage?

5. **Documentation**
   - Are changes documented?
   - Are comments clear and necessary?
   - Is the API documentation updated?

### Review Checklist

- [ ] Code follows style guides
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Changes are appropriate in scope
- [ ] No unnecessary dependencies added
- [ ] No sensitive information exposed
- [ ] Performance impact is considered

## Release Process

### Version Control

Follow [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for new functionality
- PATCH version for bug fixes

### Release Checklist

1. Update version numbers
2. Update CHANGELOG.md
3. Run full test suite
4. Create release branch
5. Build production assets
6. Create release tag
7. Deploy to staging
8. Verify staging deployment
9. Deploy to production
10. Monitor for issues

### Hotfix Process

1. Create hotfix branch from main
2. Fix the issue
3. Add tests
4. Update CHANGELOG.md
5. Create PR for review
6. Merge and deploy
7. Backport to development branch

## Getting Help

- Create an issue for bugs
- Discuss features in discussions
- Join our Discord community
- Check the FAQ in the wiki
- Contact maintainers directly

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

Thank you for contributing to Haustier Waage! 🎉
