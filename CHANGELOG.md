# COCOBASE SDK - File Upload Feature Summary

## ✨ New Features Added

The COCOBASE JavaScript/TypeScript SDK now supports easy file uploads for both collections and user authentication!

---

## 📦 New Methods

### Collection Methods

#### `createDocumentWithFiles<T>(collection, data, files)`

Create a document with file uploads.

```typescript
await db.createDocumentWithFiles(
  "users",
  { name: "John Doe", email: "john@example.com" },
  { avatar: avatarFile, cover_photo: coverFile }
);
```

#### `updateDocumentWithFiles<T>(collection, docId, data?, files?)`

Update a document with file uploads.

```typescript
await db.updateDocumentWithFiles(
  "users",
  "user-123",
  { bio: "Updated bio" },
  { avatar: newAvatarFile }
);
```

### Authentication Methods

#### `registerWithFiles(email, password, data?, files?)`

Register a new user with file uploads.

```typescript
await db.registerWithFiles(
  "john@example.com",
  "password123",
  { username: "johndoe" },
  { avatar: avatarFile }
);
```

#### `updateUserWithFiles(data?, email?, password?, files?)`

Update current user with file uploads.

```typescript
await db.updateUserWithFiles({ bio: "Updated" }, undefined, undefined, {
  avatar: newAvatarFile,
});
```

---

## 🎯 Key Features

### Simple Field Naming

- Name your file parameter = document field name
- `{ avatar: file }` → Document gets `avatar` field with URL
- `{ gallery: [file1, file2] }` → Document gets `gallery` array with URLs

### Flexible File Handling

- ✅ Single files: `{ avatar: file }`
- ✅ Multiple files (array): `{ gallery: [file1, file2, file3] }`
- ✅ Mixed: `{ avatar: file, gallery: [file1, file2] }`

### Automatic Storage

- Files uploaded to cloud storage
- URLs automatically returned in response
- Stored in project-specific buckets

### Full TypeScript Support

- Type-safe method signatures
- Generic type parameters
- Proper error handling

---

## 📚 Documentation

### New Documentation Files

1. **`docs/FileUploads.md`** - Complete file upload guide

   - Collection file uploads
   - User authentication with files
   - React examples
   - Best practices

2. **`docs/Relationships.md`** - Relationships & population guide

   - Setting up relationships
   - Population strategies
   - Filtering by relationships
   - Field selection

3. **`docs/QueryFiltering.md`** - Advanced query filtering
   - 12 operators (eq, ne, gt, gte, lt, lte, contains, etc.)
   - AND/OR logic
   - Multi-field OR
   - Named OR groups

### Updated Documentation

- **`README.md`** - Added file upload section
- **`examples/file-upload-examples.ts`** - Comprehensive examples
- **`examples/advanced-queries.ts`** - Query examples with relationships

---

## 🔧 Implementation Details

### How It Works

1. **FormData Construction**: Files are added to FormData with field names
2. **No Manual Headers**: Content-Type is automatically set by the browser
3. **Server Processing**: Server maps file names to document fields
4. **URL Generation**: Uploaded files get unique URLs
5. **Response**: Document returned with file URLs in specified fields

### Example Request Flow

```typescript
// Client code
await db.createDocumentWithFiles('users',
  { name: 'John' },
  { avatar: file }
);

// Generates FormData:
// - data: {"name":"John"}
// - avatar: <file blob>

// Server response:
{
  id: 'user-123',
  data: {
    name: 'John',
    avatar: 'https://storage.cocobase.buzz/.../avatar.jpg'
  }
}
```

---

## 🎨 Usage Examples

### Simple Avatar Upload

```typescript
const avatarFile = document.querySelector("#avatar").files[0];

await db.createDocumentWithFiles(
  "users",
  { name: "John Doe" },
  { avatar: avatarFile }
);
```

### Product with Gallery

```typescript
const mainImage = document.querySelector("#main").files[0];
const gallery = Array.from(document.querySelector("#gallery").files);

await db.createDocumentWithFiles(
  "products",
  { name: "Laptop", price: 1299 },
  {
    main_image: mainImage,
    gallery: gallery,
  }
);
```

### User Registration

```typescript
await db.registerWithFiles(
  "john@example.com",
  "password123",
  { username: "johndoe" },
  { avatar: avatarFile, cover_photo: coverFile }
);
```

### Update Avatar Only

```typescript
await db.updateUserWithFiles(undefined, undefined, undefined, {
  avatar: newAvatarFile,
});
```

---

## 🚀 Benefits

1. **Simplicity**: Just name your file fields
2. **No Complex Mapping**: No JSON indices or field mapping needed
3. **TypeScript Support**: Full type safety
4. **Flexible**: Single or multiple files
5. **Integrated**: Works seamlessly with auth and collections
6. **Automatic**: Storage and URL generation handled automatically

---

## 📋 Migration Guide

### Before (No File Support)

```typescript
// Had to manually upload files separately
const fileUrl = await uploadFile(file);
await db.createDocument("users", {
  name: "John",
  avatar: fileUrl, // Manual URL
});
```

### After (With File Support)

```typescript
// One call, automatic upload and URL generation
await db.createDocumentWithFiles(
  "users",
  { name: "John" },
  { avatar: file } // Automatic!
);
```

---

## ✅ Backward Compatibility

All existing methods still work:

- `createDocument()` - No breaking changes
- `updateDocument()` - No breaking changes
- `register()` - No breaking changes
- `updateUser()` - No breaking changes

New methods are additions, not replacements!

---

## 🧪 Testing

Run examples:

```bash
npm run test
```

Check examples:

- `examples/file-upload-examples.ts`
- `examples/advanced-queries.ts`
- `test/query-filter.test.ts`

---

## 📦 Package Updates

### Files Modified

- `src/core/core.ts` - Added file upload methods
- `src/core/file.ts` - Fixed multipart boundary issue
- `src/core/functions.ts` - Updated base URL
- `src/types/types.ts` - Added populate and select to Query interface
- `src/utils/utils.ts` - Enhanced buildFilterQuery for relationships
- `src/index.ts` - Exported new types

### Files Added

- `docs/FileUploads.md`
- `docs/Relationships.md`
- `docs/QueryFiltering.md`
- `examples/file-upload-examples.ts`
- `examples/advanced-queries.ts`
- `test/query-filter.test.ts`

---

## 🎯 Next Steps

1. **Build the package**: `npm run build`
2. **Test thoroughly**: Use the examples
3. **Update version**: Bump package version
4. **Publish**: `npm publish`
5. **Update docs**: Update online documentation

---

## 📞 Support

For issues or questions:

- GitHub Issues: [Report bugs](https://github.com/lordace-coder/coco_base_js/issues)
- Documentation: See `docs/` directory
- Examples: See `examples/` directory

---

**Version**: 1.1.0 (Suggested)  
**Release Date**: November 4, 2025  
**Breaking Changes**: None  
**New Features**: File uploads, relationships, advanced filtering
