import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeviceContext, ReadingsContext, DeviceMode } from './DeviceProvider';
import { ArousalStateManager } from './StateManager';
import { ArousalStates } from './models/ArousalState';
import { SessionModes } from './models/SessionConfig';

// Create a context for session-related data
export const SessionContext = createContext({
  active: false,
  startSession: () => {},
  endSession: () => {},
  mode: SessionModes.EDGING_WITH_ORGASM,
  setMode: () => {},
  targetState: ArousalStates.BASELINE,
  setTargetState: () => {},
  currentState: ArousalStates.BASELINE,
  duration: 30, // minutes
  setDuration: () => {},
  timeRemaining: 0,
  orgasmsPermitted: 1,
  orgasmsAchieved: 0,
  edgesAchieved: 0,
  stateTransitions: [],
  llmResponse: null,
  sendUserMessage: () => {},
});

const SessionController = ({ children }) => {
  const deviceContext = useContext(DeviceContext);
  const readingsContext = useContext(ReadingsContext);
  
  // Session active state
  const [active, setActive] = useState(false);
  
  // Session configuration
  const [mode, setMode] = useState(SessionModes.EDGING_WITH_ORGASM);
  const [duration, setDuration] = useState(30); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [orgasmsPermitted, setOrgasmsPermitted] = useState(1);
  
  // Session metrics
  const [orgasmsAchieved, setOrgasmsAchieved] = useState(0);
  const [edgesAchieved, setEdgesAchieved] = useState(0);
  const [stateTransitions, setStateTransitions] = useState([]);
  
  // State management
  const [currentState, setCurrentState] = useState(ArousalStates.BASELINE);
  const [targetState, setTargetState] = useState(ArousalStates.BASELINE);
  
  // LLM integration
  const [llmResponse, setLlmResponse] = useState(null);
  
  // Initialize the state manager
  const stateManager = new ArousalStateManager();
  
  // Update current state based on device readings
  useEffect(() => {
    if (!active) return;
    
    const { lastReading } = readingsContext;
    if (!lastReading) return;
    
    const newState = stateManager.determineState(
      lastReading.arousal, 
      lastReading.pavg,
      deviceContext.config.sensitivity_threshold
    );
    
    if (newState !== currentState) {
      setCurrentState(newState);
      setStateTransitions(prev => [...prev, {
        timestamp: Date.now(),
        from: currentState,
        to: newState
      }]);
      
      // If we've reached the edge state, count it
      if (newState === ArousalStates.EDGE) {
        setEdgesAchieved(prev => prev + 1);
      }
      
      // If we've reached orgasm, count it
      if (newState === ArousalStates.ORGASM) {
        setOrgasmsAchieved(prev => prev + 1);
      }
      
      // Notify LLM of state change (in a real implementation)
      notifyLLM(newState);
    }
    
    // Adjust device controls to maintain target state
    adjustDeviceControls(newState, targetState);
    
  }, [readingsContext.lastReading, active]);
  
  // Timer for session duration
  useEffect(() => {
    if (!active) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [active]);
  
  const startSession = () => {
    if (active) return;
    
    // Reset session metrics
    setOrgasmsAchieved(0);
    setEdgesAchieved(0);
    setStateTransitions([]);
    
    // Set initial state
    setCurrentState(ArousalStates.BASELINE);
    setTargetState(ArousalStates.BASELINE);
    
    // Set timer
    setTimeRemaining(duration * 60); // convert to seconds
    
    // Activate session
    setActive(true);
    
    // Set device to automatic mode
    deviceContext.send({
      setMode: DeviceMode.AUTOMATIC
    });
    
    // Notify LLM of session start (in a real implementation)
    notifyLLMSessionStart();
  };
  
  const endSession = () => {
    if (!active) return;
    
    // Stop stimulation
    deviceContext.send({
      setMotor: 0
    });
    
    // Set device to manual mode
    deviceContext.send({
      setMode: DeviceMode.MANUAL
    });
    
    // Deactivate session
    setActive(false);
    
    // Notify LLM of session end (in a real implementation)
    notifyLLMSessionEnd();
  };
  
  const adjustDeviceControls = (currentState, targetState) => {
    if (!active) return;
    
    // In a real implementation, this would adjust motor speed or other controls
    // based on the current state and target state
    
    // Example: If we need to increase arousal
    if (currentState === ArousalStates.BASELINE && targetState === ArousalStates.AROUSAL) {
      // Increase motor speed
      // For now, this is a placeholder
    }
    
    // Example: If we need to back off from the edge
    if (currentState === ArousalStates.EDGE && targetState === ArousalStates.AROUSAL) {
      // Decrease motor speed
      // For now, this is a placeholder
    }
  };
  
  const notifyLLM = (newState) => {
    // In a real implementation, this would send a message to the LLM
    console.log(`State changed to: ${newState}`);
  };
  
  const notifyLLMSessionStart = () => {
    // In a real implementation, this would notify the LLM that a session has started
    console.log('Session started');
  };
  
  const notifyLLMSessionEnd = () => {
    // In a real implementation, this would notify the LLM that a session has ended
    console.log('Session ended');
  };
  
  const sendUserMessage = (message) => {
    // In a real implementation, this would send a user message to the LLM
    console.log(`User message: ${message}`);
    
    // Mock LLM response
    setLlmResponse(`This is a mock response to: ${message}`);
  };
  
  return (
    <SessionContext.Provider value={{
      active,
      startSession,
      endSession,
      mode,
      setMode,
      targetState,
      setTargetState,
      currentState,
      duration,
      setDuration,
      timeRemaining,
      orgasmsPermitted,
      orgasmsAchieved,
      edgesAchieved,
      stateTransitions,
      llmResponse,
      sendUserMessage,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionController;