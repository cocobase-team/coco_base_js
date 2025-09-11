import { Cocobase } from "../src/index.ts";

interface Post {
  title: string;
  content?: string;
  author?: string;
}
const db = new Cocobase({ apiKey: "" });

async function run() {
  await db.login("lordy2acey@gmail.com", "password");

  const user = db.user;
  if (!user) {
    throw new Error("User is not authenticated");
  }
  console.log("roles", user.roles, user);

}
run();
