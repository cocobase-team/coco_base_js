# Changelog

All notable changes to the Cocobase JavaScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-11

### Added

#### Documentation
- 📚 **Complete Docusaurus documentation site** with beginner-friendly guides
  - Comprehensive getting started guide with installation, quickstart, and configuration
  - Core concepts documentation for collections, documents, authentication, and queries
  - Detailed guides for CRUD operations, file uploads, real-time features, and more
  - Full API reference with examples
  - Framework-specific integration guides (React, Vue, Next.js, Nuxt, React Native)
  - Custom styling and responsive design

#### Code Quality Improvements
- ✨ **Comprehensive JSDoc comments** across all classes and methods
  - Detailed parameter descriptions with types
  - Return type documentation
  - Usage examples for every major method
  - Clear error documentation
  - @template annotations for generics

#### Type Definitions
- 🎯 **Enhanced TypeScript documentation** for all interfaces
  - Detailed property descriptions for CocobaseConfig, Document, Query, etc.
  - Better generic type documentation
  - Improved filter operator types
  - Comprehensive connection and user types

#### Code Structure
- 🏗️ **Improved code organization**
  - Better separation of concerns
  - Cleaner imports and exports
  - More consistent naming conventions
  - Enhanced error handling patterns

### Changed

- **Documentation Structure**: Migrated from simple markdown to full Docusaurus site
- **Code Comments**: Upgraded from basic comments to comprehensive JSDoc documentation
- **Type Safety**: Enhanced TypeScript definitions across the codebase

### Fixed

- Minor formatting inconsistencies in code
- Improved error messages and suggestions

---

## [1.1.0] - 2025-11-04

### Added

#### File Upload Features
- 📤 **File upload support for collections and authentication**

#### New Methods

**Collection Methods:**

- `createDocumentWithFiles<T>(collection, data, files)` - Create a document with file uploads

- `updateDocumentWithFiles<T>(collection, docId, data?, files?)` - Update a document with file uploads

**Authentication Methods:**

- `registerWithFiles(email, password, data?, files?)` - Register a new user with file uploads
- `updateUserWithFiles(data?, email?, password?, files?)` - Update current user with file uploads

- **Simple Field Naming**: File parameter names map directly to document fields
- **Flexible File Handling**: Support for single files and arrays
- **Automatic Storage**: Files uploaded to cloud storage with auto-generated URLs
- **Full TypeScript Support**: Type-safe method signatures with generics

- Added `docs/FileUploads.md` with complete file upload guide
- Added `docs/Relationships.md` for relationships and population
- Added `docs/QueryFiltering.md` for advanced query filtering
- Updated `README.md` with file upload examples
- Added comprehensive examples in `examples/` directory

### Backward Compatibility

- All existing methods remain unchanged
- New methods are additions, not replacements
- No breaking changes

---

## [1.0.3] - 2025-10-31

### Fixed
- Removed Content-Type header from uploadFile request for proper multipart/form-data handling
- Updated BASEURL configuration

### Changed
- Improved file upload endpoint handling

---

## [1.0.2] - 2025-10-30

### Changed
- Updated BASEURL to new API endpoint
- Fixed upload file endpoint path

---

## [1.0.1] - 2025-10-29

### Added
- Filtering support for query operations

---

## [1.0.0] - 2025-09-11

### Initial Release

#### Core Features

- **Document Operations**
  - Create, read, update, delete documents
  - List documents with filtering
  - Batch operations (create, update, delete multiple documents)
  - Count documents with filters
  - Aggregate operations (count, sum, avg, min, max)

- **Authentication**
  - Email/password registration and login
  - Google OAuth integration
  - Session management with local storage
  - User profile management
  - Role-based access control

- **Query System**
  - 12 filter operators (eq, ne, gt, gte, lt, lte, contains, startswith, endswith, in, notin, isnull)
  - AND/OR logic support
  - Multi-field OR searches
  - Named OR groups
  - Sorting and pagination
  - Field selection
  - Relationship population

- **Real-time Features**
  - WebSocket connections for live data
  - Collection watching
  - Event-based updates

- **Cloud Functions**
  - Execute server-side Python functions
  - GET and POST support
  - Payload handling
  - Automatic token authentication

- **TypeScript Support**
  - Full type definitions
  - Generic type parameters
  - Comprehensive interfaces
  - Excellent IDE autocomplete

---

## Release History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| 1.2.0 | 2025-11-11 | Comprehensive documentation, JSDoc comments, enhanced types |
| 1.1.0 | 2025-11-04 | File upload support, relationship population, advanced queries |
| 1.0.3 | 2025-10-31 | File upload fixes, BASEURL updates |
| 1.0.2 | 2025-10-30 | API endpoint updates |
| 1.0.1 | 2025-10-29 | Query filtering support |
| 1.0.0 | 2025-09-11 | Initial release with core features |

---

## Upgrade Guide

### From 1.1.0 to 1.2.0

No breaking changes. Simply update:

```bash
npm install cocobase@latest
```

Benefits:
- Better IDE autocomplete with JSDoc comments
- Comprehensive documentation site
- Improved TypeScript definitions

### From 1.0.x to 1.1.0

No breaking changes. New file upload methods available:

```typescript
// Old way (still works)
await db.createDocument('users', { name: 'John' });

// New way (with files)
await db.createDocumentWithFiles('users',
  { name: 'John' },
  { avatar: file }
);
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- 📖 [Documentation](https://docs.cocobase.buzz)
- 💬 [Discord Community](https://discord.gg/cocobase)
- 🐛 [Report Issues](https://github.com/lordace-coder/coco_base_js/issues)
- 📧 [Email Support](mailto:hello@cocobase.buzz)

---

Made with ❤️ by the Cocobase team
