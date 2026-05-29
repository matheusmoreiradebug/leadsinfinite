import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "im_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

// POST /api/auth — login
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const correct = process.env.DASHBOARD_PASSWORD;

  if (!correct || password !== correct) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, correct, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   COOKIE_MAX_AGE,
    path:     "/",
  });
  return res;
}

// DELETE /api/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
