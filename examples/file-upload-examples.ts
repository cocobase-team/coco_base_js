/**
 * File Upload Examples for COCOBASE SDK
 *
 * This file demonstrates how to use file uploads with collections and authentication
 */

import { Cocobase } from "../src/index";

const db = new Cocobase({ apiKey: "your-api-key" });

// ============================================================================
// 1. Collection File Uploads
// ============================================================================

async function createUserWithAvatar() {
  // Get file from input element
  const fileInput = document.querySelector<HTMLInputElement>("#avatar-input");
  const avatarFile = fileInput?.files?.[0];

  if (!avatarFile) return;

  try {
    const user = await db.createDocumentWithFiles(
      "users",
      {
        name: "John Doe",
        email: "john@example.com",
        bio: "Software developer",
      },
      {
        avatar: avatarFile,
        cover_photo: avatarFile, // Can use different files
      }
    );

    console.log("User created:", user);
    console.log("Avatar URL:", (user as any)?.data?.avatar);
    console.log("Cover photo URL:", (user as any)?.data?.cover_photo);
  } catch (error) {
    console.error("Failed to create user:", error);
  }
}

async function createProductWithGallery() {
  const mainImageInput =
    document.querySelector<HTMLInputElement>("#main-image");
  const galleryInput =
    document.querySelector<HTMLInputElement>("#gallery-images");

  const mainImage = mainImageInput?.files?.[0];
  const galleryImages = Array.from(galleryInput?.files || []);

  if (!mainImage) return;

  try {
    const product = await db.createDocumentWithFiles(
      "products",
      {
        name: "Laptop",
        price: 1299,
        description: "High-performance laptop",
        status: "active",
      },
      {
        main_image: mainImage,
        gallery: galleryImages, // Array of files
      }
    );

    console.log("Product created:", product);
    console.log("Main image:", product.data.main_image);
    console.log("Gallery:", product.data.gallery); // Array of URLs
  } catch (error) {
    console.error("Failed to create product:", error);
  }
}

async function updateDocumentAvatar() {
  const fileInput = document.querySelector<HTMLInputElement>("#new-avatar");
  const newAvatar = fileInput?.files?.[0];

  if (!newAvatar) return;

  try {
    // Update only the avatar field
    const updated = await db.updateDocumentWithFiles(
      "users",
      "user-123",
      undefined, // No data changes
      { avatar: newAvatar }
    );

    console.log("Avatar updated:", updated.data.avatar);
  } catch (error) {
    console.error("Failed to update avatar:", error);
  }
}

async function updateDocumentWithDataAndFiles() {
  const avatarInput = document.querySelector<HTMLInputElement>("#avatar");
  const coverInput = document.querySelector<HTMLInputElement>("#cover");

  const avatar = avatarInput?.files?.[0];
  const cover = coverInput?.files?.[0];

  try {
    const updated = await db.updateDocumentWithFiles(
      "users",
      "user-123",
      {
        bio: "Updated bio",
        location: "New York",
      },
      {
        avatar: avatar!,
        cover_photo: cover!,
      }
    );

    console.log("User updated:", updated);
  } catch (error) {
    console.error("Failed to update user:", error);
  }
}

// ============================================================================
// 2. Authentication with Files
// ============================================================================

async function registerWithAvatar() {
  const fileInput = document.querySelector<HTMLInputElement>("#avatar-input");
  const avatarFile = fileInput?.files?.[0];

  try {
    const user = await db.registerWithFiles(
      "john@example.com",
      "password123",
      {
        username: "johndoe",
        full_name: "John Doe",
        bio: "Developer from NYC",
      },
      avatarFile ? { avatar: avatarFile } : undefined
    );

    console.log("User registered:", user);
    console.log("Avatar URL:", user.avatar);
    console.log("Access token stored automatically");
  } catch (error) {
    console.error("Registration failed:", error);
  }
}

async function registerWithMultipleFiles() {
  const avatarInput = document.querySelector<HTMLInputElement>("#avatar");
  const coverInput = document.querySelector<HTMLInputElement>("#cover");

  const avatar = avatarInput?.files?.[0];
  const cover = coverInput?.files?.[0];

  try {
    const user = await db.registerWithFiles(
      "jane@example.com",
      "password456",
      {
        username: "janedoe",
        full_name: "Jane Doe",
      },
      {
        avatar: avatar!,
        cover_photo: cover!,
      }
    );

    console.log("User registered with avatar and cover:", user);
  } catch (error) {
    console.error("Registration failed:", error);
  }
}

async function updateCurrentUserAvatar() {
  // Must be logged in first
  await db.login("john@example.com", "password123");

  const fileInput = document.querySelector<HTMLInputElement>("#new-avatar");
  const newAvatar = fileInput?.files?.[0];

  if (!newAvatar) return;

  try {
    const updatedUser = await db.updateUserWithFiles(
      undefined,
      undefined,
      undefined,
      { avatar: newAvatar }
    );

    console.log("Avatar updated:", updatedUser.avatar);
  } catch (error) {
    console.error("Failed to update avatar:", error);
  }
}

async function updateUserProfileWithFiles() {
  // Must be logged in
  await db.login("john@example.com", "password123");

  const avatarInput = document.querySelector<HTMLInputElement>("#avatar");
  const coverInput = document.querySelector<HTMLInputElement>("#cover");

  const avatar = avatarInput?.files?.[0];
  const cover = coverInput?.files?.[0];

  try {
    const updatedUser = await db.updateUserWithFiles(
      {
        username: "newusername",
        bio: "Updated bio",
        location: "San Francisco",
      },
      "newemail@example.com",
      undefined, // No password change
      {
        avatar: avatar!,
        cover_photo: cover!,
      }
    );

    console.log("User profile updated:", updatedUser);
  } catch (error) {
    console.error("Failed to update profile:", error);
  }
}

// ============================================================================
// 3. Validation and Best Practices
// ============================================================================

function validateImageFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    alert("Please upload a valid image file (JPEG, PNG, WebP, or GIF)");
    return false;
  }

  if (file.size > maxSize) {
    alert("File size must be less than 5MB");
    return false;
  }

  return true;
}

async function createUserWithValidation() {
  const fileInput = document.querySelector<HTMLInputElement>("#avatar-input");
  const avatarFile = fileInput?.files?.[0];

  if (!avatarFile) {
    alert("Please select an avatar");
    return;
  }

  if (!validateImageFile(avatarFile)) {
    return;
  }

  try {
    const user = await db.createDocumentWithFiles(
      "users",
      { name: "John Doe", email: "john@example.com" },
      { avatar: avatarFile }
    );

    console.log("User created with validated avatar:", user);
  } catch (error) {
    console.error("Failed to create user:", error);
  }
}

function showImagePreview(file: File, previewElementId: string) {
  const reader = new FileReader();
  reader.onloadend = () => {
    const preview = document.getElementById(
      previewElementId
    ) as HTMLImageElement;
    if (preview) {
      preview.src = reader.result as string;
    }
  };
  reader.readAsDataURL(file);
}

// ============================================================================
// 4. Real-World Example: Complete User Registration Form
// ============================================================================

async function completeUserRegistration() {
  const email = (document.querySelector("#email") as HTMLInputElement).value;
  const password = (document.querySelector("#password") as HTMLInputElement)
    .value;
  const username = (document.querySelector("#username") as HTMLInputElement)
    .value;
  const bio = (document.querySelector("#bio") as HTMLTextAreaElement).value;

  const avatarInput = document.querySelector<HTMLInputElement>("#avatar");
  const avatar = avatarInput?.files?.[0];

  // Validate
  if (!email || !password || !username) {
    alert("Please fill in all required fields");
    return;
  }

  if (avatar && !validateImageFile(avatar)) {
    return;
  }

  try {
    const user = await db.registerWithFiles(
      email,
      password,
      { username, bio: bio || undefined },
      avatar ? { avatar } : undefined
    );

    console.log("Registration successful!", user);
    alert("Account created successfully!");

    // Redirect to dashboard
    window.location.href = "/dashboard";
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Registration failed. Please try again.");
  }
}

// Export examples for use in your app
export {
  createUserWithAvatar,
  createProductWithGallery,
  updateDocumentAvatar,
  updateDocumentWithDataAndFiles,
  registerWithAvatar,
  registerWithMultipleFiles,
  updateCurrentUserAvatar,
  updateUserProfileWithFiles,
  validateImageFile,
  showImagePreview,
  completeUserRegistration,
};
