import type { createAuthClient } from "better-auth/react";
import { redirect } from "react-router";
import { Cookies } from "./cookies";

export class AuthGuard<T extends ReturnType<typeof createAuthClient>["$Infer"]["Session"]> {
  private readonly API_URL;

  constructor(BASE_URL: string) {
    this.API_URL = `${BASE_URL}/api/auth`;
  }

  async getServerSession(request: Request): Promise<T | null> {
    const cookie = Cookies.extractFrom(request);

    const res = await fetch(`${this.API_URL}/get-session`, {
      headers: { cookie, accept: "application/json" },
    });

    if (!res.ok) return null;
    const session = (await res.json()) as T;

    return session;
  }

  async requireSession(request: Request): Promise<T | null> {
    const session = await this.getServerSession(request);
    if (session?.user) return session;
    throw redirect("/");
  }

  async requireNoSession(request: Request, target = "/home"): Promise<void> {
    const session = await this.getServerSession(request);
    if (session?.user) throw redirect(target);
  }

  async removeSession(request: Request, target = "/login"): Promise<void> {
    const cookie = Cookies.extractFrom(request);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: { cookie },
    });

    const headers = new Headers();

    res.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") headers.append("set-cookie", value);
    });

    throw redirect(target, { headers });
  }
}
