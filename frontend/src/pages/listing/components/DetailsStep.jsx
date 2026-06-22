/**
 * DetailsStep - Dynamic form fields based on selected category
 * Includes title, description, and category-specific fields
 * Features inline validation and animated field reveals
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './DetailsStep.css';

// Category-specific field configurations
const CATEGORY_FIELDS = {
  animals: [
    { name: 'breed', label: 'Breed', type: 'text', required: true, placeholder: 'e.g., Labrador, Persian Cat' },
    { name: 'age', label: 'Age', type: 'text', required: true, placeholder: 'e.g., 2 years' },
    { name: 'weight', label: 'Weight', type: 'text', required: false, placeholder: 'e.g., 25 kg' },
    { name: 'temperament', label: 'Temperament', type: 'text', required: false, placeholder: 'e.g., Friendly, playful' },
    { name: 'vaccinated', label: 'Vaccinated', type: 'select', options: ['Yes', 'No', 'Partially'], required: true },
    { name: 'specialNeeds', label: 'Special Needs/Care', type: 'textarea', required: false }
  ],
  vehicles: [
    { name: 'make', label: 'Make', type: 'text', required: true, placeholder: 'e.g., Toyota, Honda' },
    { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., Corolla, Civic' },
    { name: 'year', label: 'Year', type: 'number', required: true, placeholder: 'e.g., 2020' },
    { name: 'fuelType', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
    { name: 'transmission', label: 'Transmission', type: 'select', options: ['Automatic', 'Manual'], required: true },
    { name: 'mileage', label: 'Mileage', type: 'text', required: false, placeholder: 'e.g., 50,000 km' },
    { name: 'features', label: 'Features', type: 'textarea', required: false, placeholder: 'AC, Navigation, Bluetooth...' }
  ],
  houses: [
    { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Apartment', 'House', 'Room', 'Studio', 'Villa'], required: true },
    { name: 'bedrooms', label: 'Bedrooms', type: 'number', required: true, placeholder: '0' },
    { name: 'bathrooms', label: 'Bathrooms', type: 'number', required: true, placeholder: '0' },
    { name: 'area', label: 'Area (sq ft)', type: 'number', required: true, placeholder: 'e.g., 1200' },
    { name: 'furnished', label: 'Furnished', type: 'select', options: ['Fully Furnished', 'Semi-Furnished', 'Unfurnished'], required: true },
    { name: 'amenities', label: 'Amenities', type: 'textarea', required: false, placeholder: 'WiFi, Parking, Gym, Pool...' },
    { name: 'floor', label: 'Floor Number', type: 'text', required: false, placeholder: 'e.g., 3rd Floor' }
  ],
  services: [
    { name: 'serviceType', label: 'Service Type', type: 'text', required: true, placeholder: 'e.g., Photography, Consulting' },
    { name: 'experience', label: 'Years of Experience', type: 'number', required: true, placeholder: 'e.g., 5' },
    { name: 'qualifications', label: 'Qualifications', type: 'textarea', required: false, placeholder: 'Certifications, degrees, training...' },
    { name: 'availability', label: 'Typical Availability', type: 'text', required: false, placeholder: 'e.g., Weekends, Evenings' },
    { name: 'equipment', label: 'Equipment Included', type: 'textarea', required: false, placeholder: 'What tools/equipment do you provide?' }
  ],
  equipment: [
    { name: 'equipmentType', label: 'Equipment Type', type: 'text', required: true, placeholder: 'e.g., Camera, Drill, Ladder' },
    { name: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., Canon, Bosch' },
    { name: 'model', label: 'Model', type: 'text', required: false, placeholder: 'Model number or name' },
    { name: 'condition', label: 'Condition', type: 'select', options: ['Like New', 'Excellent', 'Good', 'Fair'], required: true },
    { name: 'specifications', label: 'Specifications', type: 'textarea', required: false, placeholder: 'Technical specs, power, dimensions...' },
    { name: 'accessories', label: 'Included Accessories', type: 'textarea', required: false, placeholder: 'Extra parts, cases, batteries...' }
  ],
  clothes: [
    { name: 'clothingType', label: 'Clothing Type', type: 'text', required: true, placeholder: 'e.g., Dress, Suit, Costume' },
    { name: 'size', label: 'Size', type: 'text', required: true, placeholder: 'e.g., M, L, XL, 32' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Men', 'Women', 'Unisex', 'Kids'], required: true },
    { name: 'brand', label: 'Brand', type: 'text', required: false, placeholder: 'Brand name' },
    { name: 'color', label: 'Color', type: 'text', required: true, placeholder: 'e.g., Black, Navy Blue' },
    { name: 'condition', label: 'Condition', type: 'select', options: ['New', 'Like New', 'Excellent', 'Good'], required: true },
    { name: 'occasion', label: 'Suitable For', type: 'text', required: false, placeholder: 'e.g., Wedding, Party, Formal' }
  ]
};

const DetailsStep = ({ formData, updateFormData, errors }) => {
  const [localTitle, setLocalTitle] = useState(formData.title || '');
  const [localDescription, setLocalDescription] = useState(formData.description || '');
  const [localDetails, setLocalDetails] = useState(formData.details || {});

  // Get fields for selected category
  const categoryFields = CATEGORY_FIELDS[formData.category] || [];

  /**
   * Update title with character count
   */
  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setLocalTitle(value);
      updateFormData('title', value);
    }
  };

  /**
   * Update description with character count
   */
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setLocalDescription(value);
      updateFormData('description', value);
    }
  };

  /**
   * Update category-specific detail fields
   */
  const handleDetailChange = (fieldName, value) => {
    const updatedDetails = {
      ...localDetails,
      [fieldName]: value
    };
    setLocalDetails(updatedDetails);
    updateFormData('details', updatedDetails);
  };

  return (
    <div className="details-step">
      <div className="step-header">
        <h2>Tell us about your {formData.category}</h2>
        <p className="step-description">
          Provide detailed information to attract renters
        </p>
      </div>

      {/* Title field */}
      <motion.div
        className="form-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="title" className="form-label required">
          Title
        </label>
        <input
          type="text"
          id="title"
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          placeholder="Give your listing a catchy title"
          value={localTitle}
          onChange={handleTitleChange}
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        <div className="form-meta">
          <span className="char-count">{localTitle.length}/100</span>
        </div>
        {errors.title && (
          <motion.p
            id="title-error"
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
          >
            {errors.title}
          </motion.p>
        )}
      </motion.div>

      {/* Description field */}
      <motion.div
        className="form-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label htmlFor="description" className="form-label required">
          Description
        </label>
        <textarea
          id="description"
          className={`form-textarea ${errors.description ? 'form-input--error' : ''}`}
          placeholder="Describe your item in detail. What makes it special?"
          rows="5"
          value={localDescription}
          onChange={handleDescriptionChange}
          aria-required="true"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        <div className="form-meta">
          <span className="char-count">{localDescription.length}/1000</span>
        </div>
        {errors.description && (
          <motion.p
            id="description-error"
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
          >
            {errors.description}
          </motion.p>
        )}
      </motion.div>

      {/* Category-specific fields */}
      {categoryFields.length > 0 && (
        <div className="category-fields">
          <h3 className="details-page-section-title">Additional Details</h3>
          
          {categoryFields.map((field, index) => (
            <motion.div
              key={field.name}
              className="form-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <label
                htmlFor={field.name}
                className={`form-label ${field.required ? 'required' : ''}`}
              >
                {field.label}
              </label>

              {field.type === 'select' ? (
                <select
                  id={field.name}
                  className="form-select"
                  value={localDetails[field.name] || ''}
                  onChange={(e) => handleDetailChange(field.name, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  className="form-textarea"
                  placeholder={field.placeholder}
                  rows="3"
                  value={localDetails[field.name] || ''}
                  onChange={(e) => handleDetailChange(field.name, e.target.value)}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  className="form-input"
                  placeholder={field.placeholder}
                  value={localDetails[field.name] || ''}
                  onChange={(e) => handleDetailChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="step-footer">
        <p className="help-text">
          💡 Tip: Detailed and honest descriptions help build trust with renters!
        </p>
      </div>
    </div>
  );
};

export default DetailsStep;
