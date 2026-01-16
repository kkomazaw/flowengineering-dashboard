import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { mockUsers } from "@/lib/auth/auth.config";
import { Permission, UserRole } from "@/types";

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as UserRole;
  if (!hasPermission(userRole, Permission.MANAGE_USERS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = mockUsers.find((u) => u.id === params.id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Return user without password
  const { password, ...userWithoutPassword } = user;

  return NextResponse.json(userWithoutPassword);
}

// PATCH /api/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const userIndex = mockUsers.findIndex((u) => u.id === params.id);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent changing email to an existing user's email
    if (body.email && body.email !== mockUsers[userIndex].email) {
      const emailExists = mockUsers.some(
        (u) => u.email === body.email && u.id !== params.id
      );
      if (emailExists) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    // Return user without password
    const { password, ...userWithoutPassword } = mockUsers[userIndex];

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as UserRole;
  if (!hasPermission(userRole, Permission.MANAGE_USERS)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userIndex = mockUsers.findIndex((u) => u.id === params.id);

  if (userIndex === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent deleting yourself
  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  // Remove user from array
  mockUsers.splice(userIndex, 1);

  return NextResponse.json({ success: true });
}
