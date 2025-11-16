# Cocobase JavaScript SDK Documentation

This directory contains comprehensive documentation for the Cocobase JavaScript/TypeScript SDK.

## Documentation Structure

### Getting Started
- **[intro.md](intro.md)** - Introduction and overview of Cocobase
- **[getting-started/installation.md](getting-started/installation.md)** - Installation guide with framework-specific setup
- **[getting-started/quickstart.md](getting-started/quickstart.md)** - 5-minute quickstart tutorial
- **[getting-started/configuration.md](getting-started/configuration.md)** - Complete configuration guide

### Guides
- **[guides/crud-operations.md](guides/crud-operations.md)** - Complete guide to Create, Read, Update, Delete operations
- **[Authentication.md](Authentication.md)** - Complete authentication guide (v1.3.1+)
- **[Migration-Guide.md](Migration-Guide.md)** - Upgrade from deprecated auth methods
- **[FileUploads.md](FileUploads.md)** - File upload features and usage
- **[QueryFiltering.md](QueryFiltering.md)** - Advanced query filtering with operators
- **[Relationships.md](Relationships.md)** - Relationships and population guide

### Other
- **[Message.md](Message.md)** - Messaging features
- **[Troubleshooting-ProjectId.md](Troubleshooting-ProjectId.md)** - ProjectId troubleshooting

## Documentation Features

All documentation includes:
- ✅ Beginner-friendly explanations
- ✅ TypeScript code examples
- ✅ Framework-specific guides (React, Vue, Next.js, etc.)
- ✅ Best practices and common patterns
- ✅ Troubleshooting tips
- ✅ Error handling examples

## Quick Links

- [Installation Guide](getting-started/installation.md)
- [5-Minute Quickstart](getting-started/quickstart.md)
- [Authentication Guide](Authentication.md) ⭐ New!
- [Migration Guide](Migration-Guide.md) ⭐ New!
- [CRUD Operations](guides/crud-operations.md)
- [File Uploads](FileUploads.md)
- [Query Filtering](QueryFiltering.md)

## 🆕 What's New in v1.3.1

**New Authentication Handler Architecture** - All auth methods now use the `db.auth.*` namespace:

```typescript
// ✅ New way (recommended)
await db.auth.login("user@example.com", "password");
const user = db.auth.getUser();

// ❌ Old way (deprecated but still works)
await db.login("user@example.com", "password");
const user = db.user;
```

👉 See the [Migration Guide](Migration-Guide.md) for easy upgrade instructions.

## Contributing

When adding new documentation:
1. Use clear, beginner-friendly language
2. Include TypeScript examples
3. Add code comments
4. Provide real-world use cases
5. Include error handling

## Support

- 🐛 [Report Issues](https://github.com/lordace-coder/coco_base_js/issues)
- 💬 [Discord Community](https://discord.gg/cocobase)
- 📧 [Email](mailto:hello@cocobase.buzz)
