import React from 'react';
import './Stepper.css';

const Stepper = ({ steps, current, errorSteps = [], validSteps = [] }) => {
  return (
    <div className="stepper-container">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isPassed = stepNum < current;
        const isValid = validSteps.includes(stepNum);
        const hasError = errorSteps.includes(stepNum);
        
        const isPassedDot1 = stepNum < current;
        const isValidDot1 = validSteps.includes(stepNum);
        const isWarningDot1 = isPassedDot1 && !isValidDot1;

        const nextStepNum = stepNum + 1;
        const isPassedDot2 = nextStepNum < current;
        const isValidDot2 = validSteps.includes(nextStepNum);
        const isWarningDot2 = isPassedDot2 && !isValidDot2;

        return (
          <div
            key={label}
            className={`stepper-item ${isActive ? 'active' : ''} ${isPassed && isValid ? 'completed' : ''} ${isPassed && !isValid ? 'passed-invalid' : ''} ${hasError ? 'error' : ''}`}
          >
            <div className="stepper-circle">
              {hasError ? (
                <span className="error-icon">✕</span>
              ) : (isPassed && !isValid) ? (
                <span className="warning-icon">!</span>
              ) : (isPassed && isValid) ? (
                <span className="check">✓</span>
              ) : (
                stepNum
              )}
            </div>
            <div className="stepper-label">{label}</div>
            {idx < steps.length - 1 && (
              <div className={`stepper-connector ${
                (isWarningDot1 || isWarningDot2) ? 'warning' : ''
              } ${
                (current === idx + 1 || current === idx + 2) ? 'active' : ''
              } ${
                (validSteps.includes(idx + 2) && (current > idx + 1)) ? 'completed' : ''
              } ${
                errorSteps.includes(idx + 2) ? 'error' : ''
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
