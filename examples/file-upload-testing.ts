/**
 * File Upload Testing Examples
 *
 * This file demonstrates how to test file upload functionality in different environments.
 * Run with: npx tsx examples/file-upload-testing.ts
 */

import { Cocobase } from "../src/index";

console.log("📚 File Upload Usage Examples:\n");

// Example 1: Create document with files
console.log("1. Create Document with Files:");
console.log(`
const documentData = {
  title: "My Blog Post",
  content: "Post content...",
  published: true
};

const files = {
  featuredImage: imageFile,        // Single file
  attachments: [pdfFile, docFile]  // Multiple files as array
};

const result = await db.createDocumentWithFiles("posts", documentData, files);
`);

// Example 2: Update document with files
console.log("2. Update Document with Files:");
console.log(`
const updateData = {
  title: "Updated Title",
  content: "Updated content..."
};

const files = {
  featuredImage: newImageFile  // Replace existing file
};

const updated = await db.updateDocumentWithFiles("posts", "doc-id", updateData, files);
`);

// Example 3: Register user with files
console.log("3. Register User with Files:");
console.log(`
const userData = {
  username: "johndoe",
  fullName: "John Doe",
  bio: "Software developer"
};

const files = {
  avatar: avatarFile,        // Profile picture
  coverPhoto: coverFile      // Cover photo
};

const user = await db.registerWithFiles("john@example.com", "password123", userData, files);
`);

// Example 4: Update user with files
console.log("4. Update User with Files:");
console.log(`
const updateData = {
  bio: "Updated bio",
  website: "https://johndoe.com"
};

const files = {
  avatar: newAvatarFile  // New profile picture
};

const updatedUser = await db.updateUserWithFiles(updateData, undefined, undefined, files);
`);

console.log("\n🔧 Testing Setup Notes:");
console.log(
  "- File upload tests require browser environment or Node.js with form-data library"
);
console.log("- Real file testing needs actual File objects or file streams");
console.log("- Network requests should be mocked in unit tests");
console.log("- Integration tests would upload to a test server");

console.log("\n🚀 Running tests...\n");

// Example 1: Testing file uploads in a browser environment
export async function testFileUploadsInBrowser() {
  console.log("🌐 Browser File Upload Test");

  // Initialize Cocobase
  const db = new Cocobase({
    apiKey: "ybHxWKqV21F4EPgi1hgqq3xrltp4g6OwQNmGvO7d",
    baseURL: "http://127.0.0.1:8000",
  });

  // Simulate file input (in real browser, this would be from <input type="file">)
  // const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  // const file = fileInput.files[0];

  // For testing, create a mock file
  const mockFile = new File(["test content"], "test.txt", {
    type: "text/plain",
  });

  // Test 1: Create document with file
  try {
    const documentData = {
      title: "Test Document",
      description: "Document created with file upload",
    };

    const files = {
      attachment: mockFile,
    };

    console.log("📤 Creating document with file...");
    const result = await db.createDocumentWithFiles(
      "documents",
      documentData,
      files
    );
    console.log("✅ Document created:", result);
  } catch (error) {
    console.log("❌ Create document failed:", error.message);
  }

  // Test 2: Register user with profile picture
  try {
    const userData = {
      name: "Test User",
    };

    const files = {
      avatar: mockFile,
    };

    console.log("👤 Registering user with profile picture...");
    const user = await db.registerWithFiles(
      "test@example.com",
      "testpass123",
      userData,
      files
    );
    console.log("✅ User registered:", user);
  } catch (error) {
    console.log("❌ User registration failed:", error.message);
  }
}

// Example 2: Testing file uploads in Node.js environment
export async function testFileUploadsInNode() {
  console.log("🟢 Node.js File Upload Test");

  // In Node.js, you need to use the 'form-data' package
  // npm install form-data
  // const FormData = require('form-data');
  // const fs = require('fs');

  const db = new Cocobase({
    apiKey: "ybHxWKqV21F4EPgi1hgqq3xrltp4g6OwQNmGvO7d",
    baseURL: "http://127.0.0.1:8000",
  });

  try {
    // In Node.js, create file streams
    // const fs = require('fs');
    // const fileStream = fs.createReadStream('./test-file.txt');

    // For this example, we'll use mock data
    const documentData = {
      title: "Node.js Upload Test",
      description: "Testing file upload from Node.js",
    };

    // In real Node.js usage, you would create a file buffer or stream
    const mockFile = new File(["test content"], "test-file.txt", {
      type: "text/plain",
    });
    const files = {
      document: mockFile,
    };

    console.log("📤 Creating document with file from Node.js...");
    const result = await db.createDocumentWithFiles(
      "documents",
      documentData,
      files
    );
    console.log("✅ Document created:", result);
  } catch (error) {
    console.log("❌ Node.js upload failed:", error.message);
  }
}

// Example 3: Testing multiple file uploads
export async function testMultipleFileUploads() {
  console.log("📁 Multiple File Upload Test");

  const db = new Cocobase({
    apiKey: "ybHxWKqV21F4EPgi1hgqq3xrltp4g6OwQNmGvO7d",
    baseURL: "http://127.0.0.1:8000",
  });

  try {
    const documentData = {
      title: "Multiple Files Test",
      description: "Testing multiple file uploads",
    };

    // Add multiple files
    const file1 = new File(["content 1"], "file1.txt", { type: "text/plain" });
    const file2 = new File(["content 2"], "file2.txt", { type: "text/plain" });
    const imageFile = new File(["fake image"], "image.jpg", {
      type: "image/jpeg",
    });

    const files = {
      attachments: [file1, file2], // Array of files
      thumbnail: imageFile,
    };

    console.log("📤 Creating document with multiple files...");
    const result = await db.createDocumentWithFiles(
      "posts",
      documentData,
      files
    );
    console.log("✅ Document with multiple files created:", result);
  } catch (error) {
    console.log("❌ Multiple files upload failed:", error.message);
  }
}

// Example 4: Testing file upload with user authentication
export async function testAuthenticatedFileUploads() {
  console.log("🔐 Authenticated File Upload Test");

  const db = new Cocobase({
    apiKey: "ybHxWKqV21F4EPgi1hgqq3xrltp4g6OwQNmGvO7d",
    baseURL: "http://127.0.0.1:8000",
  });

  try {
    // First, login the user
    console.log("🔑 Logging in user...");
    const loginResult = await db.login("user@example.com", "password");
    console.log("✅ User logged in");

    // Now upload files (will include auth token automatically)
    const documentData = {
      title: "Authenticated Upload",
      content: "This upload includes authentication",
    };

    const file = new File(["secure content"], "secure.txt", {
      type: "text/plain",
    });
    const files = {
      document: file,
    };

    console.log("📤 Creating authenticated document with file...");
    const result = await db.createDocumentWithFiles(
      "secure-documents",
      documentData,
      files
    );
    console.log("✅ Authenticated document created:", result);
  } catch (error) {
    console.log("❌ Authenticated upload failed:", error.message);
  }
}


// Example 6: Testing file size limits and validation
export async function testFileValidation() {
  console.log("📏 File Validation Test");

  const db = new Cocobase({
    apiKey: "ybHxWKqV21F4EPgi1hgqq3xrltp4g6OwQNmGvO7d",
    baseURL: "http://127.0.0.1:8000",
  });

  try {
    // Test with empty data and files
    await db.createDocumentWithFiles("documents", {}, {});
    console.log("❌ Should have failed with empty data and files");
  } catch (error) {
    console.log("✅ Correctly validated empty data and files:", error.message);
  }

  try {
    // Test with only files, no regular data
    const files = {
      document: new File(["test"], "test.txt"),
    };
    // This might succeed depending on your schema requirements
    const result = await db.createDocumentWithFiles("documents", {}, files);
    console.log("✅ File-only upload result:", result);
  } catch (error) {
    console.log("ℹ️ File-only upload failed (may be expected):", error.message);
  }
}

// Main test runner
export async function runAllFileUploadTests() {
  console.log("🚀 Running All File Upload Tests\n");
  console.log("=".repeat(60));

  // Note: These tests will fail in Node.js environment without proper setup
  // They are designed to work in a browser or with proper Node.js form-data setup

  try {
    await testFileUploadsInBrowser();
    console.log("-".repeat(40));
  } catch (error) {
    console.log("Browser test failed:", error.message);
  }

  try {
    await testMultipleFileUploads();
    console.log("-".repeat(40));
  } catch (error) {
    console.log("Multiple files test failed:", error.message);
  }


  try {
    await testFileValidation();
    console.log("-".repeat(40));
  } catch (error) {
    console.log("Validation test failed:", error.message);
  }

  console.log("=".repeat(60));
  console.log("📝 Notes:");
  console.log("- Some tests may fail in Node.js without 'form-data' package");
  console.log("- Real file uploads require actual File objects or streams");
  console.log("- Network tests need valid API credentials");
  console.log("- Consider using test servers for integration testing");
}

// If running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllFileUploadTests().catch(console.error);
}
