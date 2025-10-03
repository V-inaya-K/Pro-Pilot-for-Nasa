import React from "react";

function Profile({ user }) {
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading user information...
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold">{user.email}</h2>

          <h3 className="mt-4 text-lg font-semibold">Interests</h3>
          <ul className="flex flex-wrap gap-2 mt-2">
            {user.interests && user.interests.length > 0 ? (
              user.interests.map((interest, idx) => (
                <li
                  key={idx}
                  className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm"
                >
                  {interest}
                </li>
              ))
            ) : (
              <li className="text-blue-200">No interests selected.</li>
            )}
          </ul>

          <button className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
