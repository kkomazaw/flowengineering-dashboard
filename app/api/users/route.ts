import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { mockUsers } from "@/lib/auth/auth.config";
import { Permission, UserRole } from "@/types";

// GET /api/users - Get all users
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as UserRole;
  if (!hasPermission(userRole, Permission.MANAGE_USERS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Return users without passwords
  const usersWithoutPasswords = mockUsers.map(({ password, ...user }) => user);

  return NextResponse.json(usersWithoutPasswords);
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as UserRole;
  if (!hasPermission(userRole, Permission.MANAGE_USERS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, name, password, role, teams } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      email,
      name: name || undefined,
      password,
      role: role as UserRole,
      teams: teams || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
