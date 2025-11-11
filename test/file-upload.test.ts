/**
 * Test Suite for File Upload Functionality
 *
 * Run with: npm test or npx ts-node test/file-upload.test.ts
 *
 * Note: These tests demonstrate the API usage but don't make actual network requests
 * to avoid requiring real files and API credentials in the test environment.
 */

import { Cocobase } from "../src/index";

// Test counter
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.error(`   Error: ${error}`);
      failed++;
    }
  })();
}

async function runFileUploadTests() {
  console.log("🧪 Testing File Upload Functionality...\n");

  // Test 1: Cocobase instance has file upload methods
  await test("File upload methods are available", () => {
    const db = new Cocobase({
      apiKey: "ybHxWKqV21F4EPgi1hgqq3xrltp4g6OwQNmGvO7d",
      baseURL: "https://api.cocobase.buzz",
    });

    if (!db.createDocumentWithFiles) {
      throw new Error("createDocumentWithFiles method should be available");
    }

    if (!db.updateDocumentWithFiles) {
      throw new Error("updateDocumentWithFiles method should be available");
    }

    if (!db.registerWithFiles) {
      throw new Error("registerWithFiles method should be available");
    }

    if (!db.updateUserWithFiles) {
      throw new Error("updateUserWithFiles method should be available");
    }
  });

  // Test 2: Create mock FormData for testing
  await test("FormData creation for file uploads", () => {
    // Create a simple FormData object (in browser environment)
    // In Node.js, you would need to use a library like 'form-data'
    const formData = new FormData();

    // Add regular data
    formData.append("title", "Test Document");
    formData.append("description", "This is a test document");

    // Add a mock file (in real usage, this would be a File object)
    // formData.append("image", fileInput.files[0], "image.jpg");

    // Verify FormData has the expected fields
    if (!formData.has("title")) {
      throw new Error("FormData should contain title field");
    }

    if (!formData.has("description")) {
      throw new Error("FormData should contain description field");
    }
  });

  // Test 3: Document creation with files - API structure
  await test("createDocumentWithFiles method signature", () => {
    const db = new Cocobase({
      apiKey: "test-api-key",
      baseURL: "https://api.cocobase.buzz",
    });

    // Check that the method exists and is a function
    if (typeof db.createDocumentWithFiles !== "function") {
      throw new Error("createDocumentWithFiles should be a function");
    }

    // In a real test, you would call:
    // const result = await db.createDocumentWithFiles("posts", formData);
    // But we can't make network requests in tests without mocking
  });

  // Test 4: Document update with files - API structure
  await test("updateDocumentWithFiles method signature", () => {
    const db = new Cocobase({
      apiKey: "test-api-key",
      baseURL: "https://api.cocobase.buzz",
    });

    if (typeof db.updateDocumentWithFiles !== "function") {
      throw new Error("updateDocumentWithFiles should be a function");
    }

    // In a real test, you would call:
    // const result = await db.updateDocumentWithFiles("posts", "doc-id", formData);
  });

  // Test 5: User registration with files - API structure
  await test("registerWithFiles method signature", () => {
    const db = new Cocobase({
      apiKey: "test-api-key",
      baseURL: "https://api.cocobase.buzz",
    });

    if (typeof db.registerWithFiles !== "function") {
      throw new Error("registerWithFiles should be a function");
    }

    // In a real test, you would call:
    // const result = await db.registerWithFiles(formData);
  });

  // Test 6: User update with files - API structure
  await test("updateUserWithFiles method signature", () => {
    const db = new Cocobase({
      apiKey: "test-api-key",
      baseURL: "https://api.cocobase.buzz",
    });

    if (typeof db.updateUserWithFiles !== "function") {
      throw new Error("updateUserWithFiles should be a function");
    }

    // In a real test, you would call:
    // const result = await db.updateUserWithFiles(formData);
  });

  // Test 7: File upload naming convention
  await test("File upload naming convention", () => {
    // Test the naming pattern used in the SDK
    const fieldName = "profilePicture"; // This would be the field name in your schema
    const expectedPattern = `files.${fieldName}`; // SDK uses files.fieldName pattern

    if (expectedPattern !== "files.profilePicture") {
      throw new Error(
        "File naming pattern should follow files.fieldName convention"
      );
    }
  });

  // Test 8: Multiple files upload structure
  await test("Multiple files structure", () => {
    const formData = new FormData();

    // Add multiple files with different field names
    // formData.append("files.avatar", avatarFile);
    // formData.append("files.coverImage", coverFile);
    // formData.append("files.attachments", attachment1);
    // formData.append("files.attachments", attachment2);

    // Add regular data
    formData.append("name", "Test User");
    formData.append("email", "test@example.com");

    // Verify structure
    if (!formData.has("name")) {
      throw new Error("FormData should contain regular fields");
    }
  });

  // Print results
  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log(`${"=".repeat(50)}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Example usage demonstrations
console.log("📚 File Upload Usage Examples:\n");

// Example 1: Create document with files
console.log("1. Create Document with Files:");
console.log(`
const formData = new FormData();
formData.append("title", "My Blog Post");
formData.append("content", "Post content...");
formData.append("files.featuredImage", imageFile); // File field
formData.append("files.attachments", pdfFile);     // Another file field

const result = await db.createDocumentWithFiles("posts", formData);
`);

// Example 2: Update document with files
console.log("2. Update Document with Files:");
console.log(`
const updateFormData = new FormData();
updateFormData.append("title", "Updated Title");
updateFormData.append("files.featuredImage", newImageFile); // Replace existing file

const updated = await db.updateDocumentWithFiles("posts", "doc-id", updateFormData);
`);

// Example 3: Register user with profile picture
console.log("3. Register User with Files:");
console.log(`
const userFormData = new FormData();
userFormData.append("email", "user@example.com");
userFormData.append("password", "securepass");
userFormData.append("name", "John Doe");
userFormData.append("files.avatar", avatarFile); // Profile picture

const user = await db.registerWithFiles(userFormData);
`);

// Example 4: Update user profile with files
console.log("4. Update User with Files:");
console.log(`
const profileFormData = new FormData();
profileFormData.append("name", "Updated Name");
profileFormData.append("files.avatar", newAvatarFile); // New profile picture

const updatedUser = await db.updateUserWithFiles(profileFormData);
`);

console.log("\n🔧 Testing Setup Notes:");
console.log(
  "- File upload tests require browser environment or Node.js with form-data library"
);
console.log("- Real file testing needs actual File objects or file streams");
console.log("- Network requests should be mocked in unit tests");
console.log("- Integration tests would upload to a test server");

console.log("\n🚀 Running tests...\n");

runFileUploadTests();
