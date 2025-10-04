import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResearchDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const res = state?.res;

  if (!res) {
    return (
      <div className="text-white text-center py-20">
        <p>No research data found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-white">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700/20 transition">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-3">{res.title || "Untitled Research"}</h1>
      {res.authors && <p className="text-blue-200 mb-1">Authors: {Array.isArray(res.authors) ? res.authors.join(", ") : res.authors}</p>}
      {res.year && <p className="text-blue-300 mb-3">Year: {res.year}</p>}

      <div className="bg-white/10 p-6 rounded-xl border border-white/20">
        <p className="text-blue-100 leading-relaxed">{res.summary || "No summary available for this research."}</p>
      </div>
    </div>
  );
}
