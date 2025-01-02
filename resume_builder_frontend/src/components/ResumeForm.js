import React, { useState } from "react";
import axios from "axios";
import "./ResumeForm.css";  // Add custom CSS for styling

const ResumeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: "",
    experience: "",
    job_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error message before each submit

    try {
      // Send the request to generate the resume
      const response = await axios.post("http://127.0.0.1:8000/generate-resume/", formData, {
        responseType: "arraybuffer", // Set response type to arraybuffer to handle PDF
      });

      // Create a Blob from the response (PDF content)
      const blob = new Blob([response.data], { type: "application/pdf" });
      
      // Generate a URL for the PDF blob
      const pdfUrl = URL.createObjectURL(blob);
      
      // Set the URL to the state to allow downloading
      setPdfUrl(pdfUrl);
    } catch (error) {
      console.error("Error generating resume:", error);
      setError("An error occurred while generating the resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-container">
      <h1 className="title">AI-Powered Resume Builder</h1>
      
      <form className="resume-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
        />
        <textarea
          name="skills"
          placeholder="Skills (e.g. JavaScript, Python, etc.)"
          value={formData.skills}
          onChange={handleChange}
          required
          className="form-input"
        />
        <textarea
          name="experience"
          placeholder="Work Experience"
          value={formData.experience}
          onChange={handleChange}
          required
          className="form-input"
        />
        <textarea
          name="job_description"
          placeholder="Job Description"
          value={formData.job_description}
          onChange={handleChange}
          required
          className="form-input"
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Generate Resume"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {pdfUrl && (
        <div className="download-section">
          <h2>Download Your Resume</h2>
          <a href={pdfUrl} download="resume.pdf">
            <button className="download-btn">Download PDF</button>
          </a>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;