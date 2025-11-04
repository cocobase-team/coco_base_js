import { log } from "console";
import { Cocobase } from "../src/index.ts";

const db = new Cocobase({
  apiKey: "my_api_key",
  projectId: "my_project_id",

});

interface InvestmentBatch {
  old_id: string;
  status: "ACTIVE" | " PAUSED" | "COMPLETED";
  user_id: string;
  end_date: string;
  start_date: string;
  created_at: string;
  withdrawn: boolean;
  interest_rate: number;
  videos_watched: number;
  invested_amount: number;
  current_interest: number;
  total_videos_required: number;
  is_eligible_for_interest: boolean;
  user?: any;
}
async function run() {
  const free_users = await db.functions.execute<number>("active_users")
  log(free_users);
}
run();
