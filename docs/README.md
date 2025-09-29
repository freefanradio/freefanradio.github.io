# FreeFanRadio.ca Documentation

This folder contains internal documentation for the FreeFanRadio.ca project. **This documentation is excluded from the Jekyll build and will not be deployed to the website.**

## Documentation Files

### `layout.md`
Comprehensive documentation of the mobile-first landing page design decisions, including:
- Layout architecture and positioning strategies
- Station grid responsive design
- Audio player integration challenges and solutions
- Data management and localStorage implementation
- UI/UX evolution and decision rationale

## Exclusion from Build

This `docs/` folder is explicitly excluded in `_config.yml`:
```yaml
exclude:
  - docs/
```

This ensures the documentation remains private and is not published to the live website.

## Purpose

These documents serve as:
1. **Decision Record**: Why specific technical choices were made
2. **Onboarding Guide**: Help future developers understand the codebase
3. **Troubleshooting Reference**: Solutions to common layout and integration issues
4. **Evolution History**: Track of design iterations and improvements

---

**Note**: Keep this documentation updated as the project evolves.