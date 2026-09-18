# Conventional Commits Specification

This project enforces the [Conventional Commits](https://www.conventionalcommits.org/) specification for structured, machine-readable git history.

---

## Commit Message Structure

```
<type>(<scope>): <short summary>

[optional body explaining context and rationale]

[optional footer(s)]
```

---

## Types

| Type | Description | Example |
| :--- | :--- | :--- |
| `feat` | A new user-facing feature or domain capability | `feat(engine): add CAD DXF to SVG vector conversion` |
| `fix` | A bug fix | `fix(detector): correct PNG magic number header length` |
| `refactor` | Code restructuring without changing behavior | `refactor(core): extract EngineRouterService to application layer` |
| `test` | Adding or updating unit tests or QA suites | `test(qa): add integration tests for spreadsheet conversion` |
| `docs` | Documentation changes only | `docs(readme): add bilingual setup instructions` |
| `style` | Code formatting, whitespace, zero-emoji cleanup | `style(ui): align badge colors and contrast ratios` |
| `perf` | Performance improvement (WASM / memory) | `perf(archive): streamline buffer allocations in zip bundling` |
| `chore` | Build process, tooling, or dependency updates | `chore(deps): upgrade vitest and tailwindcss plugins` |

---

## Scopes

Recommended scopes aligned with our **Hexagonal Architecture**:
- `domain`: Entities, Value Objects, Domain Ports (`Format`, `ConversionJob`, `ConversionMatrix`)
- `application`: Use Cases (`ConvertFileUseCase`, `BatchConvertUseCase`)
- `engine`: Conversion engine adapters (`image`, `document`, `cad`, `archive`, `audio-video`, `ebook`)
- `detector`: Binary magic number detection
- `ui`: Presentation layer, React components, CSS styles
- `i18n`: Spanish / English localization dictionaries
- `qa`: QA test runners and automated test suites
