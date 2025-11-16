# Changelog

All notable changes to the Cocobase JavaScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2025-11-16

### ✨ Added

#### Authentication Handler Architecture

- 🔐 **Dedicated Auth Handler**: Complete separation of authentication logic into `AuthHandler` class
- 🏗️ **Clean Architecture**: All auth methods now accessible via `db.auth.*` namespace
- 📚 **Comprehensive JSDoc**: Full documentation for all auth methods with examples
- 🔄 **Backward Compatibility**: Core auth methods marked as `@deprecated` but still functional

#### Enhanced Authentication Features

- 👤 **Improved User Management**: Better user state management with `setUser()` method
- 🔑 **Dynamic Token Access**: Cloud functions now use getter functions for latest tokens
- 🛡️ **Better Error Handling**: Enhanced error messages and suggestions for auth operations
- 📊 **User Listing**: `listUsers()` method with full query support (filters, sorting, pagination)

#### Module System Improvements

- 📦 **ES Module Compliance**: Updated all imports to use `.js` extensions for proper ESM support
- 🔧 **Build System**: Improved TypeScript compilation for both ESM and CommonJS outputs

### 🔄 Changed

#### Authentication API Evolution

```typescript
// Old way (deprecated but still works)
await db.login("user@example.com", "password");
const token = db.getToken();
const user = db.user;

// New way (recommended)
await db.auth.login("user@example.com", "password");
const token = db.auth.getToken();
const user = db.auth.getUser();
```

#### Core Architecture

- **Auth Separation**: Authentication logic moved from `Cocobase` class to dedicated `AuthHandler`
- **Dependency Injection**: Auth handler properly initialized with configuration
- **State Management**: Improved token and user state synchronization

### 🐛 Fixed

#### Authentication Issues

- **Token Synchronization**: Fixed stale token issues in cloud functions
- **User State**: Better user object persistence and retrieval
- **Session Management**: Improved local storage handling for auth state

#### Module Resolution

- **Import Paths**: Fixed ES module import issues with proper `.js` extensions
- **Type Definitions**: Corrected type imports for better TypeScript support

### 📚 Documentation

- **Auth Handler Guide**: Comprehensive documentation for the new auth architecture
- **Migration Guide**: Clear instructions for upgrading from deprecated methods
- **API Examples**: Updated examples showing both old and new auth patterns

### 🔧 Technical Improvements

- **Code Organization**: Better separation of concerns between core SDK and auth functionality
- **Type Safety**: Enhanced TypeScript definitions for auth-related types
- **Error Handling**: More descriptive error messages for authentication failures
- **Performance**: Optimized auth state management and token handling

### 🤝 Backward Compatibility

- ✅ **Zero Breaking Changes**: All existing code continues to work
- ⚠️ **Deprecation Warnings**: Clear guidance to migrate to new `db.auth.*` methods
- 🔄 **Gradual Migration**: Users can upgrade at their own pace
- 🛡️ **Safety Net**: Deprecated methods remain functional during transition period

---

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

| Version | Date       | Key Features                                                              |
| ------- | ---------- | ------------------------------------------------------------------------- |
| 1.3.1   | 2025-11-16 | Auth handler architecture, ES module improvements, backward compatibility |
| 1.2.0   | 2025-11-11 | Comprehensive documentation, JSDoc comments, enhanced types               |
| 1.1.0   | 2025-11-04 | File upload support, relationship population, advanced queries            |
| 1.0.3   | 2025-10-31 | File upload fixes, BASEURL updates                                        |
| 1.0.2   | 2025-10-30 | API endpoint updates                                                      |
| 1.0.1   | 2025-10-29 | Query filtering support                                                   |
| 1.0.0   | 2025-09-11 | Initial release with core features                                        |

---

## Upgrade Guide

### From 1.2.0 to 1.3.1

No breaking changes. Simply update:

```bash
npm install cocobase@latest
```

**Recommended Migration (Optional):**

```typescript
// Old way (still works, shows deprecation warning)
await db.login("user@example.com", "password");
const user = db.user;
const token = db.getToken();

// New way (recommended)
await db.auth.login("user@example.com", "password");
const user = db.auth.getUser();
const token = db.auth.getToken();
```

Benefits:

- Better code organization and maintainability
- Improved TypeScript support
- Enhanced error handling
- Future-proof architecture

### From 1.1.0 to 1.2.0

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
