import React, { useContext, useState } from 'react';
import { Container, Row, Col, Card, Button, Select, TextInput, Switch } from 'react-materialize';
import { SessionContext } from '../SessionController';
import { DeviceContext, ReadingsContext } from '../DeviceProvider';
import StateVisualizer from '../components/StateVisualizer';
import SessionControls from '../components/SessionControls';
import SessionConfig from '../components/SessionConfig';
import { 
  ArousalStates, 
  getStateDisplayName, 
  getStateColor 
} from '../models/ArousalState';
import { 
  SessionModes, 
  DifficultyLevels 
} from '../models/SessionConfig';
import Graph from '../Graph';

const Session = () => {
  const sessionContext = useContext(SessionContext);
  const deviceContext = useContext(DeviceContext);
  const readingsContext = useContext(ReadingsContext);
  
  const [sessionSettings, setSessionSettings] = useState({
    mode: SessionModes.EDGING_WITH_ORGASM,
    difficulty: DifficultyLevels.MEDIUM,
    duration: 30, // minutes
    enableLLM: true
  });
  
  const handleSettingChange = (setting, value) => {
    setSessionSettings({
      ...sessionSettings,
      [setting]: value
    });
  };
  
  const handleStartSession = () => {
    // Set session parameters before starting
    sessionContext.setMode(sessionSettings.mode);
    sessionContext.setDuration(sessionSettings.duration);
    
    // Start the session
    sessionContext.startSession();
  };
  
  return (
    <Container style={{ marginTop: '3rem' }}>
      <Row>
        <Col s={12}>
          <Card title="Session Control">
            <Row>
              <Col s={12} m={6}>
                {!sessionContext.active ? (
                  <SessionConfig
                    settings={sessionSettings}
                    onChange={handleSettingChange}
                  />
                ) : (
                  <div>
                    <h5>Session in Progress</h5>
                    <p>
                      <strong>Mode:</strong> {getStateDisplayName(sessionContext.mode)}<br />
                      <strong>Time Remaining:</strong> {Math.floor(sessionContext.timeRemaining / 60)}:{(sessionContext.timeRemaining % 60).toString().padStart(2, '0')}<br />
                      <strong>Current State:</strong> <span style={{color: getStateColor(sessionContext.currentState)}}>{getStateDisplayName(sessionContext.currentState)}</span><br />
                      <strong>Target State:</strong> <span style={{color: getStateColor(sessionContext.targetState)}}>{getStateDisplayName(sessionContext.targetState)}</span><br />
                      <strong>Edges Achieved:</strong> {sessionContext.edgesAchieved}<br />
                      <strong>Orgasms:</strong> {sessionContext.orgasmsAchieved} / {sessionContext.orgasmsPermitted}
                    </p>
                  </div>
                )}
              </Col>
              <Col s={12} m={6}>
                <StateVisualizer
                  currentState={sessionContext.currentState}
                  targetState={sessionContext.targetState}
                  readings={readingsContext}
                  config={deviceContext.config}
                />
              </Col>
            </Row>
            
            <SessionControls
              active={sessionContext.active}
              onStart={handleStartSession}
              onEnd={sessionContext.endSession}
              onStateChange={sessionContext.setTargetState}
              currentState={sessionContext.currentState}
            />
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col s={12}>
          <Card title="Arousal Monitor">
            <Graph />
          </Card>
        </Col>
      </Row>
      
      {sessionContext.active && sessionContext.llmResponse && (
        <Row>
          <Col s={12}>
            <Card title="AI Mistress">
              <div className="message-container">
                <div className="message ai-message">
                  {sessionContext.llmResponse}
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const message = e.target.message.value;
                sessionContext.sendUserMessage(message);
                e.target.message.value = '';
              }}>
                <Row>
                  <Col s={9}>
                    <TextInput
                      id="message"
                      name="message"
                      placeholder="Type your message..."
                      disabled={!sessionContext.active}
                    />
                  </Col>
                  <Col s={3}>
                    <Button type="submit" disabled={!sessionContext.active}>
                      Send
                    </Button>
                  </Col>
                </Row>
              </form>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Session;