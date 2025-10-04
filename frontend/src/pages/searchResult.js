// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// export default function SearchResults() {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   // Use the data passed from App.js
//   const results = state?.results || [];
//   const searchTerm = state?.searchTerm || state?.searchQuery || "";
//   const [page, setPage] = useState(1);

//   const perPage = 10;
//   const totalPages = Math.ceil(results.length / perPage);
//   const paginated = results.slice((page - 1) * perPage, page * perPage);

//   return (
//     <div className="text-white px-6 py-10 max-w-6xl mx-auto">
//       <h2 className="text-3xl font-bold mb-4">
//         Search Results for: <span className="text-blue-400">"{searchTerm}"</span>
//       </h2>
      
//       {paginated.length === 0 ? (
//         <p className="text-blue-300">No results found.</p>
//       ) : (
//         <div className="flex flex-col gap-6"> 
//           {paginated.map((res, idx) => (
//             <div
//               key={idx}
//               onClick={() => navigate(`/research/${idx}`, { state: { res } })}
//               className="cursor-pointer p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-blue-700/30 transition-all"
//             >
//               <h3 className="text-xl font-semibold text-white mb-2">{res.title || res.name || "Untitled"}</h3>
//               {res.authors && <p className="text-sm text-blue-200">Authors: {Array.isArray(res.authors) ? res.authors.join(", ") : res.authors}</p>}
//               {res.year && <p className="text-sm text-blue-300">Year: {res.year}</p>}
//               {res.summary && <p className="text-sm text-blue-200 mt-2 line-clamp-3">{res.summary}</p>}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* PAGINATION */}
//       {totalPages > 1 && (
//         <div className="flex justify-center mt-8 space-x-2">
//           {Array.from({ length: totalPages }).map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setPage(i + 1)}
//               className={`px-4 py-2 rounded-full border border-white/20 ${
//                 page === i + 1 ? "bg-blue-600 text-white" : "bg-white/10 text-blue-200 hover:bg-blue-700/20"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SearchResults() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Use the data passed from App.js
  const results = state?.results || [];
  const searchTerm = state?.searchTerm || state?.searchQuery || "";
  const [page, setPage] = useState(1);

  const perPage = 10;
  const totalPages = Math.ceil(results.length / perPage);
  const paginated = results.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="text-white px-6 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">
        Search Results for:{" "}
        <span className="text-blue-400">"{searchTerm}"</span>
      </h2>

      {paginated.length === 0 ? (
        <p className="text-blue-300">No results found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {paginated.map((res, idx) => (
            <div
              key={idx}
              className="p-6 bg-white/10 rounded-xl border border-white/20 hover:bg-blue-700/30 transition-all"
            >
              <div
                onClick={() =>
                  navigate(`/research/${idx}`, { state: { res } })
                }
                className="cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {res.title || res.name || "Untitled"}
                </h3>
                {res.authors && (
                  <p className="text-sm text-blue-200">
                    Authors:{" "}
                    {Array.isArray(res.authors)
                      ? res.authors.join(", ")
                      : res.authors}
                  </p>
                )}
                {res.year && (
                  <p className="text-sm text-blue-300">Year: {res.year}</p>
                )}
                {res.summary && (
                  <p className="text-sm text-blue-200 mt-2 line-clamp-3">
                    {res.summary}
                  </p>
                )}
              </div>

              {/* DOI Link (Open directly in new tab) */}
              {res.doi_link && (
                <div className="mt-3">
                  <a
                    href={res.doi_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white"
                  >
                    🔗 View Publication
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-full border border-white/20 ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-blue-200 hover:bg-blue-700/20"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
