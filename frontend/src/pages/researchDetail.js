import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ResearchDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const res = state?.res;

  const [metadata, setMetadata] = useState(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [language, setLanguage] = useState("english");
  const [tone, setTone] = useState("professional");
  const [userId, setUserId] = useState(null); // Store user UUID here

  const userEmail = localStorage.getItem("user_email"); // Replace with actual login email

  // ------------------- Ensure user exists -------------------
  useEffect(() => {
    if (!userEmail) {
      alert("User email not found. Please login.");
      return;
    }

    const initUser = async () => {
      try {
        // Try fetching user
        const resFetch = await axios.get(`${API}/users/${userEmail}`);
        setUserId(resFetch.data.id);
        localStorage.setItem("user_id", resFetch.data.id);
      } catch (err) {
        // If not found, create user
        const resCreate = await axios.post(`${API}/users`, { email: userEmail });
        setUserId(resCreate.data.id);
        localStorage.setItem("user_id", resCreate.data.id);
      }
    };

    initUser();
  }, [userEmail]);

  // ------------------- Fetch metadata -------------------
  useEffect(() => {
    if (!res) return;
    const osdId = res.OSD_ID || res.osd_id || res.id;
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${API}/metadata/${osdId}?lang=${language}`);
        setMetadata(response.data);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, [res, language]);

  // ------------------- Fetch chat history -------------------
  useEffect(() => {
    if (!res || !userId) return;
    const osdId = res.OSD_ID || res.osd_id || res.id;

    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`${API}/chat/${osdId}/${userId}`);
        setChatHistory(response.data || []);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    fetchChatHistory();
  }, [res, userId]);

  // ------------------- Ask a question -------------------
  const handleAskQuestion = async () => {
    if (!question.trim() || !userId) return;

    const osdId = res.OSD_ID || res.osd_id || res.id;

    setLoadingAnswer(true);
    try {
      const response = await axios.post(`${API}/chat`, {
        document_id: osdId,
        user_id: userId,
        question,
        language,
        tone,
      });
      setChatHistory((prev) => [...prev, response.data]);
      setQuestion("");
    } catch (err) {
      console.error("Error asking question:", err);
      alert("Failed to get answer from backend.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  if (!res) {
    return (
      <div className="text-white text-center py-20">
        <p>No research data found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ------------------- Dummy DOI if none -------------------
  const doiLink = metadata?.doi_link || res.doi_link || "https://www.mdpi.com/1422-0067/18/8/1763";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700/20 transition"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-3">{res.title || "Untitled Research"}</h1>
      {res.authors && (
        <p className="text-blue-200 mb-1">
          Authors: {Array.isArray(res.authors) ? res.authors.join(", ") : res.authors}
        </p>
      )}
      {res.year && <p className="text-blue-300 mb-3">Year: {res.year}</p>}

      {/* DOI + Language Dropdown */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <a
          href={doiLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700/20 rounded-lg text-sm text-white transition flex items-center"
        >
          View Publication
        </a>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/10 text-white border border-white/20 px-3 py-2 rounded-lg h-[38px]"
        >
          <option value="english" className="bg-black">
            English
          </option>
          <option value="hindi" className="bg-black">
            Hindi
          </option>
          <option value="punjabi" className="bg-black">
            Punjabi
          </option>
        </select>
      </div>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20 mb-6">
        <p className="text-blue-100 leading-relaxed">
          {metadata?.description || res.summary || "No summary available for this research."}
        </p>
      </div>

      {/* Q/A Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-3">Ask a question about this study</h2>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
        />
        <button
          onClick={handleAskQuestion}
          disabled={loadingAnswer || !userId}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          {loadingAnswer ? "Getting Answer..." : "Ask"}
        </button>
      </div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-2">Chat History</h3>
          {chatHistory.map((chat, idx) => (
            <div key={idx} className="bg-white/10 p-4 rounded-lg border border-white/20">
              <p>
                <span className="font-semibold text-blue-300">You:</span> {chat.question}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-blue-300">Answer:</span> {chat.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
