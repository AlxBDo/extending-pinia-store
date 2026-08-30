# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.1.2] - 2026-08-30

### Added
- Added per-parent configuration via `ParentStoreOptions` (3rd argument in `new ParentStore(id, store, parentStoreOptions)`), supporting `actionsToRename`, `propertiesToRename`, and `actionsToExtends`.
- Added collision detection and diagnostics via `PluginConsole.error` when parent actions or state properties conflict with existing child store members.
- Added support for asynchronous action chaining in `StoreExtension.extendsAction` (runs parent before child, awaits promise resolution, propagates errors, and returns child action result).
- Added `type-check` and `audit` jobs to GitHub Actions CI workflow.

### Changed
- Improved priority resolution so per-parent `ParentStoreOptions` take precedence over global store-level options for action and property renaming.
- Deprecated top-level `actionsToRename` and `propertiesToRename` in `PluginStoreOptions` in favor of per-parent `ParentStoreOptions`.
- Strengthened TypeScript types across public APIs (`ParentStore`, `StoreExtension`, `ExtendedStore`, `CollectionStoreMethods`, `arrayObjectFindBy`, `arrayObjectFindAllBy`), reducing `any` and `AnyObject` usages.
- Updated unit test suite to test parent-level options, collision handling, and action chaining.

## [0.1.1] - 2026-08-09

### Changed
- Replacing getStore from pinia-plugin-store-storage with getEnhancedStore from pinia-plugin-subscription

## [0.1.0] - 2026-08-09

### Added
- Added a GitHub Actions workflow to run the test suite on every push and pull request.
- Added npm provenance-based publishing for improved supply-chain security.
- Added a CODEOWNERS file to require maintainer review for repository changes.
- Included documentation files in the published npm tarball to improve package quality signals.

### Changed
- Improved package metadata for npm publishing and discoverability.
- Documented the release and publishing process in the README.
- Added explicit package publishing configuration for public access and provenance.

### Security
- Improved release transparency by publishing with npm provenance.
- Added security and contribution documentation to the package contents.