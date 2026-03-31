// src/components/tools/CarRecognizer.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Tools.css';
import { api } from '../../services/api';

const CarRecognizer = ({ sessionToken, user }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const fileInputRef = useRef(null);

  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
    
    // Load recent predictions from localStorage
    const saved = localStorage.getItem('recentCarPredictions');
    if (saved) {
      try {
        setRecentPredictions(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('Failed to load recent predictions');
      }
    }
  }, []);

  const checkServerStatus = async () => {
    try {
      const token = sessionToken || localStorage.getItem('token');
      const data = await api.getRecognitionStatus(token);
      setServerStatus(data);
      console.log('Recognition server status:', data);
    } catch (err) {
      console.error('Failed to check server status:', err);
      setServerStatus({ available: false });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setPrediction(null);
      setError('');
    }
  };

  const recognizeCar = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = sessionToken || localStorage.getItem('token');
      const data = await api.recognizeCar(selectedFile, token);
      
      if (data.success) {
        setPrediction(data);
        
        // Save to recent predictions
        const newPrediction = {
          id: Date.now(),
          brand: data.predictedBrand,
          confidence: data.confidence,
          timestamp: new Date().toISOString(),
          mock: data.mock || false
        };
        
        const updated = [newPrediction, ...recentPredictions].slice(0, 5);
        setRecentPredictions(updated);
        localStorage.setItem('recentCarPredictions', JSON.stringify(updated));
        
        if (data.mock) {
          console.log('⚠️ Using mock prediction (ML server not available)');
        } else {
          console.log('✅ ML prediction successful');
        }
      } else {
        setError(data.message || data.error || 'Recognition failed. Please try another image.');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setPrediction(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>🚗 Car Brand Recognizer</h2>
        <p>Upload a photo of any car to identify its brand using AI</p>
        {serverStatus && !serverStatus.available && (
          <p style={{ fontSize: '12px', color: '#e67e22', marginTop: '8px', padding: '8px', background: '#fff3e0', borderRadius: '4px' }}>
            ⚠️ ML server is not available. Using mock predictions for testing. Start the Python server for real predictions.
          </p>
        )}
      </div>

      <div className="recognizer-body">

        {/* Upload area */}
        <label className="upload-area" htmlFor="car-upload">
          {selectedImage ? (
            <div style={{ position: 'relative' }}>
              <img src={selectedImage} alt="Selected car" className="preview-image" />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  resetForm();
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <div className="upload-icon">📸</div>
              <h3>Upload a Car Photo</h3>
              <p>Supports JPG, PNG, WEBP (max 10MB)</p>
              <span className="upload-btn">Choose Image</span>
            </>
          )}
          <input
            ref={fileInputRef}
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
            <div className="result-brand" style={{ color: getConfidenceColor(prediction.confidence) }}>
              {prediction.predictedBrand}
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: 'var(--gray-lighter)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${prediction.confidence}%`, 
                  height: '100%', 
                  background: getConfidenceColor(prediction.confidence),
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <span className="result-confidence" style={{ marginTop: '8px', display: 'inline-block' }}>
                {prediction.confidence?.toFixed(1)}% confident
              </span>
            </div>
            
            {prediction.top3 && prediction.top3.length > 1 && (
              <div style={{ marginTop: '20px', textAlign: 'left', borderTop: '1px solid var(--gray-lighter)', paddingTop: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-dark)' }}>
                  Other possibilities:
                </p>
                {prediction.top3.slice(1).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', padding: '4px 0' }}>
                    <span>{item.brand}</span>
                    <span style={{ color: 'var(--gray)' }}>{item.confidence?.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
            
            {prediction.mock && (
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#e67e22', background: '#fff3e0', padding: '10px', borderRadius: '6px' }}>
                ⚠️ Mock prediction (ML server not available)
                <button 
                  onClick={checkServerStatus}
                  style={{ marginLeft: '10px', background: 'none', border: '1px solid #e67e22', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                >
                  Retry Connection
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={resetForm}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'none',
                  border: '1px solid var(--gray-lighter)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Recognize Another Car
              </button>
              {prediction.predictedBrand && (
                <button 
                  onClick={() => {
                    // Navigate to inventory with brand filter
                    window.location.href = `/inventory?make=${encodeURIComponent(prediction.predictedBrand)}`;
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--black)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Browse {prediction.predictedBrand} Cars
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recent Predictions */}
        {recentPredictions.length > 0 && !prediction && !selectedImage && (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--gray-dark)' }}>Recent Recognitions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentPredictions.map(pred => (
                <div 
                  key={pred.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--white)',
                    border: '1px solid var(--gray-lighter)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    // Optionally re-run recognition with that brand
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14px' }}>{pred.brand}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--gray)', marginLeft: '8px' }}>
                      {new Date(pred.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: getConfidenceColor(pred.confidence) }}>
                    {pred.confidence?.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        {!selectedImage && !prediction && (
          <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--cream)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--gray-dark)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--charcoal)', display: 'block', marginBottom: '6px' }}>How it works</strong>
            <p>Upload any photo of a car and our AI model will identify the brand and give you a confidence score.</p>
            <p style={{ marginTop: '8px', fontSize: '12px' }}>
              📸 Best results with clear, front-facing photos of the car
            </p>
            <p style={{ marginTop: '4px', fontSize: '12px' }}>
              🤖 Powered by TensorFlow deep learning model
            </p>
            <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--gray)' }}>
              Recognizable brands: BMW, Mercedes, Audi, Toyota, Honda, Ford, Volkswagen, Nissan, Hyundai, Kia
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CarRecognizer;