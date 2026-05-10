import { betterAuth } from "better-auth";
import { adminClient } from "better-auth/client/plugins";
import { admin } from "better-auth/plugins";

import { db } from "./db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), adminClient()],
});
