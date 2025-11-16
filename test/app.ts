import { log } from "console";
import { Cocobase } from "../src/index.ts";
import { ref } from "process";

const db = new Cocobase({
});

// todo test updateDocuments (batch request)
// todo test createDocumentWithFiles
// todo test updateDocumentWithFiles
// todo create user with files
// todo implement aggregation queries
// *STUFF TO TEST*
// /collections/{collection_id}/query/documents/group-by
// Group By Field
// GET
// /collections/{id}/query/schema
// Get Collection Schema
// GET
// /collections/{id}/export
// Export Collection
async function run() {
  const users = await db.auth.listUsers({
    filters: {
      "data.referral_balance_gte":20
    },
    limit:2
  });

  console.log(JSON.stringify(users,null,2));
}
run();
