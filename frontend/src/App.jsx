import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Download, RefreshCcw, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    setError(null);
    setSelectedImage(URL.createObjectURL(file));
    setProcessedImage(null);
    setIsProcessing(true);
    setShowSlowLoadingMessage(false);

    // Show a slow loading message if it takes more than 3 seconds
    const slowLoadingTimer = setTimeout(() => {
      setShowSlowLoadingMessage(true);
    }, 3000);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/remove-bg`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the backend server. Make sure it is running.');
      }

      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Make sure the Python server is running on the configured port.');
    } finally {
      clearTimeout(slowLoadingTimer);
      setIsProcessing(false);
      setShowSlowLoadingMessage(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'removed_bg.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <div className="bg-grid"></div>

      <header>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="header-content"
        >
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon"><RefreshCcw size={24} /></div>
              <h1>Clean Background</h1>
            </div>
            <p className="subtitle">Professional image background removal, instantly.</p>
          </div>

          <div className="header-right">
            <div className="secure-badge">
              <CheckCircle2 size={20} color="#10b981" />
              <span>Secure and Fast</span>
            </div>
          </div>
        </motion.div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {!selectedImage ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className={`upload-zone glass ${dragActive ? 'active' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="upload-content">
                <div className="icon-circle">
                  <Upload size={32} />
                </div>
                <h2>Drop your image here</h2>
                <p>or click to browse from your computer</p>
                <label className="button-primary">
                  Choose File
                  <input type="file" onChange={(e) => handleFile(e.target.files[0])} accept="image/*" />
                </label>
                <div className="upload-hints">
                  <span>PNG, JPG, WEBP</span>
                  <span>Max size: 10MB</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="result-view"
            >
              <div className="result-grid">
                <div className="image-card glass">
                  <span className="badge">Original</span>
                  <img src={selectedImage} alt="Original" />
                </div>

                <div className="image-card glass">
                  <span className="badge accent">Processed</span>
                  {isProcessing ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>{showSlowLoadingMessage ? 'Waking up server... (First run may take a minute)' : 'Removing background...'}</p>
                    </div>
                  ) : processedImage ? (
                    <img src={processedImage} alt="Processed" />
                  ) : (
                    <div className="error-placeholder">
                      <AlertCircle size={48} color="#ef4444" />
                      <p>Failed to process</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="actions glass">
                <div className="action-info">
                  {processedImage && (
                    <div className="status-badge success">
                      <CheckCircle2 size={16} />
                      Background Removed
                    </div>
                  )}
                  {error && (
                    <div className="status-badge error">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                </div>
                <div className="button-group">
                  <button onClick={reset} className="button-secondary">
                    <RefreshCcw size={18} />
                    Try Another
                  </button>
                  <button
                    onClick={downloadImage}
                    className="button-primary"
                    disabled={!processedImage || isProcessing}
                  >
                    <Download size={18} />
                    Download PNG
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer>
        <p>&copy; 2026 Clean Background. Powered by Hirad.</p>
      </footer>

      <style jsx>{`
        .app-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          font-weight: 500;
          color: #10b981;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .logo-icon {
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          padding: 0.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 1.125rem;
        }

        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center; /* Better for non-scrollable pages */
          width: 100%;
          padding-bottom: 2rem;
        }

        .upload-zone {
          width: 100%;
          max-width: 600px;
          padding: 4rem 2rem;
          text-align: center;
          border: 2px dashed var(--border-color);
          transition: all 0.3s ease;
        }

        .upload-zone.active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
          transform: scale(1.02);
        }

        .icon-circle {
          width: 80px;
          height: 80px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: var(--primary);
        }

        .upload-content h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .upload-content p {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .upload-hints {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .button-primary {
          background: var(--primary);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .button-primary:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        }

        .button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid var(--border-color);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .button-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--text-muted);
        }

        .result-view {
          width: 100%;
        }

        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .image-card {
          position: relative;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: 
            linear-gradient(45deg, #1e293b 25%, transparent 25%),
            linear-gradient(-45deg, #1e293b 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #1e293b 75%),
            linear-gradient(-45deg, transparent 75%, #1e293b 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          overflow: hidden;
        }

        .image-card img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.6);
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 10;
        }

        .badge.accent {
          background: var(--accent);
        }

        .actions {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .button-group {
          display: flex;
          gap: 1rem;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.success {
          color: var(--accent);
        }

        .status-badge.error {
          color: #ef4444;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-state {
          text-align: center;
          color: var(--text-muted);
        }

        footer {
          text-align: center;
          padding: 2rem 0;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .result-grid {
            grid-template-columns: 1fr;
          }
          .actions {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }
          .button-group {
            width: 100%;
            flex-direction: column;
          }
          .button-primary, .button-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
