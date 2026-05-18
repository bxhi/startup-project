import React from 'react';
import './Stepper.css';

const Stepper = ({ steps, current, errorSteps = [], validSteps = [] }) => {
  return (
    <div className="stepper-container">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isPassed = stepNum < current;
        const hasError = errorSteps.includes(stepNum);
        
        // A step is considered "valid" (success) ONLY if it's explicitly in validSteps
        const isStepSuccess = validSteps.includes(stepNum);
        const isStepWarning = isPassed && !isStepSuccess && !hasError;

        return (
          <div
            key={label}
            className={`stepper-item ${isActive ? 'active' : ''} ${isStepSuccess ? 'completed' : ''} ${hasError ? 'error' : ''} ${isStepWarning ? 'passed-invalid' : ''}`}
          >
            <div className="stepper-circle">
              {hasError ? (
                <span className="error-icon">✕</span>
              ) : isStepSuccess ? (
                <span className="check">✓</span>
              ) : isStepWarning ? (
                <span className="warning-icon">!</span>
              ) : (
                stepNum
              )}
            </div>
            <div className="stepper-label">{label}</div>
            {idx < steps.length - 1 && (
              <div className={`stepper-connector ${
                isStepSuccess ? 'completed' : (hasError ? 'error' : (isStepWarning ? 'warning' : (isActive ? 'active' : '')))
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
