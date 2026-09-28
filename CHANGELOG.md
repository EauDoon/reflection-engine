# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Explicit NOTICE file crediting upstream author Kevin Rose.
- SECURITY.md describing how to report vulnerabilities privately.
- CONTRIBUTING.md with a brief pull request welcome note.
- This CHANGELOG file.

### Fixed

- `redact` no longer reports success when the pretty-printed corpus exceeds the 1 MiB JSON input limit.
- Markdown run comparison now reports when shared sources or answers were reordered.