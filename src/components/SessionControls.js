import React from 'react';
import { Button, Row, Col, Collection, CollectionItem } from 'react-materialize';
import { ArousalStates, getStateDisplayName, getStateColor } from '../models/ArousalState';

/**
 * SessionControls component provides UI controls for starting/stopping sessions
 * and manually setting arousal states
 */
const SessionControls = ({ 
  active = false, 
  onStart, 
  onEnd, 
  onStateChange,
  currentState = ArousalStates.BASELINE
}) => {
  // List of states that can be manually selected
  const availableStates = [
    ArousalStates.BASELINE,
    ArousalStates.AROUSAL,
    ArousalStates.EDGE,
    ArousalStates.ORGASM,
    ArousalStates.POST_ORGASM
  ];
  
  // Handle state selection
  const handleStateSelect = (state) => {
    if (onStateChange) {
      onStateChange(state);
    }
  };
  
  return (
    <div className="session-controls">
      <Row>
        <Col s={12}>
          {/* Session Start/Stop Controls */}
          <div className="session-actions" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
            {!active ? (
              <Button 
                className="green darken-2" 
                large 
                style={{ width: '100%' }}
                onClick={onStart}
              >
                Start Session
              </Button>
            ) : (
              <Button 
                className="red darken-2" 
                large 
                style={{ width: '100%' }}
                onClick={onEnd}
              >
                End Session
              </Button>
            )}
          </div>
        </Col>
      </Row>
      
      {active && (
        <Row>
          <Col s={12}>
            <div className="state-selector">
              <h6>Set Target State</h6>
              <Collection style={{ border: 'none' }}>
                {availableStates.map((state) => (
                  <CollectionItem 
                    key={state}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: state === currentState ? 'rgba(38, 50, 56, 0.2)' : 'transparent',
                      borderLeft: `4px solid ${getStateColor(state)}`,
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleStateSelect(state)}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: getStateColor(state)
                    }}>
                      <span 
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: getStateColor(state),
                          marginRight: '10px'
                        }}
                      />
                      <span style={{ fontWeight: state === currentState ? 'bold' : 'normal' }}>
                        {getStateDisplayName(state)}
                      </span>
                    </div>
                  </CollectionItem>
                ))}
              </Collection>
            </div>
          </Col>
        </Row>
      )}
      
      {active && (
        <Row style={{ marginTop: '1rem' }}>
          <Col s={6}>
            <Button 
              className="blue-grey darken-1" 
              style={{ width: '100%' }}
              onClick={() => handleStateSelect(ArousalStates.EDGE)}
            >
              Hold Edge
            </Button>
          </Col>
          <Col s={6}>
            <Button 
              className="pink darken-1" 
              style={{ width: '100%' }}
              onClick={() => handleStateSelect(ArousalStates.ORGASM)}
            >
              Allow Orgasm
            </Button>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default SessionControls;