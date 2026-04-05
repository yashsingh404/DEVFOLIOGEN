import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/utils/db";
import { Settings } from "@/lib/config/settings";

export const isAuthEnabled = Settings.HAS_DATABASE && Settings.HAS_GITHUB_AUTH;

export const auth = isAuthEnabled
  ? betterAuth({
      database: prismaAdapter(prisma, {
        provider: "postgresql",
      }),
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID as string,
          clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
          scope: ["read:user", "user:email", "repo"],
        },
      },
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      basePath: "/api/auth",
    })
  : null;

export type Session = typeof auth extends { $Infer: { Session: infer T } } ? T : never;
