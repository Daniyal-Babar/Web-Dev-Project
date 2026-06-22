/**
 * Edit Listing Modal Component
 * 
 * Modal for editing listing title and description
 * Features: Form validation, character counter, save/cancel actions
 */

import React, { useState, useEffect } from 'react';
import './EditListingModal.css';

const EditListingModal = ({ listing, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Character limits
  const TITLE_MAX = 100;
  const DESCRIPTION_MAX = 2000;

  useEffect(() => {
    if (listing && isOpen) {
      setFormData({
        title: listing.title || '',
        description: listing.description || ''
      });
      setErrors({});
    }
  }, [listing, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > TITLE_MAX) {
      newErrors.title = `Title must be ${TITLE_MAX} characters or less`;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > DESCRIPTION_MAX) {
      newErrors.description = `Description must be ${DESCRIPTION_MAX} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(listing._id, formData);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save changes' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={handleBackdropClick}>
      <div className="edit-modal-container">
        <div className="edit-modal-header">
          <h2>Edit Listing</h2>
          <button 
            className="edit-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          {/* Title Field */}
          <div className="edit-form-group">
            <label htmlFor="title">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              maxLength={TITLE_MAX}
              disabled={isSaving}
            />
            <div className="field-footer">
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
              <span className={`char-counter ${formData.title.length > TITLE_MAX * 0.9 ? 'warning' : ''}`}>
                {formData.title.length}/{TITLE_MAX}
              </span>
            </div>
          </div>

          {/* Description Field */}
          <div className="edit-form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              rows={8}
              maxLength={DESCRIPTION_MAX}
              disabled={isSaving}
            />
            <div className="field-footer">
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
              <span className={`char-counter ${formData.description.length > DESCRIPTION_MAX * 0.9 ? 'warning' : ''}`}>
                {formData.description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="edit-modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingModal;
