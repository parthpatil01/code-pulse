import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

const API_URL = "https://f2dzkao162.execute-api.us-east-1.amazonaws.com/prod";

const App = () => {
  const [code, setCode] = useState("// Write your code here\n");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Poll for submission status if we have a submissionId
  useEffect(() => {
    let intervalId;
    
    if (submissionId && submissionStatus !== 'completed' && submissionStatus !== 'error') {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/status/${submissionId}`);
          const data = response.data;
          
          setSubmissionStatus(data.status);
          
          if (data.status === 'completed' || data.status === 'error') {
            setOutput(data.output || "No output available");
            setIsSubmitting(false);
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Error checking status:", error);
        }
      }, 2000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [submissionId, submissionStatus]);

  const handleRunCode = async () => {
    setIsSubmitting(true);
    setOutput("Submitting code...");
    setSubmissionId(null);
    setSubmissionStatus(null);
    
    try {
      const response = await axios.post(`${API_URL}/run`, {
        code,
        language,
      }, {
        headers: { "Content-Type": "application/json" },
      });
      
      const data = response.data;
      
      if (data.submissionId) {
        setSubmissionId(data.submissionId);
        setSubmissionStatus('pending');
        setOutput("Code submitted. Waiting for execution...");
      } else {
        setOutput(data.output || "Error submitting code");
        setIsSubmitting(false);
      }
    } catch (error) {
      setOutput("Server error: " + error.message);
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <div className="flex flex-col w-full h-screen p-4">
      <select
        className="mb-4 p-2"
        value={language}
        onChange={handleLanguageChange}
        disabled={isSubmitting}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
      </select>
      
      <Editor
        height="70vh"
        language={language}
        defaultValue={code}
        onChange={(value) => setCode(value || "")}
        options={{ readOnly: isSubmitting }}
      />
      
      <Button 
        className="mt-4" 
        onClick={handleRunCode}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Running..." : "Run Code"}
      </Button>
      
      <div className="mt-4 p-2 border rounded bg-gray-100 h-32 overflow-auto">
        {submissionStatus && (
          <div className="mb-2">
            Status: <span className={`font-bold ${
              submissionStatus === 'completed' ? 'text-green-600' : 
              submissionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
            }`}>{submissionStatus}</span>
          </div>
        )}
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default App;