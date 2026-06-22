/**
 * StepProgress - Visual indicator showing progress through listing creation steps
 * Displays step numbers, names, and completion status
 * Allows navigation to completed steps
 */

import React from 'react';
import { motion } from 'framer-motion';
import './StepProgress.css';

const StepProgress = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="step-progress" role="navigation" aria-label="Progress through listing steps">
      <div className="step-progress-line">
        {/* Animated progress bar */}
        <motion.div
          className="step-progress-fill"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` 
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      <div className="step-items">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber <= currentStep;

          return (
            <div
              key={step.id}
              className={`step-item ${isCurrent ? 'step-item--current' : ''} ${
                isCompleted ? 'step-item--completed' : ''
              }`}
            >
              <button
                type="button"
                className="step-button"
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                aria-label={`Step ${stepNumber}: ${step.name}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Step circle with number or checkmark */}
                <motion.div
                  className="step-circle"
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? (
                    <motion.svg
                      className="step-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  ) : (
                    <span className="step-number">{stepNumber}</span>
                  )}
                </motion.div>

                {/* Step name */}
                <span className="step-name">{step.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
