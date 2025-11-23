import { Cocobase } from "../src/index.js";

// Simple long-running test that watches a collection and keeps the process alive.
const db = new Cocobase({
  apiKey: "yR6U1bHsXW7vdYBHDo_rnqOKnvtKkC0HCqc_oucz",
  projectId: "fc7fee75-6619-48e1-acbf-4f7917db2c42",
});

async function run() {
  // Create watcher for the 'users' collection with optional filters
  // Join a room and listen for messages
  const roomId = "test-room";
  const room = db.realtime.room(roomId, "app_listener", "AppListener");

  room.on("joined", (d) => console.log("Joined room:", d.room_title));
  room.on("message", (m) => console.log("Room message:", m));
  room.on("user_joined", (u) => console.log("User joined:", u));

  room.join();

  console.log("Room listener started. Press CTRL+C to exit and cleanup.");

  process.on("SIGINT", async () => {
    console.log("Received SIGINT, leaving room...");
    try {
      room.leave();
    } catch (err) {
      console.error("Error leaving room:", err);
    }
    process.exit(0);
  });

  process.stdin.resume();
}

run().catch((err) => {
  console.error("Watcher failed:", err);
  process.exit(1);
});
