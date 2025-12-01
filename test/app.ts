import { Cocobase } from "../src/index.js";

const db = new Cocobase({
  apiKey: "VTXjd5f7SRhfyqpKKenvSNCYzOSOaVBj75pYBQ8Z",
  projectId: "fc7fee75-6619-48e1-acbf-4f7917db2c42",
});
interface Post{
  title?:string;
  post?:string;
  author?:string;
}

async function run() {
 const p = await db.listDocuments<Post>("posts",{
  order:"desc"
 })
 console.log(p)
}

run()
