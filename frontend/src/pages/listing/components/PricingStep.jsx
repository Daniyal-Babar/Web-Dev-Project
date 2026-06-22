/**
 * PricingStep - Pricing and availability configuration
 * Features: price input, time unit toggle, availability calendar, security deposit
 * Includes animated earnings preview and spring-loaded toggle switch
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PricingStep.css';

const TIME_UNITS = ['hour', 'day', 'week', 'month'];

const PricingStep = ({ formData, updateFormData, errors }) => {
  const [price, setPrice] = useState(formData.price || '');
  const [priceUnit, setPriceUnit] = useState(formData.priceUnit || 'day');
  const [securityDeposit, setSecurityDeposit] = useState(formData.securityDeposit || 0);
  const [hasSecurityDeposit, setHasSecurityDeposit] = useState(formData.securityDeposit > 0);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);

  /**
   * Calculate estimated monthly earnings based on price and unit
   */
  useEffect(() => {
    if (price) {
      const priceNum = parseFloat(price);
      let monthly = 0;

      switch (priceUnit) {
        case 'hour':
          monthly = priceNum * 8 * 20; // 8 hours/day, 20 days/month
          break;
        case 'day':
          monthly = priceNum * 20; // 20 days/month
          break;
        case 'week':
          monthly = priceNum * 4; // 4 weeks/month
          break;
        case 'month':
          monthly = priceNum;
          break;
        default:
          monthly = 0;
      }

      setEstimatedEarnings(monthly);
    } else {
      setEstimatedEarnings(0);
    }
  }, [price, priceUnit]);

  /**
   * Handle price change
   */
  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      updateFormData('price', value);
    }
  };

  /**
   * Handle price unit change
   */
  const handleUnitChange = (unit) => {
    setPriceUnit(unit);
    updateFormData('priceUnit', unit);
  };

  /**
   * Handle security deposit toggle
   */
  const handleSecurityDepositToggle = () => {
    const newValue = !hasSecurityDeposit;
    setHasSecurityDeposit(newValue);
    if (!newValue) {
      setSecurityDeposit(0);
      updateFormData('securityDeposit', 0);
    }
  };

  /**
   * Handle security deposit amount change
   */
  const handleSecurityDepositChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSecurityDeposit(value);
      updateFormData('securityDeposit', parseFloat(value) || 0);
    }
  };

  return (
    <div className="pricing-step">
      <div className="step-header">
        <h2>Set your pricing</h2>
        <p className="step-description">
          Choose competitive pricing to attract more renters
        </p>
      </div>

      {/* Price input */}
      <motion.div
        className="form-group pricing-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="price" className="form-label required">
          Rental Price
        </label>
        
        <div className="price-input-wrapper">
          {/* <span className="currency-symbol">Rs</span> */}
          <input
            type="text"
            id="price"
            className={`form-input price-input ${errors.price ? 'form-input--error' : ''}`}
            placeholder="Rs 0.00"
            value={price}
            onChange={handlePriceChange}
            aria-required="true"
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? 'price-error' : undefined}
          />
        </div>

        {errors.price && (
          <motion.p
            id="price-error"
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
          >
            {errors.price}
          </motion.p>
        )}
      </motion.div>

      {/* Time unit toggle */}
      <motion.div
        className="form-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="form-label">Price per</label>
        
        <div className="unit-toggle" role="radiogroup" aria-label="Price time unit">
          {TIME_UNITS.map((unit) => (
            <motion.button
              key={unit}
              type="button"
              className={`unit-button ${priceUnit === unit ? 'unit-button--active' : ''}`}
              onClick={() => handleUnitChange(unit)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              role="radio"
              aria-checked={priceUnit === unit}
            >
              {unit.charAt(0).toUpperCase() + unit.slice(1)}
              {priceUnit === unit && (
                <motion.div
                  className="unit-indicator"
                  layoutId="unit-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Earnings preview */}
      <AnimatePresence>
        {price && (
          <motion.div
            className="earnings-preview"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="earnings-card">
              <div className="earnings-icon">💰</div>
              <div className="earnings-content">
                <h4>Estimated Monthly Earnings</h4>
                <motion.p
                  className="earnings-amount"
                  key={estimatedEarnings}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  ₨ {estimatedEarnings.toLocaleString()}
                </motion.p>
                <p className="earnings-note">
                  Based on average rental frequency
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security deposit toggle */}
      <motion.div
        className="form-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="toggle-container">
          <div className="toggle-content">
            <label htmlFor="security-toggle" className="toggle-label">
              Require Security Deposit
            </label>
            <p className="toggle-description">
              Refundable amount to protect against damage
            </p>
          </div>

          <button
            type="button"
            id="security-toggle"
            className={`toggle-switch ${hasSecurityDeposit ? 'toggle-switch--on' : ''}`}
            onClick={handleSecurityDepositToggle}
            role="switch"
            aria-checked={hasSecurityDeposit}
            aria-label="Toggle security deposit requirement"
          >
            <motion.div
              className="toggle-handle"
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>

      {/* Security deposit amount */}
      <AnimatePresence>
        {hasSecurityDeposit && (
          <motion.div
            className="form-group"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label htmlFor="deposit-amount" className="form-label">
              Security Deposit Amount
            </label>
            
            <div className="price-input-wrapper">
              {/* <span className="currency-symbol">₨</span> */}
              <input
                type="text"
                id="deposit-amount"
                className="form-input price-input"
                placeholder="Rs 0.00"
                value={securityDeposit}
                onChange={handleSecurityDepositChange}
              />
            </div>
            
            <p className="help-text">
              💡 Recommended: 20-50% of rental price
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Availability note */}
      <motion.div
        className="availability-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="note-card">
          <span className="note-icon">📅</span>
          <div>
            <h4>Manage Availability</h4>
            <p>
              You can set specific available dates and block unavailable periods after publishing your listing.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Help text */}
      <div className="step-footer">
        <p className="help-text">
          💡 Tip: Research similar items in your area to set competitive pricing!
        </p>
      </div>
    </div>
  );
};

export default PricingStep;
