// import React, { useState, useEffect } from "react";
// import "./App.css";
// import { Routes, Route, Link, useNavigate } from "react-router-dom";
// import Trending from "./pages/trending";
// import Community from "./pages/community";
// import Profile from "./pages/profile";
// import SearchResults from "./pages/searchResult";
// import ResearchDetails from "./pages/researchDetail";
// import { Bell, LogOut } from "lucide-react";
// import axios from "axios";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// const API = `${BACKEND_URL}/api`;

// function App() {
//   const [user, setUser] = useState(null);
//   const [email, setEmail] = useState("");
//   const [searchInterest, setSearchInterest] = useState("");
//   const [selectedInterests, setSelectedInterests] = useState([]);
//   const [selectedLanguage, setSelectedLanguage] = useState("english");
//   const [isSignup, setIsSignup] = useState(false);
//   const [documents, setDocuments] = useState([]);
//   const [searchResults, setSearchResults] = useState([]);
//   const [dynamicPlaceholder, setDynamicPlaceholder] = useState("Search for 'Space Nutrition'...");
//   const navigate = useNavigate();

//   const placeholderHints = [
//     "Search for 'Space Nutrition'...",
//     "Try 'Microgravity Effects'...",
//     "Explore 'Astrobiology'...",
//     "Look up 'Human Physiology in Space'...",
//     "Find 'Cellular Biology' studies...",
//   ];

//   useEffect(() => {
//     let idx = 0;
//     const interval = setInterval(() => {
//       idx = (idx + 1) % placeholderHints.length;
//       setDynamicPlaceholder(placeholderHints[idx]);
//     }, 2500);
//     return () => clearInterval(interval);
//   }, []);

//   const availableInterests = [
//     "Human Physiology in Space", "Cellular Biology", "Microgravity Effects",
//     "Space Nutrition", "Radiation Biology", "Astrobiology", "Neuroscience in Space",
//     "Immunology", "Musculoskeletal Biology", "Cardiovascular Biology",
//     "Genetics & Genomics", "Plant Biology in Space", "Synthetic Biology",
//     "Bioinformatics", "Biotechnology Applications", "Behavioral Health",
//     "Pharmacology in Space", "Environmental Biosciences"
//   ];

//   const toggleInterest = (interest) => {
//     if (selectedInterests.includes(interest)) {
//       setSelectedInterests(selectedInterests.filter(i => i !== interest));
//     } else {
//       setSelectedInterests([...selectedInterests, interest]);
//     }
//   };

//   // ---------------- User Login / Signup ----------------
//   const handleLogin = async () => {
//     if (!email) return;
//     try {
//       const response = await axios.post(`${API}/users`, {
//         email,
//         interests: isSignup ? selectedInterests : []
//       });
//       setUser(response.data);
//       loadUserDocuments(response.data.id);
//     } catch (error) {
//       console.error("Error creating/getting user:", error);
//       alert("Error logging in: " + (error.response?.data?.detail || error.message));
//     }
//   };

//   const loadUserDocuments = async (userId) => {
//     try {
//       const res = await axios.get(`${API}/documents/${userId}`);
//       setDocuments(res.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ---------------- Search Studies ----------------
//   const handleSearch = async () => {
//     if (!searchInterest.trim()) return;
//     try {
//       const res = await axios.get(`${API}/search`, { params: { term: searchInterest } });
//       if (!res.data || res.data.results.length === 0) {
//         alert("No studies found for that keyword.");
//         return;
//       }
//       setSearchResults(res.data.results);
//       navigate("/search-results", { state: { results: res.data.results, searchTerm: searchInterest } });
//     } catch (err) {
//       console.error(err);
//       alert("Error fetching search results.");
//     }
//   };

//   // ---------------- Fetch Study Metadata ----------------
//   const fetchMetadata = async (osd_id) => {
//     try {
//       const res = await axios.get(`${API}/metadata/${osd_id}`);
//       navigate(`/research/${osd_id}`, { state: { metadata: res.data } });
//     } catch (err) {
//       console.error(err);
//       alert("Error fetching metadata.");
//     }
//   };

//   // ---------------- Chat / Ask Questions ----------------
//   const askQuestion = async (document_id, question) => {
//     if (!question || !user) return;
//     try {
//       const res = await axios.post(`${API}/chat`, {
//         document_id,
//         user_id: user.id,
//         question,
//         language: selectedLanguage
//       });
//       return res.data;
//     } catch (err) {
//       console.error(err);
//       alert("Error asking question.");
//     }
//   };

//   const getChatHistory = async (document_id) => {
//     if (!user) return [];
//     try {
//       const res = await axios.get(`${API}/chat/${document_id}/${user.id}`);
//       return res.data || [];
//     } catch (err) {
//       console.error(err);
//       return [];
//     }
//   };

//   // ---------------- Trending Items ----------------
//   const trendingItems = [
//     { image: "https://imgs.search.brave.com/R7fS6-mZ5gcLJQ8rvnFibMLf2WGUN07NohoZ9_HIUDo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/ZWFydGguY29tL2Fz/c2V0cy9fbmV4dC9p/bWFnZS8_dXJsPWh0/dHBzOi8vY2ZmMi5l/YXJ0aC5jb20vdXBs/b2Fkcy8yMDI1LzA5/LzI5MDc1MzExL1Nw/YWNlLWNyb3BzLTE0/MDB4ODUwLmpwZyZ3/PTEyMDAmcT03NQ", title: "Space Nutrition Study" },
//     { image: "https://imgs.search.brave.com/37odSQfiJNDdstzuGRDPezjEtOl_SdRrRLEMTx00kFQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kMmp4/MnJlcnJnNnNoMy5j/bG91ZGZyb250Lm5l/dC9pbWFnZXMvbmV3/cy9JbWFnZUZvck5l/d3NfNzc2MjkzXzE3/MTIyMDI2MDIyNjcx/NzgyLmpwZw", title: "Microgravity Effects on Muscles" },
//     { image: "https://imgs.search.brave.com/n9ZtZwb0vyRkJ1pP8HjtuqoyIOXbxIIPCCQQb8T2nck/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Ry/b2Jpb2xvZ3kuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzAzL1NBVkVBU1RS/T0JJT0xPR1kucG5n", title: "Astrobiology Discoveries" },
//     { image: "https://imgs.search.brave.com/9FUVZio6BJ7nJLk07DfBZOdJ-KujkTceN4ZGBW6pSjg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Ry/b2Jpb2xvZ3kuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzA1L0FzdHJvbmF1/dC1Bbm5lLU1jQ2xh/aW4tQ29uZHVjdHMt/MTAyNHg1NzguanBn", title: "Radiation Biology Insights" },
//   ];

//   // ---------------- LOGIN / SIGNUP SCREEN ----------------
//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 relative overflow-hidden">
//         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40"></div>
//         <div className="relative z-10 bg-gradient-to-b from-blue-900/80 to-indigo-900/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center">
//           <div className="mb-6">
//             <img src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg" alt="NASA Logo" className="mx-auto h-16 mb-2" />
//             <h1 className="text-white text-2xl font-bold">PRO PILOT</h1>
//             <p className="text-blue-200 text-sm">{isSignup ? "CREATE A NEW ACCOUNT" : "WELCOME BACK"}</p>
//           </div>

//           <div className="space-y-4">
//             <input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />

//             {isSignup && (
//               <>
//                 <input
//                   type="text"
//                   placeholder="Search interests..."
//                   value={searchInterest}
//                   onChange={(e) => setSearchInterest(e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 />
//                 <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
//                   {availableInterests
//                     .filter(i => i.toLowerCase().includes(searchInterest.toLowerCase()))
//                     .sort((a, b) => {
//                       const aSel = selectedInterests.includes(a);
//                       const bSel = selectedInterests.includes(b);
//                       if (aSel && !bSel) return -1;
//                       if (!aSel && bSel) return 1;
//                       return a.localeCompare(b);
//                     })
//                     .map(interest => (
//                       <button key={interest} onClick={() => toggleInterest(interest)}
//                         className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedInterests.includes(interest) ? "bg-blue-600 text-white border-blue-400" : "bg-white/5 text-blue-200 border-white/20 hover:bg-white/20"}`}>
//                         {interest}
//                       </button>
//                     ))}
//                 </div>
//               </>
//             )}

//             <button onClick={handleLogin} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all">
//               {isSignup ? "SIGN UP" : "LOGIN"}
//             </button>

//             <p className="text-blue-200 text-sm mt-4">
//               {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
//               <button onClick={() => setIsSignup(!isSignup)} className="text-white hover:underline">
//                 {isSignup ? "Login" : "Sign up"}
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ---------------- DASHBOARD ----------------
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex flex-col pt-20">
//       {/* HEADER */}
//       <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center">
//         <div>
//           <div className="flex items-center space-x-4">
//             <img src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg" alt="NASA Logo" className="h-16" />
//             <h1 className="text-2xl font-bold text-white">Pro Pilot Dashboard</h1>
//           </div>
//           <p className="text-blue-200">Welcome, {user.email}</p>
//         </div>
//         <div className="flex items-center space-x-6 text-white">
//           <Link to="/" className="text-xl hover:text-white transition-colors">Home</Link>
//           <Link to="/trending" className="text-xl hover:text-white transition-colors">Trending</Link>
//           <Link to="/community" className="text-xl hover:text-white transition-colors">Community</Link>
//           <Link to="/profile" className="text-xl hover:text-white transition-colors">Profile</Link>
//           <select
//             value={selectedLanguage}
//             onChange={(e) => setSelectedLanguage(e.target.value)}
//             className=" bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           >
//             <option value="english" className="bg-black">English</option>
//             <option value="hindi" className="bg-black">Hindi</option>
//             <option value="punjabi" className="bg-black">Punjabi</option>
//           </select>
//           <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
//             <Bell className="w-5 h-5 text-white" />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//           </button>
//           <button onClick={() => setUser(null)} className="flex items-center px-3 py-1 rounded-lg bg-white/15 border border-white/20 text-white focus:outline-none">
//             <LogOut className="w-4 h-4 mr-1" /> Logout
//           </button>
//         </div>
//       </div>

//       <br /><br />

//       <div className="flex-1 max-w-7xl mx-auto">
//         <Routes>
//           <Route path="/" element={
//             <div className="flex flex-col items-center justify-start min-h-screen text-center px-4 pt-6">
//               <h1 className="text-4xl font-bold text-white mb-8 transition-all duration-500 ease-in-out hover:scale-105">
//                     Explore Space Biology
//                   </h1>
//               {/* SEARCH BAR */}
//               <div className="w-[80%] max-w-4xl relative mb-4 transition-all duration-500 ease-in-out">
//                 <input
//                   type="text"
//                   value={searchInterest}
//                   onChange={(e) => setSearchInterest(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                   placeholder={dynamicPlaceholder}
//                   className="w-full px-6 py-4 pl-12 rounded-full bg-white/10 border border-white/20 text-white text-lg placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out"
//                 />
//                 <svg
//                   onClick={handleSearch}
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   strokeWidth={2}
//                   stroke="white"
//                   className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 hover:stroke-blue-400 transition-all duration-300 ease-in-out"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
//                 </svg>
//               </div>

//               {/* FILTERS */}
//               <div className="w-3/4 max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-10 transition-all duration-500 ease-in-out">
//                 <input type="text" placeholder="Organism" className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out" />
//                 <input type="text" placeholder="Mission" className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out" />
//                 <input type="text" placeholder="Author" className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out" />
//                 <select className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-gray-300 transition-all duration-300 ease-in-out">
//                   <option value=""className="bg-black">Duration</option>
//                   <option value="last_7_days" className="bg-black">Last 7 Days</option>
//                   <option value="last_30_days" className="bg-black">Last 30 Days</option>
//                   <option value="last_3_months" className="bg-black">Last 3 Months</option>
//                   <option value="last_6_months" className="bg-black">Last 6 Months</option>
//                   <option value="all_time" className="bg-black">All Time</option>
//                 </select>
//               </div>

//               {/* TRENDING CAROUSEL */}
//               <div className="w-3/4 max-w-5xl mt-2 transition-all duration-500 ease-in-out">
//                 <h2 className="text-white text-2xl font-bold flex items-center mb-1">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
//                   </svg>
//                   Trending
//                 </h2>
//                 <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-2">
//                   {trendingItems.map((item, idx) => (
//                     <div key={idx} className="min-w-[220px] bg-white/10 rounded-xl p-3 flex-shrink-0 cursor-pointer hover:bg-blue-700/30 transition-all duration-300">
//                       <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-2" />
//                       <p className="text-white text-sm truncate">{item.title}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           } />

//           <Route path="/search-results" element={<SearchResults fetchMetadata={fetchMetadata} />} />
//           <Route path="/research/:id" element={<ResearchDetails askQuestion={askQuestion} getChatHistory={getChatHistory} />} />
//           <Route path="/trending" element={<Trending />} />
//           <Route path="/community" element={<Community />} />
//           <Route path="/profile" element={<Profile user={user} />} />
//         </Routes>
//       </div>
      
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from "react";
import "./App.css";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Trending from "./pages/trending";
import Community from "./pages/community";
import Profile from "./pages/profile";
import SearchResults from "./pages/searchResult";
import ResearchDetails from "./pages/researchDetail";
import { Bell, LogOut } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [searchInterest, setSearchInterest] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isSignup, setIsSignup] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState("Search for 'Space Nutrition'...");
  const navigate = useNavigate();

  // ---------------- Dynamic Placeholder ----------------
  const placeholderHints = [
    "Search for 'Space Nutrition'...",
    "Try 'Microgravity Effects'...",
    "Explore 'Astrobiology'...",
    "Look up 'Human Physiology in Space'...",
    "Find 'Cellular Biology' studies..."
  ];
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % placeholderHints.length;
      setDynamicPlaceholder(placeholderHints[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const availableInterests = [
    "Human Physiology in Space", "Cellular Biology", "Microgravity Effects",
    "Space Nutrition", "Radiation Biology", "Astrobiology", "Neuroscience in Space",
    "Immunology", "Musculoskeletal Biology", "Cardiovascular Biology",
    "Genetics & Genomics", "Plant Biology in Space", "Synthetic Biology",
    "Bioinformatics", "Biotechnology Applications", "Behavioral Health",
    "Pharmacology in Space", "Environmental Biosciences"
  ];

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // ---------------- Load user from localStorage ----------------
  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedId = localStorage.getItem("user_id");
    if (storedEmail && storedId) {
      setUser({ email: storedEmail, id: storedId });
      loadUserDocuments(storedId);
    }
  }, []);

  // ---------------- User Login / Signup ----------------
  const handleLogin = async () => {
    if (!email) return alert("Please enter an email.");
    try {
      const response = await axios.post(`${API}/users`, {
        email,
        interests: isSignup ? selectedInterests : []
      });
      const userData = response.data;
      setUser(userData);

      // Persist user
      localStorage.setItem("user_email", userData.email);
      localStorage.setItem("user_id", userData.id);

      loadUserDocuments(userData.id);
    } catch (error) {
      console.error("Login/Signup error:", error);
      alert("Error logging in: " + (error.response?.data?.detail || error.message));
    }
  };

  const loadUserDocuments = async (userId) => {
    try {
      const res = await axios.get(`${API}/documents/${userId}`);
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- Search Studies ----------------
  const handleSearch = async () => {
    if (!searchInterest.trim()) return;
    try {
      const res = await axios.get(`${API}/search`, { params: { term: searchInterest } });
      if (!res.data || res.data.results.length === 0) {
        alert("No studies found for that keyword.");
        return;
      }
      setSearchResults(res.data.results);
      navigate("/search-results", { state: { results: res.data.results, searchTerm: searchInterest } });
    } catch (err) {
      console.error(err);
      alert("Error fetching search results.");
    }
  };

  // ---------------- Fetch Study Metadata ----------------
  const fetchMetadata = async (osd_id) => {
    try {
      const res = await axios.get(`${API}/metadata/${osd_id}`);
      navigate(`/research/${osd_id}`, { state: { metadata: res.data } });
    } catch (err) {
      console.error(err);
      alert("Error fetching metadata.");
    }
  };

  // ---------------- Chat / Ask Questions ----------------
  const askQuestion = async (document_id, question) => {
    if (!question || !user) return;
    try {
      const res = await axios.post(`${API}/chat`, {
        document_id,
        user_id: user.id,
        question,
        language: selectedLanguage
      });
      return res.data;
    } catch (err) {
      console.error(err);
      alert("Error asking question.");
    }
  };

  const getChatHistory = async (document_id) => {
    if (!user) return [];
    try {
      const res = await axios.get(`${API}/chat/${document_id}/${user.id}`);
      return res.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // ---------------- Trending Items ----------------
  const trendingItems = [
    { image: "https://imgs.search.brave.com/R7fS6-mZ5gcLJQ8rvnFibMLf2WGUN07NohoZ9_HIUDo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/ZWFydGguY29tL2Fz/c2V0cy9fbmV4dC9p/bWFnZS8_dXJsPWh0/dHBzOi8vY2ZmMi5l/YXJ0aC5jb20vdXBs/b2Fkcy8yMDI1LzA5/LzI5MDc1MzExL1Nw/YWNlLWNyb3BzLTE0/MDB4ODUwLmpwZyZ3/PTEyMDAmcT03NQ", title: "Space Nutrition Study" },
    { image: "https://imgs.search.brave.com/37odSQfiJNDdstzuGRDPezjEtOl_SdRrRLEMTx00kFQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9kMmp4/MnJlcnJnNnNoMy5j/bG91ZGZyb250Lm5l/dC9pbWFnZXMvbmV3/cy9JbWFnZUZvck5l/d3NfNzc2MjkzXzE3/MTIyMDI2MDIyNjcx/NzgyLmpwZw", title: "Microgravity Effects on Muscles" },
    { image: "https://imgs.search.brave.com/n9ZtZwb0vyRkJ1pP8HjtuqoyIOXbxIIPCCQQb8T2nck/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Ry/b2Jpb2xvZ3kuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzAzL1NBVkVBU1RS/T0JJT0xPR1kucG5n", title: "Astrobiology Discoveries" },
    { image: "https://imgs.search.brave.com/9FUVZio6BJ7nJLk07DfBZOdJ-KujkTceN4ZGBW6pSjg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hc3Ry/b2Jpb2xvZ3kuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzA1L0FzdHJvbmF1/dC1Bbm5lLU1jQ2xh/aW4tQ29uZHVjdHMt/MTAyNHg1NzguanBn", title: "Radiation Biology Insights" },
  ];

  // ---------------- LOGIN / SIGNUP SCREEN ----------------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40"></div>
        <div className="relative z-10 bg-gradient-to-b from-blue-900/80 to-indigo-900/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center">
          <div className="mb-6">
            <img src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg" alt="NASA Logo" className="mx-auto h-16 mb-2" />
            <h1 className="text-white text-2xl font-bold">PRO PILOT</h1>
            <p className="text-blue-200 text-sm">{isSignup ? "CREATE A NEW ACCOUNT" : "WELCOME BACK"}</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {isSignup && (
              <>
                <input
                  type="text"
                  placeholder="Search interests..."
                  value={searchInterest}
                  onChange={(e) => setSearchInterest(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {availableInterests
                    .filter(i => i.toLowerCase().includes(searchInterest.toLowerCase()))
                    .sort((a, b) => {
                      const aSel = selectedInterests.includes(a);
                      const bSel = selectedInterests.includes(b);
                      if (aSel && !bSel) return -1;
                      if (!aSel && bSel) return 1;
                      return a.localeCompare(b);
                    })
                    .map(interest => (
                      <button key={interest} onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedInterests.includes(interest) ? "bg-blue-600 text-white border-blue-400" : "bg-white/5 text-blue-200 border-white/20 hover:bg-white/20"}`}>
                        {interest}
                      </button>
                    ))}
                </div>
              </>
            )}

            <button onClick={handleLogin} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all">
              {isSignup ? "SIGN UP" : "LOGIN"}
            </button>

            <p className="text-blue-200 text-sm mt-4">
              {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
              <button onClick={() => setIsSignup(!isSignup)} className="text-white hover:underline">
                {isSignup ? "Login" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- DASHBOARD ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex flex-col pt-20">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-4">
            <img src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg" alt="NASA Logo" className="h-16" />
            <h1 className="text-2xl font-bold text-white">Pro Pilot Dashboard</h1>
          </div>
          <p className="text-blue-200">Welcome, {user.email}</p>
        </div>
        <div className="flex items-center space-x-6 text-white">
          <Link to="/" className="text-xl hover:text-white transition-colors">Home</Link>
          <Link to="/trending" className="text-xl hover:text-white transition-colors">Trending</Link>
          <Link to="/community" className="text-xl hover:text-white transition-colors">Community</Link>
          <Link to="/profile" className="text-xl hover:text-white transition-colors">Profile</Link>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className=" bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="english" className="bg-black">English</option>
            <option value="hindi" className="bg-black">Hindi</option>
            <option value="punjabi" className="bg-black">Punjabi</option>
          </select>
          <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={() => { setUser(null); localStorage.clear(); }} className="flex items-center px-3 py-1 rounded-lg bg-white/15 border border-white/20 text-white focus:outline-none">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        </div>
      </div>

      <br /><br />

      <div className="flex-1 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-start min-h-screen text-center px-4 pt-6">
              <h1 className="text-4xl font-bold text-white mb-8 transition-all duration-500 ease-in-out hover:scale-105">
                Explore Space Biology
              </h1>
              {/* SEARCH BAR */}
              <div className="w-[80%] max-w-4xl relative mb-4 transition-all duration-500 ease-in-out">
                <input
                  type="text"
                  value={searchInterest}
                  onChange={(e) => setSearchInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={dynamicPlaceholder}
                  className="w-full px-6 py-4 pl-12 rounded-full bg-white/10 border border-white/20 text-white text-lg placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out"
                />
                <svg
                  onClick={handleSearch}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 hover:stroke-blue-400 transition-all duration-300 ease-in-out"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                </svg>
              </div>

              {/* FILTERS */}
              <div className="w-3/4 max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-10 transition-all duration-500 ease-in-out">
                <input type="text" placeholder="Organism" className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out" />
                <input type="text" placeholder="Mission" className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out" />
                <input type="text" placeholder="Author" className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 ease-in-out" />
                <select className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-blue-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-gray-300 transition-all duration-300 ease-in-out">
                  <option value="" className="bg-black">Duration</option>
                  <option value="last_7_days" className="bg-black">Last 7 Days</option>
                  <option value="last_30_days" className="bg-black">Last 30 Days</option>
                  <option value="last_3_months" className="bg-black">Last 3 Months</option>
                  <option value="last_6_months" className="bg-black">Last 6 Months</option>
                  <option value="all_time" className="bg-black">All Time</option>
                </select>
              </div>

              {/* TRENDING CAROUSEL */}
              <div className="w-3/4 max-w-5xl mt-2 transition-all duration-500 ease-in-out">
                <h2 className="text-white text-2xl font-bold flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
                  </svg>
                  Trending
                </h2>
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-2">
                  {trendingItems.map((item, idx) => (
                    <div key={idx} className="min-w-[220px] bg-white/10 rounded-xl p-3 flex-shrink-0 cursor-pointer hover:bg-blue-700/30 transition-all duration-300">
                      <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                      <p className="text-white text-sm truncate">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          } />

          <Route path="/search-results" element={<SearchResults fetchMetadata={fetchMetadata} />} />
          <Route path="/research/:id" element={<ResearchDetails askQuestion={askQuestion} getChatHistory={getChatHistory} />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
