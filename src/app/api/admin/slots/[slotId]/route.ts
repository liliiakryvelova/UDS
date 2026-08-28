import { hasAdminApiSession } from "@/lib/auth/admin-guard";

export async function PATCH(request: Request) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ message: "Not implemented yet." }, { status: 501 });
}

export async function DELETE(request: Request) {
  if (!hasAdminApiSession(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ message: "Not implemented yet." }, { status: 501 });
}
