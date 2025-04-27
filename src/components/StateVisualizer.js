import React from 'react';
import { ArousalStates, getStateColor, getStateDisplayName } from '../models/ArousalState';

/**
 * StateVisualizer component provides a visual representation of the current arousal state
 */
const StateVisualizer = ({ currentState, targetState, readings, config }) => {
  // Calculate current arousal percentage
  const arousalPercent = readings?.lastReading?.arousal / (config?.sensitivity_threshold || 1000);
  const formattedPercent = !isNaN(arousalPercent) 
    ? Math.min(100, Math.round(arousalPercent * 100)) 
    : 0;
  
  // Get colors for current and target states
  const currentStateColor = getStateColor(currentState || ArousalStates.BASELINE);
  const targetStateColor = getStateColor(targetState || ArousalStates.BASELINE);
  
  // Define the states in order from lowest to highest arousal
  const states = [
    ArousalStates.BASELINE,
    ArousalStates.AROUSAL,
    ArousalStates.EDGE,
    ArousalStates.ORGASM,
    ArousalStates.POST_ORGASM
  ];
  
  return (
    <div className="state-visualizer">
      <h5>Arousal State</h5>
      
      {/* Current and Target State display */}
      <div className="state-display" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <span className="grey-text">Current: </span>
            <span style={{ color: currentStateColor, fontWeight: 'bold' }}>
              {getStateDisplayName(currentState || ArousalStates.BASELINE)}
            </span>
          </div>
          <div>
            <span className="grey-text">Target: </span>
            <span style={{ color: targetStateColor, fontWeight: 'bold' }}>
              {getStateDisplayName(targetState || ArousalStates.BASELINE)}
            </span>
          </div>
        </div>
        
        {/* Arousal meter */}
        <div style={{ position: 'relative', marginTop: '0.5rem' }}>
          <div 
            style={{ 
              height: '1.5rem', 
              backgroundColor: '#263238', 
              borderRadius: '4px', 
              overflow: 'hidden'
            }}
          >
            <div 
              style={{ 
                width: `${formattedPercent}%`, 
                height: '100%',
                backgroundColor: currentStateColor,
                borderRadius: '4px',
                transition: 'width 0.3s ease-out'
              }}
            />
          </div>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '1px 1px 1px rgba(0,0,0,0.7)'
          }}>
            {formattedPercent}%
          </div>
        </div>
      </div>
      
      {/* State progression visualization */}
      <div className="state-progression" style={{ display: 'flex', marginTop: '1rem' }}>
        {states.map((state, index) => {
          const isCurrentState = state === currentState;
          const isTargetState = state === targetState;
          const stateColor = getStateColor(state);
          
          return (
            <div 
              key={state} 
              style={{ 
                flex: 1,
                textAlign: 'center',
                position: 'relative',
                padding: '0.5rem 0.25rem',
                border: isCurrentState ? `2px solid ${stateColor}` : 
                       isTargetState ? `2px dashed ${stateColor}` : 
                       '2px solid transparent',
                backgroundColor: 'rgba(38, 50, 56, 0.7)',
                marginRight: index < states.length - 1 ? '0.25rem' : 0,
                borderRadius: '4px',
                opacity: isCurrentState || isTargetState ? 1 : 0.7,
                transform: isCurrentState ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s, opacity 0.2s'
              }}
            >
              <div 
                style={{ 
                  height: '0.75rem', 
                  width: '0.75rem', 
                  borderRadius: '50%', 
                  backgroundColor: stateColor,
                  margin: '0 auto 0.5rem'
                }}
              />
              <div style={{ 
                fontSize: '0.7rem', 
                fontWeight: isCurrentState || isTargetState ? 'bold' : 'normal',
                color: isCurrentState || isTargetState ? stateColor : '#e0e0e0'
              }}>
                {getStateDisplayName(state)}
              </div>
              
              {isCurrentState && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-0.75rem', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  color: stateColor,
                  fontSize: '0.75rem'
                }}>
                  ●
                </div>
              )}
              
              {isTargetState && !isCurrentState && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-0.75rem', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  color: stateColor,
                  fontSize: '0.75rem'
                }}>
                  ○
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StateVisualizer;