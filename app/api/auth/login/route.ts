import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const envEmail = process.env.DASHBOARD_EMAIL;
    const envPassword = process.env.DASHBOARD_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (email === envEmail && password === envPassword) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
