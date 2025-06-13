"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => axios.get("/api/user/history").then((res) => res.data),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4 font-bold">Your Quiz History</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        data?.submissions.map((s: any, i: number) => (
          <div key={i} className="border p-4 rounded mb-2">
            <p>
              <b>Topic:</b> {s.topic}
            </p>
            <p>
              <b>Score:</b> {s.score}
            </p>
            <p>
              <b>Date:</b> {new Date(s.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
