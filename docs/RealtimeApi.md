# Realtime API

Real-time features using WebSockets for live updates and messaging.

**Base WebSocket URL:** `wss://api.cocobase.buzz/realtime`

---

## Table of Contents

1. [Overview](#overview)
2. [Collection Watch](#collection-watch)
3. [Project Broadcast](#project-broadcast)
4. [Room Chat](#room-chat)
5. [List Rooms](#list-rooms)

---

## Overview

CocoBase provides three types of real-time features:

1. **Collection Watch** - Get notified when documents in a collection are created, updated, or deleted
2. **Project Broadcast** - Global messaging for all clients in your project
3. **Room Chat** - Room-based messaging where users create/join rooms

All real-time features use WebSockets and require authentication with your API key.

---

## Collection Watch

Watch a collection for changes and get real-time notifications when documents are created, updated, or deleted.

**WebSocket Endpoint:** `wss://api.cocobase.buzz/realtime/collections/{collection_name}`

### Basic Usage

```javascript
const ws = new WebSocket('wss://api.cocobase.buzz/realtime/collections/users');

// Step 1: Send authentication
ws.onopen = () => {
  ws.send(JSON.stringify({
    api_key: "your-api-key"
  }));
};

// Step 2: Receive connection confirmation
// Step 3: Receive real-time events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.event === 'connected') {
    console.log('Connected to collection:', data.collection_id);
  } else if (data.event === 'create') {
    console.log('New document:', data.data);
  } else if (data.event === 'update') {
    console.log('Updated document:', data.data);
  } else if (data.event === 'delete') {
    console.log('Deleted document:', data.data);
  }
};
```

### With Filters

You can filter which events you receive by providing filters in the authentication message:

```javascript
const ws = new WebSocket('wss://api.cocobase.buzz/realtime/collections/users');

ws.onopen = () => {
  ws.send(JSON.stringify({
    api_key: "your-api-key",
    filters: {
      "status": "active",           // Only active users
      "age_gte": "18",              // Age >= 18
      "role_in": "admin,moderator"  // Admins or moderators
    }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.event === 'connected') {
    console.log('Connected with filters:', data.filters);
  } else {
    // Only events matching your filters will be received
    console.log('Event:', data.event, data.data);
  }
};
```

### Event Types

**Connection Confirmed:**
```json
{
  "event": "connected",
  "collection_id": "users",
  "filters": {
    "status": "active"
  }
}
```

**Document Created:**
```json
{
  "event": "create",
  "collection_id": "users",
  "data": {
    "id": "doc_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Document Updated:**
```json
{
  "event": "update",
  "collection_id": "users",
  "data": {
    "id": "doc_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "premium",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "old_data": {
    "status": "active"
  }
}
```

**Document Deleted:**
```json
{
  "event": "delete",
  "collection_id": "users",
  "data": {
    "id": "doc_abc123"
  }
}
```

### Filter Operators

All filter operators from the Collections API work here:

| Operator | Example | Matches |
|----------|---------|---------|
| `field` | `status=active` | Exact match |
| `field_eq` | `status_eq=active` | Exact match (explicit) |
| `field_ne` | `status_ne=inactive` | Not equal |
| `field_gt` | `age_gt=18` | Greater than |
| `field_gte` | `age_gte=18` | Greater than or equal |
| `field_lt` | `age_lt=65` | Less than |
| `field_lte` | `age_lte=65` | Less than or equal |
| `field_contains` | `name_contains=john` | Contains substring (case-insensitive) |
| `field_startswith` | `email_startswith=admin` | Starts with |
| `field_endswith` | `email_endswith=@gmail.com` | Ends with |
| `field_in` | `role_in=admin,mod` | In list (comma-separated) |
| `field_notin` | `status_notin=deleted` | Not in list |
| `field_isnull` | `deleted_at_isnull=true` | Is null/missing |

**Note:** Filters are applied client-side before sending events to you.

### Complete Example

```javascript
class CollectionWatcher {
  constructor(collectionName, apiKey, filters = {}) {
    this.collectionName = collectionName;
    this.apiKey = apiKey;
    this.filters = filters;
    this.ws = null;
    this.listeners = {
      create: [],
      update: [],
      delete: [],
      connected: []
    };
  }

  connect() {
    this.ws = new WebSocket(
      `wss://api.cocobase.buzz/realtime/collections/${this.collectionName}`
    );

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        api_key: this.apiKey,
        filters: this.filters
      }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Trigger listeners
      if (this.listeners[data.event]) {
        this.listeners[data.event].forEach(callback => callback(data));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      // Optionally reconnect
      setTimeout(() => this.connect(), 5000);
    };
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage
const watcher = new CollectionWatcher('users', 'your-api-key', {
  status: 'active',
  age_gte: '18'
});

watcher.on('connected', (data) => {
  console.log('Connected:', data);
});

watcher.on('create', (data) => {
  console.log('New user:', data.data);
  // Update UI
});

watcher.on('update', (data) => {
  console.log('User updated:', data.data);
  // Update UI
});

watcher.on('delete', (data) => {
  console.log('User deleted:', data.data.id);
  // Update UI
});

watcher.connect();
```

---

## Project Broadcast

Global messaging system where all clients connected to the same project can send and receive messages.

**WebSocket Endpoint:** `wss://api.cocobase.buzz/realtime/broadcast`

### Basic Usage

```javascript
const ws = new WebSocket('wss://api.cocobase.buzz/realtime/broadcast');

// Step 1: Authenticate with user info
ws.onopen = () => {
  ws.send(JSON.stringify({
    api_key: "your-api-key",
    user_id: "user_123",
    user_name: "John Doe"
  }));
};

// Step 2: Receive confirmation
// Step 3: Send and receive messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.event === 'connected') {
    console.log('Connected as:', data.user_id);
  } else if (data.type === 'message') {
    console.log(`${data.user_name}: ${JSON.stringify(data.data)}`);
  }
};

// Send a message
function sendMessage(content) {
  ws.send(JSON.stringify({
    type: "message",
    data: {
      text: content,
      timestamp: new Date().toISOString()
    }
  }));
}

sendMessage('Hello everyone!');
```

### Message Flow

**1. Authentication Message (Client → Server):**
```json
{
  "api_key": "your-api-key",
  "user_id": "user_123",
  "user_name": "John Doe"
}
```

**2. Connection Confirmed (Server → Client):**
```json
{
  "event": "connected",
  "project_id": "project_abc",
  "user_id": "user_123"
}
```

**3. Send Message (Client → Server):**
```json
{
  "type": "message",
  "data": {
    "text": "Hello everyone!",
    "custom_field": "any JSON data"
  }
}
```

**4. Broadcast to All (Server → All Clients):**
```json
{
  "type": "message",
  "user_id": "user_123",
  "user_name": "John Doe",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "text": "Hello everyone!",
    "custom_field": "any JSON data"
  }
}
```

### Ping/Pong

Keep connection alive:

```javascript
// Send ping
ws.send(JSON.stringify({ type: "ping" }));

// Receive pong
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'pong') {
    console.log('Connection alive');
  }
};

// Auto-ping every 30 seconds
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ping" }));
  }
}, 30000);
```

### Complete Example

```javascript
class ProjectBroadcast {
  constructor(apiKey, userId, userName) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.userName = userName;
    this.ws = null;
    this.onMessageCallbacks = [];
  }

  connect() {
    this.ws = new WebSocket('wss://api.cocobase.buzz/realtime/broadcast');

    this.ws.onopen = () => {
      // Authenticate
      this.ws.send(JSON.stringify({
        api_key: this.apiKey,
        user_id: this.userId,
        user_name: this.userName
      }));

      // Start ping interval
      this.pingInterval = setInterval(() => {
        this.ping();
      }, 30000);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === 'connected') {
        console.log('Connected to broadcast');
      } else if (data.type === 'message') {
        this.onMessageCallbacks.forEach(cb => cb(data));
      }
    };

    this.ws.onclose = () => {
      clearInterval(this.pingInterval);
      // Reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "message",
        data: data
      }));
    }
  }

  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "ping" }));
    }
  }

  onMessage(callback) {
    this.onMessageCallbacks.push(callback);
  }

  disconnect() {
    if (this.ws) {
      clearInterval(this.pingInterval);
      this.ws.close();
    }
  }
}

// Usage
const broadcast = new ProjectBroadcast('your-api-key', 'user_123', 'John Doe');

broadcast.onMessage((message) => {
  console.log(`${message.user_name} (${message.user_id}): `, message.data);
});

broadcast.connect();

// Send messages
broadcast.send({ text: 'Hello everyone!' });
broadcast.send({
  type: 'notification',
  title: 'New feature released!',
  description: 'Check it out'
});
```

---

## Room Chat

Room-based messaging where users can create or join specific rooms.

**WebSocket Endpoint:** `wss://api.cocobase.buzz/realtime/rooms/{room_id}`

### Create a Room

```javascript
const roomId = 'general-chat'; // or use UUID for unique rooms
const ws = new WebSocket(`wss://api.cocobase.buzz/realtime/rooms/${roomId}`);

ws.onopen = () => {
  ws.send(JSON.stringify({
    api_key: "your-api-key",
    user_id: "user_123",
    user_name: "John Doe",
    action: "create",
    room_title: "General Chat"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.event === 'joined') {
    console.log('Room created:', data.room_title);
    console.log('Participants:', data.participants);
  }
};
```

### Join a Room

```javascript
const roomId = 'general-chat';
const ws = new WebSocket(`wss://api.cocobase.buzz/realtime/rooms/${roomId}`);

ws.onopen = () => {
  ws.send(JSON.stringify({
    api_key: "your-api-key",
    user_id: "user_456",
    user_name: "Jane Smith",
    action: "join"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.event === 'joined') {
    console.log('Joined room:', data.room_title);
  } else if (data.type === 'user_joined') {
    console.log(`${data.user_name} joined the room`);
  } else if (data.type === 'user_left') {
    console.log(`${data.user_name} left the room`);
  } else if (data.type === 'message') {
    console.log(`${data.user_name}: ${data.content}`);
  }
};

// Send a message
function sendMessage(content) {
  ws.send(JSON.stringify({
    type: "message",
    content: content
  }));
}

sendMessage('Hello room!');
```

### Message Flow

**1. Authentication + Room Join (Client → Server):**
```json
{
  "api_key": "your-api-key",
  "user_id": "user_123",
  "user_name": "John Doe",
  "action": "create",
  "room_title": "General Chat"
}
```

**2. Joined Confirmation (Server → Client):**
```json
{
  "event": "joined",
  "room_id": "general-chat",
  "room_title": "General Chat",
  "participants": 3,
  "user_id": "user_123"
}
```

**3. User Joined Event (Server → All in Room):**
```json
{
  "type": "user_joined",
  "user_id": "user_456",
  "user_name": "Jane Smith",
  "timestamp": "2024-01-15T10:30:00Z",
  "room_info": {
    "id": "general-chat",
    "title": "General Chat",
    "participants": 4
  }
}
```

**4. Send Message (Client → Server):**
```json
{
  "type": "message",
  "content": "Hello everyone!"
}
```

**5. Message Broadcast (Server → All in Room):**
```json
{
  "type": "message",
  "user_id": "user_123",
  "user_name": "John Doe",
  "content": "Hello everyone!",
  "timestamp": "2024-01-15T10:30:00Z",
  "room_info": {
    "id": "general-chat",
    "title": "General Chat"
  }
}
```

**6. User Left Event (Server → All in Room):**
```json
{
  "type": "user_left",
  "user_id": "user_123",
  "user_name": "John Doe",
  "timestamp": "2024-01-15T10:35:00Z",
  "room_info": {
    "id": "general-chat",
    "title": "General Chat",
    "participants": 3
  }
}
```

### Complete Example

```javascript
class RoomChat {
  constructor(roomId, apiKey, userId, userName) {
    this.roomId = roomId;
    this.apiKey = apiKey;
    this.userId = userId;
    this.userName = userName;
    this.ws = null;
    this.listeners = {
      joined: [],
      user_joined: [],
      user_left: [],
      message: []
    };
  }

  create(roomTitle) {
    this._connect('create', roomTitle);
  }

  join() {
    this._connect('join');
  }

  _connect(action, roomTitle = this.roomId) {
    this.ws = new WebSocket(
      `wss://api.cocobase.buzz/realtime/rooms/${this.roomId}`
    );

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        api_key: this.apiKey,
        user_id: this.userId,
        user_name: this.userName,
        action: action,
        room_title: roomTitle
      }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Trigger listeners
      const eventType = data.event || data.type;
      if (this.listeners[eventType]) {
        this.listeners[eventType].forEach(cb => cb(data));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Left room');
    };
  }

  sendMessage(content) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "message",
        content: content
      }));
    }
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  leave() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage - Create a room
const room = new RoomChat('general-chat', 'your-api-key', 'user_123', 'John Doe');

room.on('joined', (data) => {
  console.log('Joined room:', data.room_title);
  console.log('Participants:', data.participants);
});

room.on('user_joined', (data) => {
  console.log(`${data.user_name} joined`);
});

room.on('user_left', (data) => {
  console.log(`${data.user_name} left`);
});

room.on('message', (data) => {
  console.log(`${data.user_name}: ${data.content}`);
});

room.create('General Chat');

// Send messages
setTimeout(() => {
  room.sendMessage('Hello everyone!');
}, 1000);
```

---

## List Rooms

Get all active rooms for your project.

**Endpoint:** `GET /realtime/rooms`

**Headers:**
```bash
X-API-Key: your-api-key
```

**Example:**
```bash
curl https://api.cocobase.buzz/realtime/rooms \
  -H "X-API-Key: your-api-key"
```

**Response:**
```json
{
  "rooms": [
    {
      "id": "general-chat",
      "title": "General Chat",
      "created_by": "user_123",
      "participants": 5,
      "participant_list": [
        {"id": "user_123", "name": "John Doe"},
        {"id": "user_456", "name": "Jane Smith"}
      ],
      "created_at": 1705315800
    },
    {
      "id": "support",
      "title": "Customer Support",
      "created_by": "admin_001",
      "participants": 2,
      "participant_list": [
        {"id": "admin_001", "name": "Admin"},
        {"id": "user_789", "name": "Customer"}
      ],
      "created_at": 1705316000
    }
  ],
  "total": 2
}
```

**JavaScript Example:**
```javascript
const response = await fetch('https://api.cocobase.buzz/realtime/rooms', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

const result = await response.json();
console.log(`Total rooms: ${result.total}`);
result.rooms.forEach(room => {
  console.log(`${room.title} - ${room.participants} participants`);
});
```

---

## Error Handling

### Authentication Errors

```json
{
  "error": "API key is required"
}

{
  "error": "Invalid API key",
  "error_detail": "Project not found"
}

{
  "error": "Authentication timeout"
}
```

### Room Errors

```json
{
  "error": "Room not found",
  "room_id": "non-existent-room"
}

{
  "error": "Room belongs to different project"
}
```

### Collection Errors

```json
{
  "error": "Collection not found or access denied"
}
```

---

## Best Practices

### 1. Implement Reconnection Logic

```javascript
class ReconnectingWebSocket {
  constructor(url, authData) {
    this.url = url;
    this.authData = authData;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected');
      this.reconnectDelay = 1000; // Reset delay
      this.ws.send(JSON.stringify(this.authData));
    };

    this.ws.onclose = () => {
      console.log(`Reconnecting in ${this.reconnectDelay}ms...`);
      setTimeout(() => {
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          this.maxReconnectDelay
        );
        this.connect();
      }, this.reconnectDelay);
    };
  }
}
```

### 2. Use Ping/Pong for Connection Health

```javascript
let pingInterval;

ws.onopen = () => {
  pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }, 30000);
};

ws.onclose = () => {
  clearInterval(pingInterval);
};
```

### 3. Filter Events Client-Side

```javascript
// Only show messages from specific users
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'message') {
    // Filter by user role
    if (data.data.user_role === 'admin') {
      console.log('Admin message:', data.data.text);
    }
  }
};
```

### 4. Clean Up on Disconnect

```javascript
window.addEventListener('beforeunload', () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
});
```

---

## Python Examples

### Collection Watch

```python
import websocket
import json
import threading

def on_message(ws, message):
    data = json.loads(message)
    print(f"Event: {data.get('event')}")
    print(f"Data: {data.get('data')}")

def on_open(ws):
    auth = {
        "api_key": "your-api-key",
        "filters": {
            "status": "active"
        }
    }
    ws.send(json.dumps(auth))

ws = websocket.WebSocketApp(
    "wss://api.cocobase.buzz/realtime/collections/users",
    on_message=on_message,
    on_open=on_open
)

ws.run_forever()
```

### Project Broadcast

```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    if data.get('type') == 'message':
        print(f"{data['user_name']}: {data['data']}")

def on_open(ws):
    ws.send(json.dumps({
        "api_key": "your-api-key",
        "user_id": "user_123",
        "user_name": "Python Client"
    }))

ws = websocket.WebSocketApp(
    "wss://api.cocobase.buzz/realtime/broadcast",
    on_message=on_message,
    on_open=on_open
)

# Run in separate thread
import threading
thread = threading.Thread(target=ws.run_forever)
thread.start()

# Send message
import time
time.sleep(2)
ws.send(json.dumps({
    "type": "message",
    "data": {"text": "Hello from Python!"}
}))
```

---

## Next Steps

- **[Collections API](./collections.md)** - Store and query data
- **[Auth Collections](./auth-collections.md)** - User authentication
- **[Filtering Guide](./filtering.md)** - Advanced filtering techniques

---

**Need Help?** Contact support@cocobase.com
