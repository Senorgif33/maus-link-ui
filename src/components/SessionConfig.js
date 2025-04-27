import React from 'react';
import { Row, Col, Select, TextInput, Switch } from 'react-materialize';
import { SessionModes, DifficultyLevels } from '../models/SessionConfig';

/**
 * SessionConfig component provides UI for configuring session parameters
 */
const SessionConfig = ({ settings, onChange }) => {
  // Handle select change
  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    onChange(id, value);
  };
  
  // Handle number input change
  const handleNumberChange = (e) => {
    const { id, value } = e.target;
    onChange(id, parseInt(value, 10) || 0);
  };
  
  // Handle switch change
  const handleSwitchChange = (e) => {
    const { id, checked } = e.target;
    onChange(id, checked);
  };
  
  return (
    <div className="session-config">
      <h5>Session Configuration</h5>
      
      <Row>
        <Col s={12}>
          <Select
            id="mode"
            label="Session Mode"
            value={settings.mode}
            onChange={handleSelectChange}
          >
            <option value={SessionModes.EDGING_WITH_ORGASM}>
              Edging with Orgasm Allowed
            </option>
            <option value={SessionModes.EDGING_WITH_RUINED}>
              Edging with Ruined Orgasm
            </option>
            <option value={SessionModes.EDGING_ONLY}>
              Edging Only (No Orgasm)
            </option>
            <option value={SessionModes.MISTRESS_CHOICE}>
              Let AI Mistress Decide
            </option>
          </Select>
        </Col>
      </Row>
      
      <Row>
        <Col s={12}>
          <Select
            id="difficulty"
            label="Difficulty Level"
            value={settings.difficulty}
            onChange={handleSelectChange}
          >
            <option value={DifficultyLevels.EASY}>Easy</option>
            <option value={DifficultyLevels.MEDIUM}>Medium</option>
            <option value={DifficultyLevels.HARD}>Hard</option>
            <option value={DifficultyLevels.EXTREME}>Extreme</option>
          </Select>
        </Col>
      </Row>
      
      <Row>
        <Col s={12}>
          <TextInput
            id="duration"
            label="Session Duration (minutes)"
            type="number"
            min="5"
            max="120"
            value={settings.duration}
            onChange={handleNumberChange}
          />
        </Col>
      </Row>
      
      <Row>
        <Col s={6}>
          <div className="switch-label">AI Integration</div>
        </Col>
        <Col s={6}>
          <div className="switch-container" style={{ textAlign: 'right' }}>
            <Switch
              id="enableLLM"
              offLabel="Off"
              onLabel="On"
              checked={settings.enableLLM}
              onChange={handleSwitchChange}
            />
          </div>
        </Col>
      </Row>
      
      {settings.enableLLM && (
        <Row>
          <Col s={12}>
            <div className="info-box" style={{ 
              backgroundColor: 'rgba(48, 140, 179, 0.1)', 
              padding: '8px 12px', 
              borderRadius: '4px',
              marginTop: '10px',
              marginBottom: '10px',
              fontSize: '0.9rem'
            }}>
              <p style={{ margin: '0' }}>
                AI Mistress will guide your session. You can adjust AI settings in the Chat tab.
              </p>
            </div>
          </Col>
        </Row>
      )}
      
      <Row>
        <Col s={12}>
          <div className="divider" style={{ margin: '1rem 0' }}></div>
          <h6>Device Settings</h6>
        </Col>
      </Row>
      
      <Row>
        <Col s={12}>
          <Select
            id="deviceMode"
            label="Device Control Mode"
            value={settings.deviceMode || 'eom'}
            onChange={handleSelectChange}
          >
            <option value="eom">Edge-o-Matic (EOM) Mode</option>
            <option value="buttplug">Buttplug.io Mode</option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default SessionConfig;