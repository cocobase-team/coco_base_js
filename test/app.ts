import { log } from "console";
import { Cocobase } from "../src/index.ts";

const db = new Cocobase({
  apiKey: "",

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
  const investmentBatches = await db.listDocuments<InvestmentBatch>(
    "investment_batches",
    {
      populate: "user",
      limit: 3,
      select: ["user", "invested_amount", "interest_rate", "start_date"],
    }
  );
  console.log(investmentBatches[0]);
}
run();
