/**
 * Challenge Modal Component
 * 
 * Displays security challenges to users when suspicious activity is detected.
 * Challenge types:
 * - Math: Simple arithmetic problem
 * - Time: Wait period before retry
 * - Interactive: Click/tap specific location
 * - Custom: Server-provided challenge
 */

import { useState, useEffect, useRef } from 'react';
import { evaluate } from 'mathjs';
import { theme } from '../styles/theme.js';

export function ChallengeModal({ 
  challenge, 
  onSuccess, 
  onFail, 
  onCancel,
  maxAttempts = 3 
}) {
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [clickTarget, setClickTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Initialize challenge based on type
    if (challenge.type === 'time') {
      setTimeRemaining(challenge.waitSeconds || 30);
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onSuccess?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
    
    if (challenge.type === 'interactive') {
      // Generate random click target
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const x = Math.floor(Math.random() * (canvas.width - 40)) + 20;
        const y = Math.floor(Math.random() * (canvas.height - 40)) + 20;
        
        setClickTarget({ x, y });
        
        // Draw target
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = theme.accentBlue;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [challenge, onSuccess]);
  
  const handleSubmitMath = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const userAnswer = parseInt(answer, 10);
      const sanitizedQuestion = challenge.question.replace(/[^0-9+\-*/() ]/g, '');
      const correctAnswer = evaluate(sanitizedQuestion);
      
      if (userAnswer === correctAnswer) {
        onSuccess?.();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          setError(`Too many failed attempts. Please try again later.`);
          setTimeout(() => onFail?.(), 2000);
        } else {
          setError(`Incorrect answer. ${maxAttempts - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      setError('Invalid answer format');
    } finally {
      setIsSubmitting(false);
      setAnswer('');
    }
  };
  
  const handleCanvasClick = (e) => {
    if (!clickTarget || challenge.type !== 'interactive') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within target radius (15px)
    const distance = Math.sqrt(
      Math.pow(x - clickTarget.x, 2) + 
      Math.pow(y - clickTarget.y, 2)
    );
    
    if (distance <= 15) {
      onSuccess?.();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setError(`Too many failed attempts. Please try again later.`);
        setTimeout(() => onFail?.(), 2000);
      } else {
        setError(`Missed the target. ${maxAttempts - newAttempts} attempts remaining.`);
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && challenge.type === 'math') {
      handleSubmitMath();
    }
  };
  
  if (!challenge) return null;
  
  return (
    <div style={overlayStyle}>
      <div ref={modalRef} style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleStyle}>
            🔒 Security Verification
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              style={closeButtonStyle}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Content */}
        <div style={contentStyle}>
          {/* Explanation */}
          <div style={explanationStyle}>
            {challenge.message || 'We need to verify that you are human. Please complete the challenge below.'}
          </div>
          
          {/* Math Challenge */}
          {challenge.type === 'math' && (
            <div style={challengeContainerStyle}>
              <div style={questionStyle}>
                {challenge.question}
              </div>
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your answer"
                style={inputStyle}
                autoFocus
                disabled={isSubmitting}
              />
              <button
                onClick={handleSubmitMath}
                disabled={!answer || isSubmitting}
                style={{
                  ...buttonStyle,
                  ...((!answer || isSubmitting) && buttonDisabledStyle)
                }}
              >
                {isSubmitting ? 'Verifying...' : 'Submit Answer'}
              </button>
            </div>
          )}
          
          {/* Time Challenge */}
          {challenge.type === 'time' && (
            <div style={challengeContainerStyle}>
              <div style={timerStyle}>
                <div style={timerIconStyle}>⏳</div>
                <div style={timerTextStyle}>
                  Please wait {timeRemaining} seconds
                </div>
                <div style={timerBarContainerStyle}>
                  <div 
                    style={{
                      ...timerBarFillStyle,
                      width: `${(timeRemaining / (challenge.waitSeconds || 30)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Interactive Challenge */}
          {challenge.type === 'interactive' && (
            <div style={challengeContainerStyle}>
              <div style={instructionStyle}>
                Click on the blue circle
              </div>
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                onClick={handleCanvasClick}
                style={canvasStyle}
              />
            </div>
          )}
          
          {/* Custom Challenge */}
          {challenge.type === 'custom' && (
            <div style={challengeContainerStyle}>
              <div style={customChallengeStyle}>
                {challenge.content}
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div style={errorStyle}>
              ⚠️ {error}
            </div>
          )}
          
          {/* Attempts Counter */}
          {attempts > 0 && attempts < maxAttempts && (
            <div style={attemptsStyle}>
              Attempts: {attempts} / {maxAttempts}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={footerStyle}>
          <div style={footerTextStyle}>
            This verification helps protect against automated abuse.
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  backdropFilter: 'blur(4px)',
};

const modalStyle = {
  backgroundColor: '#fff',
  borderRadius: 12,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  maxWidth: 500,
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  animation: 'slideIn 0.3s ease-out',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '1px solid #e2e8f0',
};

const titleStyle = {
  fontSize: 20,
  fontWeight: 700,
  color: '#1a202c',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: 32,
  color: '#a0aec0',
  cursor: 'pointer',
  padding: 0,
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  transition: 'all 0.2s',
  ':hover': {
    color: '#718096',
    backgroundColor: '#f7fafc',
  },
};

const contentStyle = {
  padding: '24px',
};

const explanationStyle = {
  fontSize: 15,
  color: '#4a5568',
  marginBottom: 24,
  lineHeight: 1.6,
};

const challengeContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const questionStyle = {
  fontSize: 24,
  fontWeight: 600,
  color: '#2d3748',
  textAlign: 'center',
  padding: '24px 0',
  backgroundColor: '#f7fafc',
  borderRadius: 8,
  fontFamily: 'monospace',
};

const inputStyle = {
  fontSize: 18,
  padding: '12px 16px',
  border: '2px solid #e2e8f0',
  borderRadius: 8,
  outline: 'none',
  transition: 'border-color 0.2s',
  ':focus': {
    borderColor: theme.accentBlue,
  },
};

const buttonStyle = {
  fontSize: 16,
  fontWeight: 600,
  padding: '12px 24px',
  backgroundColor: theme.accentBlue,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
};

const buttonDisabledStyle = {
  opacity: 0.5,
  cursor: 'not-allowed',
  ':hover': {
    backgroundColor: theme.accentBlue,
    transform: 'none',
    boxShadow: 'none',
  },
};

const timerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: '32px 0',
};

const timerIconStyle = {
  fontSize: 48,
};

const timerTextStyle = {
  fontSize: 20,
  fontWeight: 600,
  color: '#2d3748',
};

const timerBarContainerStyle = {
  width: '100%',
  height: 8,
  backgroundColor: '#e2e8f0',
  borderRadius: 4,
  overflow: 'hidden',
};

const timerBarFillStyle = {
  height: '100%',
  backgroundColor: theme.accentBlue,
  transition: 'width 1s linear',
};

const instructionStyle = {
  fontSize: 16,
  color: '#4a5568',
  textAlign: 'center',
  fontWeight: 500,
};

const canvasStyle = {
  border: '2px solid #e2e8f0',
  borderRadius: 8,
  cursor: 'crosshair',
  backgroundColor: '#f7fafc',
};

const customChallengeStyle = {
  padding: '24px',
  backgroundColor: '#f7fafc',
  borderRadius: 8,
  fontSize: 15,
  color: '#2d3748',
  lineHeight: 1.6,
};

const errorStyle = {
  marginTop: 16,
  padding: '12px 16px',
  backgroundColor: '#fff5f5',
  border: '1px solid #fc8181',
  borderRadius: 8,
  color: '#c53030',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const attemptsStyle = {
  marginTop: 12,
  fontSize: 13,
  color: '#718096',
  textAlign: 'center',
};

const footerStyle = {
  padding: '16px 24px',
  borderTop: '1px solid #e2e8f0',
  backgroundColor: '#f7fafc',
};

const footerTextStyle = {
  fontSize: 13,
  color: '#718096',
  textAlign: 'center',
};

