/**
 * MediaStep - Photo and media upload with drag-and-drop
 * Features: upload, reorder, set cover image, preview, mobile camera support
 * Animated upload progress and image reordering
 */

import React, { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import './MediaStep.css';

const MediaStep = ({ formData, updateFormData, errors }) => {
  const [images, setImages] = useState(formData.images || []);
  const [coverIndex, setCoverIndex] = useState(formData.coverImageIndex || 0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    handleFiles(files);
  };

  /**
   * Process and upload files
   */
  const handleFiles = async (files) => {
    if (images.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    for (const file of files) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          uploaded: false
        };

        setImages(prev => [...prev, newImage]);
        
        // Simulate upload progress
        simulateUpload(newImage.id);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Simulate upload progress (replace with actual upload logic)
   */
  const simulateUpload = (imageId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({
        ...prev,
        [imageId]: progress
      }));

      if (progress >= 100) {
        clearInterval(interval);
        setImages(prev =>
          prev.map(img =>
            img.id === imageId ? { ...img, uploaded: true } : img
          )
        );
        // Update parent form data
        setTimeout(() => {
          updateFormData('images', images);
        }, 100);
      }
    }, 200);
  };

  /**
   * Remove image
   */
  const handleRemoveImage = (imageId) => {
    const newImages = images.filter(img => img.id !== imageId);
    setImages(newImages);
    updateFormData('images', newImages);
    
    // Adjust cover index if necessary
    if (coverIndex >= newImages.length) {
      const newCoverIndex = Math.max(0, newImages.length - 1);
      setCoverIndex(newCoverIndex);
      updateFormData('coverImageIndex', newCoverIndex);
    }
  };

  /**
   * Set cover image
   */
  const handleSetCover = (index) => {
    setCoverIndex(index);
    updateFormData('coverImageIndex', index);
  };

  /**
   * Handle reorder
   */
  const handleReorder = (newOrder) => {
    setImages(newOrder);
    updateFormData('images', newOrder);
    
    // Update cover index to maintain the same image as cover
    const coverImage = images[coverIndex];
    const newCoverIndex = newOrder.findIndex(img => img.id === coverImage?.id);
    if (newCoverIndex !== -1) {
      setCoverIndex(newCoverIndex);
      updateFormData('coverImageIndex', newCoverIndex);
    }
  };

  /**
   * Open file picker
   */
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="media-step">
      <div className="step-header">
        <h2>Add photos</h2>
        <p className="step-description">
          Great photos help your listing stand out! Upload up to 10 images.
        </p>
      </div>

      {/* Error message */}
      {errors.images && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          {errors.images}
        </motion.div>
      )}

      {/* Upload area */}
      <motion.div
        className={`upload-area ${isDragging ? 'upload-area--dragging' : ''} ${
          images.length > 0 ? 'upload-area--has-images' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="file-input"
          aria-label="Upload images"
        />

        {images.length === 0 ? (
          <div className="upload-prompt" onClick={handleClickUpload}>
            <motion.div
              className="upload-icon"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              📸
            </motion.div>
            <h3>Drag photos here or click to browse</h3>
            <p>JPG, PNG up to 10MB each</p>
            <button type="button" className="btn btn-secondary">
              Choose Files
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="add-more-button"
            onClick={handleClickUpload}
          >
            + Add More Photos ({images.length}/10)
          </button>
        )}
      </motion.div>

      {/* Image grid with reordering */}
      {images.length > 0 && (
        <div className="images-section">
          <div className="section-header">
            <h3>Your Photos</h3>
            <p className="help-text">
              Drag to reorder • First image is the cover
            </p>
          </div>

          <Reorder.Group
            axis="x"
            values={images}
            onReorder={handleReorder}
            className="images-grid"
          >
            {images.map((image, index) => (
              <Reorder.Item
                key={image.id}
                value={image}
                className="image-item"
                whileDrag={{ scale: 1.05, zIndex: 10 }}
              >
                <motion.div
                  className={`image-card ${index === coverIndex ? 'image-card--cover' : ''}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {/* Image preview */}
                  <div className="image-preview">
                    <img src={image.preview} alt={`Upload ${index + 1}`} />
                    
                    {/* Upload progress */}
                    {!image.uploaded && uploadProgress[image.id] && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress[image.id]}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {uploadProgress[image.id]}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cover badge */}
                  {index === coverIndex && (
                    <motion.div
                      className="cover-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      ⭐ Cover Photo
                    </motion.div>
                  )}

                  {/* Image actions */}
                  <div className="image-actions">
                    {index !== coverIndex && (
                      <button
                        type="button"
                        className="image-action-btn"
                        onClick={() => handleSetCover(index)}
                        title="Set as cover"
                      >
                        <span>⭐</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="image-action-btn image-action-btn--delete"
                      onClick={() => handleRemoveImage(image.id)}
                      title="Remove"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>

                  {/* Drag handle */}
                  <div className="drag-handle" title="Drag to reorder">
                    ⋮⋮
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Tips */}
      <motion.div
        className="tips-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4>📝 Photo Tips</h4>
        <ul className="tips-list">
          <li>Use natural lighting for best results</li>
          <li>Show your item from multiple angles</li>
          <li>Include close-ups of important features</li>
          <li>Keep backgrounds clean and uncluttered</li>
          <li>First photo appears as thumbnail in listings</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default MediaStep;
