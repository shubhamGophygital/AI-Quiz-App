"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => axios.get("/api/admin/submissions").then((res) => res.data),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Quiz Submissions</h1>
      <table className="w-full border table-auto text-sm">
        <thead>
          <tr>
            <th>Email</th>
            <th>Topic</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.submissions.map((s: any, i: number) => (
            <tr key={i} className="border-t">
              <td>{s.userId}</td>
              <td>{s.topic}</td>
              <td>{s.score}</td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
