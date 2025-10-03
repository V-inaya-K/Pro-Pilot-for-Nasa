import React, { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Trending from "./pages/trending";
import Community from "./pages/community";
import Profile from "./pages/profile";
import { Bell, LogOut } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("english");
  const [overallLanguage, setOverallLanguage] = useState("english");
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [searchInterest, setSearchInterest] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const availableInterests = [
    "Human Physiology in Space","Cellular Biology","Microgravity Effects",
    "Space Nutrition","Radiation Biology","Astrobiology","Neuroscience in Space",
    "Immunology","Musculoskeletal Biology","Cardiovascular Biology",
    "Genetics & Genomics","Plant Biology in Space","Synthetic Biology",
    "Bioinformatics","Biotechnology Applications","Behavioral Health",
    "Pharmacology in Space","Environmental Biosciences"
  ];

  const languageOptions = { english: "English", hindi: "हिंदी", punjabi: "ਪੰਜਾਬੀ" };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleLogin = async () => {
    if (!email) return;
    try {
      const response = await axios.post(`${API}/users`, { 
        email,
        interests: selectedInterests
      });
      setUser(response.data);
      loadUserDocuments(response.data.id);
    } catch (error) {
      console.error("Error creating/getting user:", error);
    }
  };

  const loadUserDocuments = async (userId) => {
    try {
      const response = await axios.get(`${API}/documents/${userId}`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const selectDocument = async (doc) => {
    setSelectedDocument(doc);
    setCurrentSummary({
      english: doc.summary,
      hindi: doc.summary_hindi,
      punjabi: doc.summary_punjabi,
    });
    try {
      const response = await axios.get(`${API}/chat/${doc.id}/${user.id}`);
      setChatHistory(response.data);
    } catch {
      setChatHistory([]);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedDocument || !user) return;
    setAsking(true);
    try {
      const response = await axios.post(`${API}/chat`, {
        document_id: selectedDocument.id,
        user_id: user.id,
        question,
        language,
      });
      setChatHistory([...chatHistory, response.data]);
      setQuestion("");
    } catch (error) {
      alert("Error asking question: " + (error.response?.data?.detail || error.message));
    }
    setAsking(false);
  };

  const handleCopySummary = () => {
    if (!currentSummary) return;
    const text = currentSummary[language] || currentSummary.english;
    navigator.clipboard.writeText(text);
    alert("Summary copied to clipboard!");
  };

  const handleShareSummary = () => {
    if (!currentSummary) return;
    const text = currentSummary[language] || currentSummary.english;
    if (navigator.share) {
      navigator.share({ title: selectedDocument.filename, text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Summary copied to clipboard!");
    }
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40"></div>
        <div className="relative z-10 bg-gradient-to-b from-blue-900/80 to-indigo-900/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center">
          <div className="mb-6">
            <img src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg" alt="NASA Logo" className="mx-auto h-16 mb-2" />
            <h1 className="text-white text-2xl font-bold">PRO PILOT</h1>
            <p className="text-blue-200 text-sm">WELCOME TO A NEW ERA OF DISCOVERY</p>
          </div>
          <div className="space-y-4">
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input type="text" placeholder="Search interests..." value={searchInterest} onChange={(e) => setSearchInterest(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {availableInterests.filter((i) => i.toLowerCase().includes(searchInterest.toLowerCase()))
                .sort((a, b) => selectedInterests.includes(a) && !selectedInterests.includes(b) ? -1 : 0)
                .map((interest) => (
                  <button key={interest} onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedInterests.includes(interest)
                        ? "bg-blue-600 text-white border-blue-400"
                        : "bg-white/5 text-blue-200 border-white/20 hover:bg-white/20"
                    }`}
                  >{interest}</button>
                ))}
            </div>
            <button onClick={handleLogin} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all">
              LOGIN
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Don’t have an account? <a href="#" className="text-white hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    );
  }

  // --- DASHBOARD WITH ROUTER ---
  return (
    <Router>
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

            <select value={overallLanguage} onChange={(e) => setOverallLanguage(e.target.value)}
              className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none"
            >
              {Object.entries(languageOptions).map(([lang, label]) => <option key={lang} value={lang} className="bg-gray-800">{label}</option>)}
            </select>

            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button onClick={() => setUser(null)} className="flex items-center px-3 py-1 rounded-lg bg-white/15 border border-white/20 text-white focus:outline-none">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </button>
          </div>
        </div>
        <br/>


        {/* MAIN CONTENT */}
        <div className="flex-1 max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={

              <div className="flex-1 max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT PANEL - SEARCH & RECENT SEARCHES */}
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4">Search Research Papers</h2>

                    <input type="text" placeholder="Enter keywords..." value={searchInterest} onChange={(e) => setSearchInterest(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white placeholder-blue-200 focus:outline-none mb-3"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <select className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white">
                        <option value="">Year</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                      </select>

                      <select className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white">
                        <option value="">Date of Upload</option>
                        <option value="last_7_days">Last 7 Days</option>
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="last_year">Last 3 Months</option>
                        <option value="all_time">Last 6 Months</option>
                      </select>

                      <select className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">Category</option>
                        {availableInterests.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>

                      <input type="text" placeholder="Author" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white placeholder-blue-200" />
                    </div>

                    <button onClick={() => {}} className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Search</button>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 max-h-[400px] overflow-y-auto">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Searches</h2>
                    {documents.slice(-4).map((doc) => (
                      <div key={doc.id} className="p-2 text-blue-200 hover:text-white cursor-pointer border-b border-white/10"
                        onClick={() => selectDocument(doc)}
                      >
                        {doc.filename}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MIDDLE PANEL - SUMMARY */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 flex flex-col max-h-[400px]">
                  <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
                  {currentSummary ? (
                    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
                      <p className="text-blue-200 whitespace-pre-wrap">{currentSummary[language]}</p>
                      <div className="flex space-x-2">
                        <button onClick={handleCopySummary} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg">Copy</button>
                        <button onClick={handleShareSummary} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg">Share</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-blue-200 text-center py-12">Select a document to view its summary</p>
                  )}
                </div>

                {/* RIGHT PANEL - Q&A */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 flex flex-col max-h-[400px]">
                  <h2 className="text-xl font-semibold text-white mb-4">Ask Questions</h2>
                  <div className="flex-1 bg-gray-800/50 p-3 rounded-lg overflow-y-auto space-y-3">
                    {chatHistory.length === 0 ? (
                      <p className="text-blue-300 text-center py-8">Ask questions about the document</p>
                    ) : (
                      chatHistory.map(chat => (
                        <div key={chat.id}>
                          <p className="text-blue-300">Q: {chat.question}</p>
                          <p className="text-green-300">A: {chat.answer}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question..." rows={3}
                    className="w-full mt-3 p-2 rounded-lg bg-gray-800/30 text-white"
                  />
                  <button onClick={handleAskQuestion} disabled={!question.trim() || asking}
                    className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    {asking ? "Getting Answer..." : "Ask"}
                  </button>
                </div>

              </div>
            } />

            <Route path="/trending" element={<Trending />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile user={user} />} />
          </Routes>
        </div>

        {/* FOOTER */}
        <footer className="bg-white/15 backdrop-blur-lg border-t border-white/20 py-4 mt-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-blue-100">
            <p>© {new Date().getFullYear()} Pro Pilot. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;
