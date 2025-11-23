import { log } from "console";
import { Cocobase } from "../src/index.ts";
import { ref } from "process";

const db = new Cocobase({
  apiKey:"WOPaOrZQpXumrLizEYyZNhQ3EPr_SElu5uTI-CJH",
  projectId:"d52bba2b-0ff8-4663-b7cf-fe88144ad0d1",
});

async function run() {
  await db.auth.login("demo@gmail.com","demodemo")

}
run();
