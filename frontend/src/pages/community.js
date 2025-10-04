import React from "react";
import { Plus } from "lucide-react";

function Community() {
  const communityPosts = [
    {
      title: "Effects of Microgravity on Muscle Atrophy",
      description: "Discussing recent findings on how astronauts lose muscle mass in space."
    },
    {
      title: "Space Nutrition for Long Missions",
      description: "Best practices and research updates on astronaut diet planning."
    },
    {
      title: "Radiation Exposure & DNA Damage",
      description: "Sharing studies and experiences on mitigating cosmic radiation effects."
    },
    {
      title: "Astrobiology Discoveries in Mars Missions",
      description: "New insights from rover missions and potential signs of life."
    },
    {
      title: "Psychological Effects of Isolation in Space",
      description: "Community discussion about mental health strategies for astronauts."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col ">
      <div className="max-w-3xl mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Community</h1>
        <p className="text-blue-200 mb-6">
          Connect with researchers, ask questions, and share insights on space biology and exploration.
        </p>

        <div className="space-y-4">
          {communityPosts.map((post, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10"
            >
              <h2 className="text-lg font-semibold text-white">{post.title}</h2>
              <p className="text-blue-200 mt-2">{post.description}</p>
              <button className="mt-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Reply
              </button>
            </div>
          ))}
          <br/>
        </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg text-white font-semibold shadow-lg">
          <Plus className="w-5 h-5" />
          Create Community
        </button>
      </div>
    </div>
  );
}

export default Community;
