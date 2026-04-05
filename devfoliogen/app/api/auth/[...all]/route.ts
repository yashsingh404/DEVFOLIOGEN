import { NextResponse } from "next/server";
import { auth, isAuthEnabled } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const disabledHandler = async () =>
  NextResponse.json(
    {
      error:
        "GitHub authentication is not configured. Set DATABASE_URL, GITHUB_CLIENT_ID, and GITHUB_CLIENT_SECRET to enable it.",
    },
    { status: 503 }
  );

export const { GET, POST } =
  isAuthEnabled && auth ? toNextJsHandler(auth) : { GET: disabledHandler, POST: disabledHandler };
