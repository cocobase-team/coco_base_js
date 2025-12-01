import { Cocobase } from "../src/index.js";

// Broadcast test using same project API key/projectId as test/app.ts
const db = new Cocobase({
 
});

async function run() {
  // Join/create a room and send room messages
  const roomId = "test-room";
  const room = db.realtime.room(roomId, "test_sender", "BroadcastTest");

  room.on("joined", (d) => console.log("Room joined:", d));
  room.on("message", (m) => console.log("Room message received:", m));

  room.create("Test Room");

  // Send a room message every 20 seconds
  const interval = setInterval(() => {
    const payload = {
      text: "Hello room from broadcast test",
      ts: new Date().toISOString(),
    };
    room.sendMessage(payload);
  }, 20000);

  process.on("SIGINT", async () => {
    console.log("SIGINT received, stopping broadcast test...");
    clearInterval(interval);
    try {
      room.leave();
    } catch (err) {
      console.error("Error disconnecting broadcast:", err);
    }
    process.exit(0);
  });

  process.stdin.resume();
}

run().catch((err) => {
  console.error("Broadcast test failed:", err);
  process.exit(1);
});
