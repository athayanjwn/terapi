"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function MyAssessmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await apiFetch<any[]>("/api/self-assessments-me/history");
        setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Riwayat Self-Assessment</h1>

      {loading && <div className="mt-6">Loading...</div>}
      {err && <div className="mt-6 text-red-600">{err}</div>}

      <div className="grid gap-3 mt-6">
        {!loading && !err && items.map((x) => (
          <div key={x.id} className="border rounded-xl p-4">
            <div className="text-sm text-gray-600">{new Date(x.created_at).toLocaleString("id-ID")}</div>
            <div className="text-sm mt-2">
              <b>Tags:</b> {(x.recommend_tags || []).join(", ") || "-"}
            </div>
            <div className="text-sm mt-2">
              <b>Ringkas:</b>{" "}
              {Object.entries(x.result || {}).map(([k, v]: any) => `${k}:${v.level}`).join(" • ") || "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
