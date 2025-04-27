import { ArousalStates } from './models/ArousalState';

/**
 * StateManager handles arousal state transitions with hysteresis logic
 * to prevent rapid state changes and provide a more stable experience.
 */
class ArousalStateManager {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      // Thresholds for state transitions as percentage of arousal limit
      baselineToArousalThreshold: 0.3,
      arousalToBaselineThreshold: 0.2,
      arousalToEdgeThreshold: 0.85,
      edgeToArousalThreshold: 0.75,
      edgeToOrgasmThreshold: 0.98,
      orgasmToPostOrgasmThreshold: 0.7,
      postOrgasmToBaselineThreshold: 0.2,
      
      // Time thresholds (in milliseconds)
      minimumTimeInState: 2000,      // Minimum time to stay in a state
      edgeConfirmationTime: 3000,    // Time at edge level to confirm edge state
      orgasmConfirmationTime: 1000,  // Time to confirm orgasm
      postOrgasmDuration: 15000,     // Minimum time in post-orgasm state
      
      // Pressure-related settings
      pressureSpikeFactor: 1.5,      // Factor for detecting pressure spikes
      pressureSmoothingWindow: 10,   // Number of readings for pressure smoothing
      
      ...config
    };
    
    // State tracking
    this.currentState = ArousalStates.BASELINE;
    this.previousState = ArousalStates.BASELINE;
    this.lastStateChangeTime = Date.now();
    this.stateStartTimes = {
      [ArousalStates.BASELINE]: Date.now(),
      [ArousalStates.AROUSAL]: 0,
      [ArousalStates.EDGE]: 0,
      [ArousalStates.ORGASM]: 0,
      [ArousalStates.POST_ORGASM]: 0,
    };
    
    // Edge detection
    this.edgeStartTime = 0;
    this.orgasmStartTime = 0;
    
    // Pressure history for spike detection
    this.pressureHistory = [];
  }
  
  /**
   * Determines the current arousal state based on readings and history
   * @param {number} arousal - Current arousal value
   * @param {number} pressure - Current pressure reading
   * @param {number} arousalLimit - Current sensitivity threshold
   * @returns {string} The current arousal state
   */
  determineState(arousal, pressure, arousalLimit) {
    const timestamp = Date.now();
    const arousalPercent = arousal / arousalLimit;
    
    // Add pressure to history
    this.pressureHistory.push({
      pressure,
      timestamp
    });
    
    // Keep only the most recent readings
    if (this.pressureHistory.length > this.config.pressureSmoothingWindow) {
      this.pressureHistory.shift();
    }
    
    // Check if we've been in the current state long enough to allow transitions
    const timeInCurrentState = timestamp - this.lastStateChangeTime;
    if (timeInCurrentState < this.config.minimumTimeInState) {
      return this.currentState;
    }
    
    // Apply state transition logic with hysteresis
    let newState = this.currentState;
    
    switch (this.currentState) {
      case ArousalStates.BASELINE:
        if (arousalPercent >= this.config.baselineToArousalThreshold) {
          newState = ArousalStates.AROUSAL;
        }
        break;
        
      case ArousalStates.AROUSAL:
        if (arousalPercent <= this.config.arousalToBaselineThreshold) {
          newState = ArousalStates.BASELINE;
        } else if (arousalPercent >= this.config.arousalToEdgeThreshold) {
          // Start tracking edge time
          if (this.edgeStartTime === 0) {
            this.edgeStartTime = timestamp;
          }
          
          // Confirm edge after sufficient time
          if (timestamp - this.edgeStartTime >= this.config.edgeConfirmationTime) {
            newState = ArousalStates.EDGE;
          }
        } else {
          // Reset edge timer if below threshold
          this.edgeStartTime = 0;
        }
        break;
        
      case ArousalStates.EDGE:
        if (arousalPercent <= this.config.edgeToArousalThreshold) {
          newState = ArousalStates.AROUSAL;
        } else if (arousalPercent >= this.config.edgeToOrgasmThreshold) {
          // Start tracking orgasm time
          if (this.orgasmStartTime === 0) {
            this.orgasmStartTime = timestamp;
          }
          
          // Confirm orgasm after sufficient time
          if (timestamp - this.orgasmStartTime >= this.config.orgasmConfirmationTime) {
            newState = ArousalStates.ORGASM;
          }
        } else {
          // Reset orgasm timer if below threshold
          this.orgasmStartTime = 0;
        }
        break;
        
      case ArousalStates.ORGASM:
        // Always transition to post-orgasm after orgasm is detected
        if (arousalPercent <= this.config.orgasmToPostOrgasmThreshold) {
          newState = ArousalStates.POST_ORGASM;
        }
        break;
        
      case ArousalStates.POST_ORGASM:
        // Only transition out after minimum time has passed
        const timeInPostOrgasm = timestamp - this.stateStartTimes[ArousalStates.POST_ORGASM];
        if (timeInPostOrgasm >= this.config.postOrgasmDuration) {
          if (arousalPercent <= this.config.postOrgasmToBaselineThreshold) {
            newState = ArousalStates.BASELINE;
          }
        }
        break;
    }
    
    // If state has changed, update tracking
    if (newState !== this.currentState) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.lastStateChangeTime = timestamp;
      this.stateStartTimes[newState] = timestamp;
      
      // Reset timers on state change
      if (newState !== ArousalStates.EDGE) {
        this.edgeStartTime = 0;
      }
      if (newState !== ArousalStates.ORGASM) {
        this.orgasmStartTime = 0;
      }
    }
    
    return this.currentState;
  }
  
  /**
   * Checks if a pressure spike occurred that might indicate orgasm
   * @returns {boolean} True if a spike was detected
   */
  detectPressureSpike() {
    if (this.pressureHistory.length < 5) return false;
    
    // Calculate average of previous readings
    const previousReadings = this.pressureHistory.slice(0, -1);
    const avgPressure = previousReadings.reduce((sum, item) => sum + item.pressure, 0) / previousReadings.length;
    
    // Get most recent reading
    const latestPressure = this.pressureHistory[this.pressureHistory.length - 1].pressure;
    
    // Check if latest reading is significantly higher than average
    return latestPressure > avgPressure * this.config.pressureSpikeFactor;
  }
  
  /**
   * Gets the time spent in the current state
   * @returns {number} Time in milliseconds
   */
  getTimeInCurrentState() {
    return Date.now() - this.stateStartTimes[this.currentState];
  }
  
  /**
   * Gets the time spent in a specific state during the session
   * @param {string} state - The state to check
   * @returns {number} Time in milliseconds
   */
  getTimeInState(state) {
    if (this.currentState === state) {
      return Date.now() - this.stateStartTimes[state];
    }
    return 0; // For simplicity - in a real implementation we would track full history
  }
  
  /**
   * Checks if it's safe to transition to a target state
   * @param {string} targetState - The desired state
   * @returns {boolean} True if transition is possible
   */
  canTransitionTo(targetState) {
    // Can't skip states (except when explicitly allowed)
    const validTransitions = {
      [ArousalStates.BASELINE]: [ArousalStates.AROUSAL],
      [ArousalStates.AROUSAL]: [ArousalStates.BASELINE, ArousalStates.EDGE],
      [ArousalStates.EDGE]: [ArousalStates.AROUSAL, ArousalStates.ORGASM],
      [ArousalStates.ORGASM]: [ArousalStates.POST_ORGASM],
      [ArousalStates.POST_ORGASM]: [ArousalStates.BASELINE]
    };
    
    // Check if the target state is a valid transition
    return validTransitions[this.currentState]?.includes(targetState) || false;
  }
  
  /**
   * Resets the state manager for a new session
   */
  reset() {
    this.currentState = ArousalStates.BASELINE;
    this.previousState = ArousalStates.BASELINE;
    this.lastStateChangeTime = Date.now();
    this.stateStartTimes = {
      [ArousalStates.BASELINE]: Date.now(),
      [ArousalStates.AROUSAL]: 0,
      [ArousalStates.EDGE]: 0,
      [ArousalStates.ORGASM]: 0,
      [ArousalStates.POST_ORGASM]: 0,
    };
    this.edgeStartTime = 0;
    this.orgasmStartTime = 0;
    this.pressureHistory = [];
  }
}

export { ArousalStateManager };