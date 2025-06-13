"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function UserManagement() {
  const { data, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => axios.get("/api/admin/users").then((res) => res.data),
  });

  const { mutate } = useMutation({
    mutationFn: ({ email, role }: any) =>
      axios.put("/api/admin/users", { email, role }),
    onSuccess: () => refetch(),
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      {data?.users.map((u: any) => (
        <div
          key={u.email}
          className="flex items-center justify-between mb-2 border p-2 rounded"
        >
          <span>
            {u.name} ({u.email}) - <b>{u.role}</b>
          </span>
          <div className="space-x-2">
            <button
              onClick={() => mutate({ email: u.email, role: "user" })}
              className="bg-gray-200 px-2 rounded"
            >
              User
            </button>
            <button
              onClick={() => mutate({ email: u.email, role: "admin" })}
              className="bg-yellow-300 px-2 rounded"
            >
              Admin
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
