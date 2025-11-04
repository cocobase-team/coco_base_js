# File Upload Guide - JavaScript/TypeScript SDK

Complete guide for uploading files in COCOBASE using the JavaScript/TypeScript SDK.

## 📖 Table of Contents

1. [Collection File Uploads](#collection-file-uploads)
2. [User Authentication with Files](#user-authentication-with-files)
3. [React Examples](#react-examples)
4. [Best Practices](#best-practices)

---

## Collection File Uploads

Upload files to collection documents using simple field naming.

### Basic Usage

```typescript
import { Cocobase } from "cocobase";

const db = new Cocobase({ apiKey: "your-api-key" });

// Upload avatar to user profile
await db.createDocumentWithFiles(
  "users",
  {
    name: "John Doe",
    email: "john@example.com",
    bio: "Software developer",
  },
  {
    avatar: avatarFile, // Single file
    cover_photo: coverPhotoFile, // Another single file
  }
);
```

**Response:**

```json
{
  "id": "user-123",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "avatar": "https://storage.cocobase.buzz/.../avatar.jpg",
    "cover_photo": "https://storage.cocobase.buzz/.../cover.jpg"
  }
}
```

### Multiple Files (Array)

Upload multiple files to the same field to create an array:

```typescript
// Product with gallery
await db.createDocumentWithFiles(
  "products",
  {
    name: "Laptop",
    price: 1299,
    description: "High-performance laptop",
  },
  {
    main_image: mainImageFile,
    gallery: [img1File, img2File, img3File], // Array of files
  }
);
```

**Response:**

```json
{
  "id": "product-123",
  "data": {
    "name": "Laptop",
    "price": 1299,
    "main_image": "https://.../main.jpg",
    "gallery": [
      "https://.../img1.jpg",
      "https://.../img2.jpg",
      "https://.../img3.jpg"
    ]
  }
}
```

### Update Documents with Files

```typescript
// Update only avatar
await db.updateDocumentWithFiles(
  "users",
  "user-123",
  undefined, // No data changes
  {
    avatar: newAvatarFile,
  }
);

// Update data AND files
await db.updateDocumentWithFiles(
  "users",
  "user-123",
  { bio: "Updated bio" }, // Data changes
  {
    avatar: newAvatarFile,
    cover_photo: newCoverFile,
  }
);
```

---

## User Authentication with Files

### Register with Files

Create a new user account with profile pictures:

```typescript
// Basic registration with avatar
await db.registerWithFiles(
  "john@example.com",
  "password123",
  {
    username: "johndoe",
    full_name: "John Doe",
    bio: "Developer",
  },
  {
    avatar: avatarFile,
  }
);

// Registration with avatar and cover photo
await db.registerWithFiles(
  "jane@example.com",
  "password456",
  {
    username: "janedoe",
    full_name: "Jane Doe",
  },
  {
    avatar: avatarFile,
    cover_photo: coverFile,
  }
);
```

**Response:**

```typescript
{
  id: 'user-123',
  email: 'john@example.com',
  username: 'johndoe',
  full_name: 'John Doe',
  avatar: 'https://storage.cocobase.buzz/.../avatar.jpg',
  cover_photo: 'https://storage.cocobase.buzz/.../cover.jpg',
  created_at: '2025-11-04T10:00:00Z'
}
```

### Update Current User with Files

```typescript
// Update only avatar
await db.updateUserWithFiles(undefined, undefined, undefined, {
  avatar: newAvatarFile,
});

// Update bio and avatar
await db.updateUserWithFiles(
  { bio: "Updated bio", location: "New York" },
  undefined,
  undefined,
  { avatar: newAvatarFile }
);

// Update email, data, and files
await db.updateUserWithFiles(
  { username: "newusername" },
  "newemail@example.com",
  undefined,
  { avatar: newAvatar, cover_photo: newCover }
);
```

---

## React Examples

### User Registration Form

```tsx
import React, { useState } from "react";
import { Cocobase } from "cocobase";

const db = new Cocobase({ apiKey: "your-api-key" });

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await db.registerWithFiles(
        email,
        password,
        { username },
        avatarFile ? { avatar: avatarFile } : undefined
      );

      console.log("User created:", user);
      alert("Sign up successful!");

      // Redirect or update UI
    } catch (error) {
      console.error("Sign up failed:", error);
      alert("Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Preview */}
        {avatarPreview && (
          <div className="flex justify-center mb-4">
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
        )}

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full"
          />
        </div>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
```

### Update Profile Picture

```tsx
import React, { useState } from "react";
import { Cocobase } from "cocobase";

const db = new Cocobase({ apiKey: "your-api-key" });

function UpdateAvatarButton() {
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const updatedUser = await db.updateUserWithFiles(
        undefined,
        undefined,
        undefined,
        { avatar: file }
      );

      console.log("Avatar updated:", updatedUser.avatar);
      alert("Avatar updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      {loading ? "Uploading..." : "Change Avatar"}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={loading}
      />
    </label>
  );
}
```

### Product Form with Gallery

```tsx
import React, { useState } from "react";
import { Cocobase } from "cocobase";

const db = new Cocobase({ apiKey: "your-api-key" });

function CreateProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const files: Record<string, File | File[]> = {};

      if (mainImage) {
        files.main_image = mainImage;
      }

      if (galleryImages.length > 0) {
        files.gallery = galleryImages;
      }

      const product = await db.createDocumentWithFiles(
        "products",
        {
          name,
          price: parseFloat(price),
          status: "active",
        },
        files
      );

      console.log("Product created:", product);
      alert("Product created successfully!");

      // Reset form
      setName("");
      setPrice("");
      setMainImage(null);
      setGalleryImages([]);
    } catch (error) {
      console.error("Product creation failed:", error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Create Product</h2>

      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        step="0.01"
        className="w-full px-3 py-2 border rounded"
      />

      <div>
        <label className="block text-sm font-medium mb-2">Main Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setMainImage(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Gallery Images (Multiple)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="w-full"
        />
        {galleryImages.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {galleryImages.length} image(s) selected
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
```

---

## Best Practices

### ✅ DO's

1. **Validate file types and sizes before upload**

   ```typescript
   const validateImage = (file: File): boolean => {
     const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
     const maxSize = 5 * 1024 * 1024; // 5MB

     if (!validTypes.includes(file.type)) {
       alert("Please upload a valid image file");
       return false;
     }

     if (file.size > maxSize) {
       alert("File size must be less than 5MB");
       return false;
     }

     return true;
   };
   ```

2. **Show upload progress with loading states**

   ```typescript
   const [loading, setLoading] = useState(false);

   const handleUpload = async () => {
     setLoading(true);
     try {
       await db.createDocumentWithFiles(/* ... */);
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Compress images before upload**

   ```typescript
   import imageCompression from "browser-image-compression";

   const compressImage = async (file: File): Promise<File> => {
     const options = {
       maxSizeMB: 1,
       maxWidthOrHeight: 1920,
       useWebWorker: true,
     };
     return await imageCompression(file, options);
   };
   ```

4. **Show image previews**

   ```typescript
   const [preview, setPreview] = useState<string | null>(null);

   const handleFileChange = (file: File) => {
     const reader = new FileReader();
     reader.onloadend = () => {
       setPreview(reader.result as string);
     };
     reader.readAsDataURL(file);
   };
   ```

5. **Handle errors gracefully**
   ```typescript
   try {
     await db.createDocumentWithFiles(/* ... */);
   } catch (error) {
     if (error.message.includes("Storage limit")) {
       alert("Storage limit exceeded. Please upgrade your plan.");
     } else if (error.message.includes("Invalid file")) {
       alert("Invalid file format. Please use JPG, PNG, or WebP.");
     } else {
       alert("Upload failed. Please try again.");
     }
   }
   ```

### ❌ DON'Ts

1. **Don't upload without validation**

   ```typescript
   // Bad
   await db.createDocumentWithFiles(/* ... */, { avatar: anyFile });

   // Good
   if (validateImage(file)) {
     await db.createDocumentWithFiles(/* ... */, { avatar: file });
   }
   ```

2. **Don't upload huge uncompressed files**

   ```typescript
   // Bad
   await db.createDocumentWithFiles(/* ... */, { photo: largeFile });

   // Good
   const compressed = await compressImage(largeFile);
   await db.createDocumentWithFiles(/* ... */, { photo: compressed });
   ```

3. **Don't forget to handle network errors**

   ```typescript
   // Bad
   const result = await db.createDocumentWithFiles(/* ... */);

   // Good
   try {
     const result = await db.createDocumentWithFiles(/* ... */);
   } catch (error) {
     // Handle error
   }
   ```

---

## Field Naming Convention

Use descriptive field names that match your use case:

```typescript
// User profiles
{ avatar: file, cover_photo: file, profile_picture: file }

// Products
{ main_image: file, thumbnail: file, gallery: [files] }

// Blog posts
{ featured_image: file, inline_images: [files] }

// Documents
{ id_document: file, verification_photo: file }

// Real estate
{ main_photo: file, photos: [files], floor_plan: file }
```

---

## TypeScript Support

Full type safety with file uploads:

```typescript
interface UserData {
  username: string;
  bio?: string;
  location?: string;
}

interface ProductData {
  name: string;
  price: number;
  description: string;
}

// Type-safe document creation
const user = await db.createDocumentWithFiles<UserData>(
  "users",
  { username: "johndoe", bio: "Developer" },
  { avatar: avatarFile }
);

// Type-safe product creation
const product = await db.createDocumentWithFiles<ProductData>(
  "products",
  { name: "Laptop", price: 1299, description: "..." },
  { main_image: imageFile, gallery: [img1, img2, img3] }
);
```

---

## Summary

COCOBASE file uploads are:

- ✅ **Simple**: Just name your file fields
- ✅ **Flexible**: Single files or arrays
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Integrated**: Works with auth and collections
- ✅ **Automatic**: URLs returned in response
- ✅ **Secure**: Stored in project-specific storage

Upload files effortlessly! 🚀

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025
