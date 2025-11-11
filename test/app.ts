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
  const res = await db.aggregateDocuments("payment_proofs",{
    field:"amount",
    operation:"sum",
    query:{
      filters:{
        status:"PENDING"
      }
    }
  });
  console.log(res);
}
run();
