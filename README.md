# 🥥 Cocobase - The Backend That Just Works

> **Build faster. Ship sooner. Scale effortlessly.**

Cocobase is a modern Backend-as-a-Service (BaaS) platform that eliminates the complexity of backend development. Focus on creating amazing user experiences while we handle your data, authentication, and infrastructure.

## 🚀 Why Cocobase?

### ⚡ **Lightning Fast Setup**

Go from idea to MVP in minutes, not weeks. No server configuration, no database setup, no authentication headaches.

```typescript
// This is literally all you need to start
const db = new Cocobase({
  apiKey: "your-key",          // From cocobase.buzz
  projectId: "your-project-id" // From cocobase.buzz
});
await db.createDocument("users", { name: "John" });
```


### 🛡️ **Authentication Made Simple**

Built-in user management that actually works. Registration, login, sessions, and user profiles - all handled seamlessly.

```typescript

// User registration + automatic login in one line
await db.auth.register("user@example.com", "password", { role: "admin" });
```

> 💡 **New in v1.3.1:** All auth methods now use the `db.auth.*` namespace for better organization. Old methods still work but are deprecated. See our [Migration Guide](docs/Migration-Guide.md).

### 📊 **Real-time Data Management**

Store, retrieve, and manage your application data with a clean, intuitive API. No SQL knowledge required.

### 🔥 **Developer Experience First**

TypeScript-native, excellent error handling, and documentation that doesn't make you cry.

## 🎯 Perfect For

### 🚀 **Rapid Prototyping**

Need to validate an idea quickly? Cocobase gets you from concept to working prototype in hours.

### 📱 **Mobile & Web Apps**

Build modern applications without worrying about backend complexity. Works seamlessly with React, Vue, Angular, React Native, and Flutter.

### 🏢 **Startups & MVPs**

Scale from zero to thousands of users without changing a single line of backend code.

### 👨‍💻 **Solo Developers**

You're a frontend wizard but backend feels like dark magic? We've got you covered.

### 🏫 **Learning Projects**

Students and bootcamp graduates can focus on learning frontend skills without backend overwhelm.

## ✨ Key Features

### 🗄️ **Instant Database**

- **NoSQL Collections**: Store any JSON data structure
- **Advanced Query Filtering**: 12 operators, AND/OR logic, multi-field search
- **File Uploads**: Simple file handling with automatic storage
- **Real-time Updates**: Changes sync instantly across all clients
- **Automatic Indexing**: Fast queries without database optimization headaches
- **Type Safety**: Full TypeScript support with generic types

### 🔍 **Powerful Query System**

Build complex queries with ease:

```typescript
// Simple filtering
await db.listDocuments("users", {
  filters: { status: "active", age_gte: 18 },
});

// Advanced multi-field OR search
await db.listDocuments("users", {
  filters: {
    name__or__email_contains: "john",
    status: "active",
  },
});

// Complex queries with named OR groups
await db.listDocuments("products", {
  filters: {
    "[or:availability]inStock": true,
    "[or:availability]preOrder": true,
    "[or:pricing]onSale": true,
    "[or:pricing]price_lt": 50,
    category: "electronics",
  },
  sort: "price",
  order: "asc",
  limit: 50,
});
```

**Supported Operators:**

- Comparison: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`
- String: `contains`, `startswith`, `endswith`
- List: `in`, `notin`
- Null: `isnull`

**[→ View Complete Query Guide](docs/QueryFiltering.md)**

### 📤 **Easy File Uploads**

Upload files to any document field with a simple API:

```typescript
// Create user with avatar
await db.createDocumentWithFiles(
  "users",
  { name: "John Doe", email: "john@example.com" },
  { avatar: avatarFile, cover_photo: coverFile }
);

// Register user with profile picture
await db.registerWithFiles(
  "john@example.com",
  "password123",
  { username: "johndoe" },
  { avatar: avatarFile }
);

// Update user avatar
await db.updateUserWithFiles(undefined, undefined, undefined, {
  avatar: newAvatarFile,
});
```

**Supported:**

- Single files: `{ avatar: file }`
- Multiple files: `{ gallery: [file1, file2, file3] }`
- Works with collections and user authentication
- Automatic cloud storage and URL generation

**[→ View File Upload Guide](docs/FileUploads.md)**

### 🔐 **Complete Authentication System**

- **User Registration & Login**: Email/password authentication out of the box
- **Session Management**: Automatic token handling and refresh
- **User Profiles**: Extensible user data with custom fields
- **Secure by Default**: Industry-standard security practices built-in

### 🛠️ **Developer-Friendly API**

- **Intuitive Methods**: CRUD operations that make sense
- **Error Handling**: Detailed error messages with actionable suggestions
- **Local Storage Integration**: Automatic session persistence
- **Zero Configuration**: Works immediately after installation

### 📈 **Built to Scale**

- **Global CDN**: Fast response times worldwide
- **Auto-scaling Infrastructure**: Handles traffic spikes automatically
- **99.9% Uptime**: Reliable infrastructure you can count on
- **Performance Monitoring**: Built-in analytics and monitoring

## 🏗️ Use Cases

### 📝 **Content Management**

Build blogs, portfolios, or documentation sites with dynamic content management.

```typescript
// Create a blog post
await db.createDocument("posts", {
  title: "My Amazing Post",
  content: "...",
  author: currentUser.id,
  published: true,
});
```

### 🛒 **E-commerce Applications**

Manage products, orders, and customer data effortlessly.

```typescript
// Add product to cart
await db.createDocument("cart", {
  userId: user.id,
  productId: "prod-123",
  quantity: 2,
});
```

### 👥 **Social Applications**

Build social features like user profiles, posts, comments, and messaging.

```typescript
// Create a social post
await db.createDocument("posts", {
  content: "Just shipped a new feature! 🚀",
  author: user.id,
  likes: 0,
  timestamp: new Date(),
});
```

### 📊 **Analytics Dashboards**

Store and visualize application metrics and user data.

```typescript
// Track user events
await db.createDocument("events", {
  userId: user.id,
  event: "button_click",
  metadata: { button: "signup", page: "landing" },
});
```

## 🎨 Framework Integration

Cocobase works beautifully with all modern frameworks:

### ⚛️ **React/Next.js**

```typescript
const [posts, setPosts] = useState([]);

useEffect(() => {
  db.listDocuments("posts").then(setPosts);
}, []);
```

### 🖖 **Vue/Nuxt**

```typescript
const posts = ref([]);

onMounted(async () => {
  posts.value = await db.listDocuments("posts");
});
```

### 📱 **React Native**

```typescript
// Same API, works everywhere
const posts = await db.listDocuments("posts");
```

## 🌟 Success Stories

> _"Cocobase saved us 3 months of backend development. We launched our MVP in 2 weeks and now serve 10,000+ users."_  
> **- Sarah Chen, Startup Founder**

> _"As a frontend developer, I was always intimidated by backend work. Cocobase made it feel natural and intuitive."_  
> **- Marcus Rodriguez, Full-stack Developer**

> _"We migrated from a custom Node.js backend to Cocobase and reduced our infrastructure costs by 60% while improving reliability."_  
> **- Alex Thompson, CTO**

## 🚀 Getting Started

Ready to build something amazing? Here's how to get started:

### 1. Get Your Credentials

1. **Visit** [cocobase.buzz](https://cocobase.buzz) and sign up for a free account
2. **Create** your first project in the dashboard
3. **Copy your credentials** from the project dashboard:
   - **API Key** - Used to authenticate your requests
   - **Project ID** - Identifies your project

> 💡 **Where to find your credentials:**
> After creating a project on [cocobase.buzz](https://cocobase.buzz), you'll find your **API Key** and **Project ID** in your project's dashboard. Keep these secure and never commit them to version control!

### 2. Install the SDK

```bash
npm install cocobase
```

### 3. Start Building

```typescript
import { Cocobase } from "cocobase";

const db = new Cocobase({
  apiKey: "your-api-key",        // Get from cocobase.buzz
  projectId: "your-project-id"   // Get from cocobase.buzz
});

// You're ready to build! 🎉
```

## 🆕 What's New in v1.3.1

### New Authentication Handler Architecture

All authentication methods are now organized under the `db.auth.*` namespace for better code organization and maintainability:

```typescript
// ✅ New way (recommended)
await db.auth.login("user@example.com", "password");
const user = db.auth.getUser();
const token = db.auth.getToken();

// ❌ Old way (deprecated but still works)
await db.login("user@example.com", "password");
const user = db.user;
const token = db.getToken();
```

**Benefits:**
- 🏗️ Better code organization
- 📚 Comprehensive JSDoc documentation
- 🔄 Enhanced state management
- 🛡️ Improved error handling

**Migration:** Old methods still work but are deprecated. See our **[Migration Guide](docs/Migration-Guide.md)** for easy upgrade instructions.

## 📚 Resources

- **[Documentation](https://docs.cocobase.buzz)** - Comprehensive guides and API reference
- **[Migration Guide](docs/Migration-Guide.md)** - Upgrade from deprecated auth methods
- **[Examples](https://github.com/cocobase/examples)** - Sample projects and tutorials
- **[Community](https://discord.gg/cocobase)** - Join our developer community
- **[Blog](https://blog.cocobase.buzz)** - Tips, tutorials, and updates
- **[Status](https://status.cocobase.buzz)** - Service status and uptime
- **[Changelog](CHANGELOG.md)** - See what's new in each version

## 🤝 Community & Support

- 💬 **Discord**: Join our community for real-time help
- 🐦 **Twitter**: [@CocobaseHQ](https://twitter.com/cocobasehq) for updates
- 📧 **Email**: hello@cocobase.buzz for direct support
- 🐛 **Issues**: Report bugs on GitHub

## 🏆 Built With Love

Cocobase is crafted by developers, for developers. We understand the pain of backend complexity because we've lived it. Our mission is to make backend development as enjoyable as frontend development.

**Join thousands of developers who've already made the switch to Cocobase.**

---

<div align="center">

### Ready to eliminate backend complexity forever?

**[Start Building Now →](https://cocobase.buzz)**

_Free tier available. No credit card required._

</div>
