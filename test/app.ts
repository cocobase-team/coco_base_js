import { Cocobase } from "../src/index.js";

const db = new Cocobase({
  apiKey: "VTXjd5f7SRhfyqpKKenvSNCYzOSOaVBj75pYBQ8Z",
  projectId: "fc7fee75-6619-48e1-acbf-4f7917db2c42",
});

async function run() {
  await db.auth.register({
    email:"email",
    "password":"password",
    roles:['buyer'],
    data:{
      "ful_name":"name"
    }
  })

  await db.auth.enable2FA() // Enable 2FA for the current user

  await db.auth.send2FACode(db.auth.user!.email) // Send 2FA code to the user's email

  await db.auth.verify2FALogin({
    email: db.auth.user!.email,
    code: "123456" // Replace with the actual code received via email
  }) // Verify the 2FA code
  
  console.log("2FA enabled and verified successfully");

}

run();
