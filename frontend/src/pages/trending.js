// import React from "react";

// function Trending() {
//   return (
//     <div className="min-h-screen  flex flex-col pt-20">
//       <div className="max-w-7xl mx-auto p-6 text-white">
//         <h1 className="text-3xl font-bold mb-6">🔥 Trending Research</h1>
//         <p className="text-blue-200 mb-4">
//           Here you can showcase the most popular or recently discussed research
//           papers and discoveries.
//         </p>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {[1, 2, 3, 4].map((id) => (
//             <div
//               key={id}
//               className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10"
//             >
//               <h2 className="text-xl font-semibold text-white">
//                 Trending Paper #{id}
//               </h2>
//               <p className="text-blue-200 mt-2">
//                 Brief description of why this paper is trending…
//               </p>
//               <button className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
//                 View More
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Trending;

import React from "react";

function Trending() {
  const trendingPapers = [
    { title: "Effects of Microgravity on Human Physiology", description: "Study exploring how microgravity affects muscle and bone density." },
    { title: "Space Nutrition Optimization", description: "Research on ideal diets for astronauts during long-duration missions." },
    { title: "Astrobiology Discoveries", description: "Recent findings on potential life-supporting conditions on other planets." },
    { title: "Radiation Impact on DNA", description: "Examining how cosmic radiation affects DNA repair mechanisms in humans." },
  ];

  return (
    <div className="min-h-screen flex flex-col ">
      <div className="max-w-3xl mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Trending Researches🔥</h1>
        <p className="text-blue-200 mb-6">
          Check out the most popular or recently discussed research papers and discoveries.
        </p>

        <div className="space-y-6">
          {trendingPapers.map((paper, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 flex flex-col"
            >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black font-bold rounded-full mr-3">
                  #{index + 1}
                </div>
                <h2 className="text-xl font-semibold text-white">{paper.title}</h2>
              </div>
              <p className="text-blue-200 mt-2">{paper.description}</p>
              <button className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg self-start">
                View More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Trending;
