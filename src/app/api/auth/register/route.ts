import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Check uniqueness
    const [emailExists, usernameExists] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.user.findUnique({ where: { username: data.username } }),
    ]);

    if (emailExists)    return NextResponse.json({ error: "Email already registered" },  { status: 409 });
    if (usernameExists) return NextResponse.json({ error: "Username already taken" },    { status: 409 });

    const hashed = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email:    data.email,
        password: hashed,
        username: data.username,
        profile: {
          create: {
            displayName: data.username,
          },
        },
      },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
