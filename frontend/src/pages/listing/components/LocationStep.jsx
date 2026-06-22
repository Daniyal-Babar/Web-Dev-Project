/**
 * LocationStep - Location selection and rental rules
 * Features: address input, map integration, rental rules, publish/draft actions
 * Final step before publishing
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LocationStep.css';

const RENTAL_RULES = [
  { id: 'no-smoking', label: 'No smoking', icon: '🚭' },
  { id: 'no-pets', label: 'No pets allowed', icon: '🐕' },
  { id: 'security-required', label: 'Security deposit required', icon: '🔒' },
  { id: 'id-verification', label: 'ID verification required', icon: '🆔' },
  { id: 'insurance-required', label: 'Insurance required', icon: '🛡️' },
  { id: 'pickup-only', label: 'Pickup only (no delivery)', icon: '📍' },
  { id: 'supervision-required', label: 'Supervision required', icon: '👁️' },
  { id: 'cleaning-fee', label: 'Cleaning fee applies', icon: '🧹' }
];

const PAKISTANI_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur'
];

const LocationStep = ({ formData, updateFormData, errors }) => {
  const [address, setAddress] = useState(formData.location?.address || '');
  const [city, setCity] = useState(formData.location?.city || '');
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedRules, setSelectedRules] = useState(formData.rules || []);
  const [additionalRules, setAdditionalRules] = useState('');
  const [damagePolicy, setDamagePolicy] = useState(formData.damagePolicy || '');
  const [lostItemPolicy, setLostItemPolicy] = useState(formData.lostItemPolicy || '');

  /**
   * Filter cities based on input
   */
  useEffect(() => {
    if (city) {
      const filtered = PAKISTANI_CITIES.filter(c =>
        c.toLowerCase().includes(city.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [city]);

  /**
   * Handle address change
   */
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    updateFormData('location', {
      ...formData.location,
      address: value
    });
  };

  /**
   * Handle city change
   */
  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setShowCitySuggestions(true);
    updateFormData('location', {
      ...formData.location,
      city: value
    });
  };

  /**
   * Select city from suggestions
   */
  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setShowCitySuggestions(false);
    updateFormData('location', {
      ...formData.location,
      city: selectedCity
    });
  };

  /**
   * Toggle rental rule
   */
  const handleRuleToggle = (ruleId) => {
    const newRules = selectedRules.includes(ruleId)
      ? selectedRules.filter(id => id !== ruleId)
      : [...selectedRules, ruleId];
    
    setSelectedRules(newRules);
    updateFormData('rules', newRules);
  };

  /**
   * Handle additional rules change
   */
  const handleAdditionalRulesChange = (e) => {
    setAdditionalRules(e.target.value);
  };

  /**
   * Handle damage policy change
   */
  const handleDamagePolicyChange = (e) => {
    const value = e.target.value;
    setDamagePolicy(value);
    // Immediately update formData - use functional update to ensure we have latest state
    updateFormData('damagePolicy', value);
  };

  /**
   * Handle lost item policy change
   */
  const handleLostItemPolicyChange = (e) => {
    const value = e.target.value;
    setLostItemPolicy(value);
    // Immediately update formData - use functional update to ensure we have latest state
    updateFormData('lostItemPolicy', value);
  };

  // Ensure formData is synced when component mounts or formData changes
  useEffect(() => {
    // If local state has values but formData doesn't, sync them
    if (damagePolicy && !formData.damagePolicy) {
      updateFormData('damagePolicy', damagePolicy);
    }
    if (lostItemPolicy && !formData.lostItemPolicy) {
      updateFormData('lostItemPolicy', lostItemPolicy);
    }
  }, []); // Only on mount


  return (
    <div className="location-step">
      <div className="step-header">
        <h2>Where is it located?</h2>
        <p className="step-description">
          Help renters find your listing easily
        </p>
      </div>

      {/* Address input */}
      <motion.div
        className="form-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="address" className="form-label required">
          Street Address
        </label>
        <input
          type="text"
          id="address"
          className={`form-input ${errors.location ? 'form-input--error' : ''}`}
          placeholder="Enter your street address"
          value={address}
          onChange={handleAddressChange}
          aria-required="true"
          aria-invalid={!!errors.location}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
        {errors.location && (
          <motion.p
            id="location-error"
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
          >
            {errors.location}
          </motion.p>
        )}
      </motion.div>

      {/* City input with autocomplete */}
      <motion.div
        className="form-group city-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label htmlFor="city" className="form-label required">
          City
        </label>
        <div className="autocomplete-wrapper">
          <input
            type="text"
            id="city"
            className="form-input divider-bottom"
            placeholder="Start typing your city"
            value={city}
            onChange={handleCityChange}
            onFocus={() => setShowCitySuggestions(true)}
            aria-required="true"
            aria-autocomplete="list"
            aria-controls="city-suggestions"
          />
          
          {/* City suggestions dropdown */}
          <AnimatePresence>
            {showCitySuggestions && filteredCities.length > 0 && (
              <motion.ul
                id="city-suggestions"
                className="suggestions-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                role="listbox"
              >
                {filteredCities.map((cityName) => (
                  <motion.li
                    key={cityName}
                    className="suggestion-item"
                    onClick={() => handleCitySelect(cityName)}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    role="option"
                  >
                    📍 {cityName}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Map placeholder (can be integrated with actual map API) */}
      <motion.div
        className="map-placeholder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="map-content">
          <motion.div
            className="map-pin"
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            📍
          </motion.div>
          <p>Map View</p>
          <span className="map-note">
            {city ? `${city}, Pakistan` : 'Select a city to view location'}
          </span>
        </div>
      </motion.div>

      {/* Rental rules section */}
      <motion.div
        className="rules-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="location-page-section-title">Rental Rules & Requirements</h3>
        <p className="section-description">
          Select all rules that apply to your rental
        </p>

        <div className="rules-grid">
          {RENTAL_RULES.map((rule, index) => {
            const isSelected = selectedRules.includes(rule.id);
            
            return (
              <motion.div
                key={rule.id}
                className={`rule-card ${isSelected ? 'rule-card--selected' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="button"
                  className="rule-button"
                  onClick={() => handleRuleToggle(rule.id)}
                  aria-pressed={isSelected}
                >
                  <span className="rule-icon">{rule.icon}</span>
                  <span className="rule-label">{rule.label}</span>
                  
                  {/* Checkmark */}
                  <motion.div
                    className="rule-check"
                    initial={false}
                    animate={{
                      scale: isSelected ? 1 : 0,
                      opacity: isSelected ? 1 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    ✓
                  </motion.div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Additional rules textarea */}
      <motion.div
        className="form-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <label htmlFor="additional-rules" className="form-label">
          Additional Rules (Optional)
        </label>
        <textarea
          id="additional-rules"
          className="form-textarea"
          placeholder="Any other rules or requirements renters should know about..."
          rows="4"
          value={additionalRules}
          onChange={handleAdditionalRulesChange}
        />
      </motion.div>

      {/* Safety Policies Section */}
      <motion.div
        className="policies-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <h3 className="location-page-section-title">Safety & Policies</h3>
        <p className="section-description">
          Define your policies for damage and lost items. This helps protect both you and renters.
        </p>

        {/* Damage Policy */}
        <motion.div
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label htmlFor="damage-policy" className="form-label required">
            Damage Policy
          </label>
          <textarea
            id="damage-policy"
            className={`form-textarea ${errors.damagePolicy ? 'form-input--error' : ''}`}
            placeholder="e.g., Renters are responsible for any damage beyond normal wear and tear. Damage will be assessed and charged accordingly."
            rows="3"
            value={damagePolicy}
            onChange={handleDamagePolicyChange}
            aria-required="true"
            aria-invalid={!!errors.damagePolicy}
          />
          {errors.damagePolicy && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
            >
              {errors.damagePolicy}
            </motion.p>
          )}
        </motion.div>

        {/* Lost Item Policy */}
        <motion.div
          className="form-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <label htmlFor="lost-item-policy" className="form-label required">
            Lost Item Policy
          </label>
          <textarea
            id="lost-item-policy"
            className={`form-textarea ${errors.lostItemPolicy ? 'form-input--error' : ''}`}
            placeholder="e.g., Renters are responsible for lost items. Replacement cost will be charged based on current market value."
            rows="3"
            value={lostItemPolicy}
            onChange={handleLostItemPolicyChange}
            aria-required="true"
            aria-invalid={!!errors.lostItemPolicy}
          />
          {errors.lostItemPolicy && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
            >
              {errors.lostItemPolicy}
            </motion.p>
          )}
        </motion.div>
      </motion.div>

      {/* Final checklist */}
      <motion.div
        className="final-checklist"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h4>✅ Before Publishing</h4>
        <ul className="checklist">
          <li className={formData.category ? 'checked' : ''}>
            Category selected
          </li>
          <li className={formData.title ? 'checked' : ''}>
            Title and description added
          </li>
          <li className={formData.price ? 'checked' : ''}>
            Price set
          </li>
          <li className={formData.images?.length > 0 ? 'checked' : ''}>
            Photos uploaded
          </li>
          <li className={address && city ? 'checked' : ''}>
            Location specified
          </li>
          <li className={formData.damagePolicy && formData.damagePolicy.trim().length >= 10 ? 'checked' : ''}>
            Damage policy defined
          </li>
          <li className={formData.lostItemPolicy && formData.lostItemPolicy.trim().length >= 10 ? 'checked' : ''}>
            Lost item policy defined
          </li>
        </ul>
      </motion.div>

      {/* Help text */}
      <div className="step-footer">
        <p className="help-text">
          🎉 You're almost done! Review your listing in the preview, then click "Publish Listing" below.
        </p>
      </div>
    </div>
  );
};

export default LocationStep;
