import { Cocobase } from "../src/index.js";

const db = new Cocobase({
  apiKey: "api-key",
  projectId: "tfrrttr",
});

async function run() {
  await db.auth.requestPasswordReset("useremail@email.com")
}

run();
