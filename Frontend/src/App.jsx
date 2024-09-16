import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify'; // Import Toast for notifications
import { uploadFile } from './services/fileService'; // Import the file upload service
import 'react-toastify/dist/ReactToastify.css'; // Import Toast CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa'; // Import icons for file types

// Define allowed file types for upload and conversion
const allowedTypes = ['pdf', 'docx', 'xlsx'];

// Component for rendering a file upload button for different file types
const FileUploadButton = ({ type, onClick }) => {
  // Map file types to their corresponding icons
  const icons = {
    pdf: <FaFilePdf />,
    docx: <FaFileWord />,
    xlsx: <FaFileExcel />,
  };

  // Set button style based on file type
  const btnClass = `btn btn-${type === 'pdf' ? 'success' : type === 'docx' ? 'info' : 'warning'} w-50 mb-2 d-flex align-items-center`;

  return (
    <button key={type} className={btnClass} onClick={() => onClick(type)}>
      <span className="me-2">{icons[type]}</span>
      Convert to {type.toUpperCase()}
    </button>
  );
};

// Reusable Card component for displaying content with consistent styling
const Card = ({ title, children }) => (
  <div className="card p-3 mb-4" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.2)', borderRadius: '0.25rem', backgroundColor: '#fff' }}>
    <div className="card-body">
      <h5 className="card-title">{title}</h5>
      {children}
    </div>
  </div>
);

function App() {
  // State variables
  const [file, setFile] = useState(null); // Store the selected file
  const [converted, setConverted] = useState(false); // Track if the file has been converted
  const [previewUrl, setPreviewUrl] = useState(null); // Store URL for file preview
  const [loading, setLoading] = useState(false); // Track if a file is being processed
  const [showPreview, setShowPreview] = useState(false); // Toggle file preview display

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type.split('/')[1];

      // Validate file type and size
      if (!allowedTypes.includes(fileType)) {
        toast.error('Invalid file type. Please select a PDF, DOCX, or XLSX file.');
        return;
      }
      if (selectedFile.size > 10485760) { // 10MB limit
        toast.error('File size exceeds 10MB. Please select a smaller file.');
        return;
      }
      setFile(selectedFile); // Set the selected file
      setConverted(false); // Reset conversion status
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Generate URL for file preview
      setShowPreview(false); // Hide preview initially
    }
  };

  // Handle file upload and conversion
  const handleFileUpload = async (fileType) => {
    if (!file) {
      toast.error('Please select a file!');
      return;
    }
    if (!allowedTypes.includes(fileType)) {
      toast.error('Invalid conversion type selected.');
      return;
    }

    setLoading(true); // Show loading spinner
    try {
      const result = await uploadFile(file, fileType); // Call the upload service
      if (result.success) {
        setConverted(true); // Mark file as converted
        toast.success(`File successfully converted to ${fileType.toUpperCase()}!`);
      } else {
        toast.error(`Conversion failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('An error occurred during file upload.');
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFile(null);
    setConverted(false);
    setPreviewUrl(null);
    setShowPreview(false);
    toast.info('Form reset successfully!');
  };

  // Handle preview button click
  const handlePreview = () => {
    if (!file) {
      toast.error('Please select a file to preview!');
      return;
    }
    setShowPreview(true); // Show the preview
  };

  return (
    <div className="container mt-5">
      <header className="text-center mb-4">
        <h1 className="display-4">Document Converter</h1>
        <p className="lead">Convert your PDF, DOCX, or XLSX files with ease.</p>
      </header>

      <div className="row mb-4">
        <div className="col-md-4">
          <Card title="Upload & Convert">
            <label className="btn btn-primary mb-3 me-2 w-50">
              Choose a file:
              <input type="file" onChange={handleFileChange} className="form-control-file d-none" />
            </label>
            {allowedTypes.map(type => (
              <FileUploadButton key={type} type={type} onClick={handleFileUpload} />
            ))}
            <button className="btn btn-secondary mt-3" onClick={handleReset}>Reset</button>
          </Card>
        </div>

        <div className="col-md-8">
          <Card title="Conversion Status">
            <button className="btn btn-info mb-3" onClick={handlePreview}>Preview</button>
            {loading && (
              <div className="text-center mb-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {converted && !loading && (
              <div className="alert alert-success text-center mb-4 fade-in">
                <p>Your file has been successfully converted!</p>
              </div>
            )}
            {showPreview && previewUrl && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="card-title">File Preview</h2>
                  <iframe src={previewUrl} style={{ width: '100%', height: '500px', border: 'none' }} className="fade-in"></iframe>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
