import React, { useState } from 'react';
import './Tools.css';
import { API_BASE_URL } from '../../config';

const CarRecognizer = ({ sessionToken }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setPrediction(null);
      setError('');
    }
  };

  const recognizeCar = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'car.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', file);

      const apiResponse = await fetch(`${API_BASE_URL}/api/ai-tools/car-recognition`, {
        method: 'POST',
        headers: { 'Authorization': sessionToken },
        body: formData
      });
      const data = await apiResponse.json();
      if (data.success) {
        setPrediction(data);
      } else {
        setError(data.error || 'Recognition failed. Please try another image.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>🚗 Car Brand Recognizer</h2>
        <p>Upload a photo of any car to identify its brand using AI</p>
      </div>

      <div className="recognizer-body">

        {/* Upload area */}
        <label className="upload-area" htmlFor="car-upload">
          {selectedImage ? (
            <img src={selectedImage} alt="Selected" className="preview-image" />
          ) : (
            <>
              <div className="upload-icon">📸</div>
              <h3>Upload a Car Photo</h3>
              <p>Supports JPG, PNG, WEBP</p>
              <span className="upload-btn">Choose Image</span>
            </>
          )}
          <input
            id="car-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>

        {selectedImage && (
          <button
            className="recognize-btn"
            onClick={recognizeCar}
            disabled={loading}
          >
            {loading ? '🔍 Analysing...' : '🔍 Identify Car Brand'}
          </button>
        )}

        {error && <div className="tool-error">❌ {error}</div>}

        {prediction && (
          <div className="recognition-result">
            <h3>Recognition Result</h3>
            <div className="result-brand">{prediction.predicted_brand}</div>
            <span className="result-confidence">
              {prediction.confidence?.toFixed(1)}% confident
            </span>
          </div>
        )}

        {/* How it works */}
        {!selectedImage && (
          <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--gray-dark)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--charcoal)', display: 'block', marginBottom: '6px' }}>How it works</strong>
            Upload any photo of a car and our AI model (trained on BMW, Mercedes, and Audi) will identify the brand and give you a confidence score.
          </div>
        )}

      </div>
    </div>
  );
};

export default CarRecognizer;