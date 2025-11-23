# Cocobase Realtime — Quickstart and Reference

This document explains the realtime helpers provided by the Cocobase JavaScript SDK: `CollectionWatcher`, `ProjectBroadcast`, `RoomChat`, and `listRooms`. The SDK also exposes a convenient `db.realtime` helper on a `Cocobase` instance so you can create realtime clients easily.

Summary

- CollectionWatcher — subscribe to changes in a collection with optional filters and automatic reconnection.
- ProjectBroadcast — project-wide broadcast messaging (send/receive simple messages).
- RoomChat — create or join rooms and exchange messages with room participants.
- listRooms — REST helper to fetch active rooms for the project.
- db.realtime — factory helpers attached to a `Cocobase` instance.

Base WebSocket URL
`wss://api.cocobase.buzz/realtime`

Usage: imports

```ts
import {
  CollectionWatcher,
  ProjectBroadcast,
  RoomChat,
  listRooms,
} from "../src/realtime/websockets.js";
// or via Cocobase instance
// const watcher = db.realtime.collection('users', { status: 'active' });
```

Overview: design goals

- Tiny, framework-agnostic wrappers
- Automatic reconnection with exponential backoff
- Ping/pong to keep connections healthy
- Explicit callback API on `CollectionWatcher`: `onConnected`, `onCreate`, `onUpdate`, `onDelete`, `onError`. ProjectBroadcast uses `onMessage`.

1. CollectionWatcher

---

Purpose: receive live create/update/delete events for documents in a collection.

Create and connect

```js
// Standalone
const watcher = new CollectionWatcher("users", "YOUR_API_KEY", {
  status: "active",
});
watcher.onConnected((d) => console.log("connected", d));
watcher.onCreate((d) => console.log("created:", d.data));
watcher.onUpdate((d) => console.log("updated:", d.data, "old:", d.old_data));
watcher.onDelete((d) => console.log("deleted id:", d.data.id));
watcher.connect();

// Using Cocobase convenience
// const watcher = db.realtime.collection('users', { status: 'active' });
// watcher.connect();
```

Notes

- Filters are applied server-side where possible; send the same filter key syntax used by the Collections API (e.g. `age_gte`, `name_contains`, `[or]` groups).
- `CollectionWatcher` automatically reconnects and re-sends the original auth payload.

2. ProjectBroadcast

---

Purpose: lightweight global messaging for all connected clients within a project.

Create and connect

```js
const b = new ProjectBroadcast("YOUR_API_KEY", "user_123", "Alice");
b.onMessage((msg) => console.log("broadcast:", msg));
b.connect();
// send a message
b.send({ text: "Hello everyone!" });
```

Notes

- Useful for announcements, lightweight notifications, or global chat.
- The wrapper automatically pings the server to keep the socket alive.

3. RoomChat

---

Purpose: room-based chat where participants can create or join rooms and exchange messages.

Create a room

```js
const room = new RoomChat("general", "YOUR_API_KEY", "user_1", "Alice");
room.create("General Chat");
room.on("joined", (d) => console.log("joined room:", d.room_title));
room.on("message", (m) => console.log(`${m.user_name}: ${m.content}`));
```

Join an existing room

```js
const room = new RoomChat("general", "YOUR_API_KEY", "user_2", "Bob");
room.join();
room.on("message", console.log);
room.sendMessage("Hello everyone!");
```

Notes

- Room messages include participant metadata and timestamps.
- RoomChat will attempt to reconnect automatically if the socket closes.

4. listRooms

---

Purpose: fetch the list of active rooms for your project (REST endpoint).

```js
const data = await listRooms("YOUR_API_KEY");
console.log(data.rooms, data.total);
```

5. `db.realtime` convenience (Cocobase instance)

---

When you create a `Cocobase` client, a `realtime` helper is available:

```ts
import { Cocobase } from "../src/core/core.js";

const db = new Cocobase({ apiKey: "YOUR_API_KEY", projectId: "project-1" });

// collection factory
const watcher = db.realtime.collection("users", { status: "active" });
watcher.onCreate((d) => console.log(d.data));
watcher.connect();

// broadcast factory
const br = db.realtime.broadcast("user_1", "Alice");
br.connect();
br.send({ text: "hi" });

// room factory
const room = db.realtime.room("general", "user_1", "Alice");
room.join();

// list rooms
const rooms = await db.realtime.listRooms();
```

Best practices

- Always use HTTPS/WSS. Never send tokens over plain HTTP.
- Close sockets on unmount or `beforeunload`.
- Use `ping`/`pong` events to detect stale connections (handled by helpers).
- Handle `onclose` and show an offline state to users.

Security

- The realtime helpers use the _project_ API key (the same value you provide as `X-API-Key`) by default. That key is taken from the `Cocobase` client configuration (`new Cocobase({ apiKey: 'PROJECT_X_API_KEY' })`) and sent to the server in the initial websocket auth payload as `api_key`.

- listRooms uses the `X-API-Key` HTTP header when calling the REST endpoint:

```js
// listRooms sends the project API key as the X-API-Key header
const data = await listRooms("PROJECT_X_API_KEY");
```

- Optional: if you prefer to authenticate realtime connections using a user's JWT (instead of the project API key), you can pass the token in the auth payload manually when creating the watcher, e.g.:

```js
// Manually pass a JWT instead of the project API key in the initial payload
const watcher = new CollectionWatcher("users", "PROJECT_X_API_KEY");
// override the initial auth data by reconnecting with a custom payload
// (the helper doesn't do this automatically so you explicitly control token usage)
// Example using the underlying ReconnectingWebSocket:
// const custom = new ReconnectingWebSocket(url, { token: 'USER_JWT' });
```

- If you'd like `db.realtime` to automatically use `db.auth.getToken()` (JWT) instead of the project API key, I can add a configuration toggle `db.realtime.useJwt(true)` that will prefer the user's JWT when present — tell me if you want that behavior.

Troubleshooting

- If you receive `403` or `invalid api key`, verify the `api_key` you send in the initial message or the `X-API-Key` header for `listRooms`.
- If rooms do not list, check project configuration and backend logs.

Next steps I can take for you

- Add `db.realtime.useJwt()` toggle so realtime sockets automatically use the user's JWT when available.
- Provide React/Vue example components.
- Add unit/integration tests for reconnection and message parsing.

---

If you'd like me to add any of the next steps, tell me which one and I'll implement it.
