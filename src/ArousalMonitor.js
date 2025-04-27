import { ArousalStates } from './models/ArousalState';

/**
 * ArousalMonitor analyzes device readings to determine arousal state
 * It uses both immediate readings and historical data to identify trends
 */
class ArousalMonitor {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      // Thresholds for state determination (percentage of arousal limit)
      baselineThreshold: 0.2,    // Below this is baseline
      arousalThreshold: 0.6,     // Above baseline, below this is arousal
      edgeThreshold: 0.9,        // Above arousal, below this is approaching edge
      orgasmThreshold: 1.0,      // At or above this is orgasm
      
      // Time requirements (in ms)
      edgeConfirmationTime: 2000, // Time at edge level to confirm edge state
      orgasmConfirmationTime: 500, // Time at orgasm level to confirm orgasm
      cooldownTime: 10000,        // Time after orgasm before allowing new states
      
      // Sensitivity adjustments
      pressureSmoothingFactor: 0.3, // Lower values = more smoothing (0-1)
      ...config
    };
    
    // State tracking
    this.recentReadings = [];
    this.stateHistory = [];
    this.lastOrgasmTime = 0;
    this.edgeStartTime = 0;
    this.orgasmStartTime = 0;
    this.currentState = ArousalStates.BASELINE;
    
    // Maximum readings to store
    this.maxReadings = 100;
  }
  
  /**
   * Add a new arousal reading and update internal state
   * @param {number} arousal - Current arousal value
   * @param {number} pressure - Current pressure reading
   * @param {number} averagePressure - Average pressure reading
   * @param {number} arousalLimit - Current arousal limit (sensitivity threshold)
   * @param {number} timestamp - Time of reading (defaults to now)
   * @returns {string} The current arousal state
   */
  processReading(arousal, pressure, averagePressure, arousalLimit, timestamp = Date.now()) {
    // Add to recent readings
    this.recentReadings.push({
      arousal,
      pressure,
      averagePressure,
      arousalLimit,
      timestamp
    });
    
    // Maintain limited history
    if (this.recentReadings.length > this.maxReadings) {
      this.recentReadings.shift();
    }
    
    // Calculate arousal percentage (0-1)
    const arousalPercentage = arousal / arousalLimit;
    
    // Determine state
    const newState = this.determineState(arousalPercentage, timestamp);
    
    // If state changed, record it
    if (newState !== this.currentState) {
      this.stateHistory.push({
        fromState: this.currentState,
        toState: newState,
        timestamp
      });
      
      // Maintain limited history
      if (this.stateHistory.length > this.maxReadings) {
        this.stateHistory.shift();
      }
      
      this.currentState = newState;
    }
    
    return this.currentState;
  }
  
  /**
   * Determine arousal state based on arousal percentage and timing
   * @param {number} arousalPercentage - Current arousal as percentage of limit (0-1)
   * @param {number} timestamp - Current timestamp
   * @returns {string} Arousal state
   */
  determineState(arousalPercentage, timestamp) {
    // Check if we're in post-orgasm cooldown period
    const timeSinceOrgasm = timestamp - this.lastOrgasmTime;
    if (this.currentState === ArousalStates.POST_ORGASM && timeSinceOrgasm < this.config.cooldownTime) {
      return ArousalStates.POST_ORGASM;
    }
    
    // Determine basic state based on thresholds
    let newState;
    
    if (arousalPercentage >= this.config.orgasmThreshold) {
      // Potential orgasm - check confirmation time
      if (this.orgasmStartTime === 0) {
        this.orgasmStartTime = timestamp;
      }
      
      const timeAtOrgasmLevel = timestamp - this.orgasmStartTime;
      if (timeAtOrgasmLevel >= this.config.orgasmConfirmationTime) {
        newState = ArousalStates.ORGASM;
        this.lastOrgasmTime = timestamp;
      } else {
        // Not confirmed yet, maintain current state
        newState = this.currentState;
      }
    } else {
      // Reset orgasm timer if below threshold
      this.orgasmStartTime = 0;
      
      if (arousalPercentage >= this.config.edgeThreshold) {
        // Potential edge - check confirmation time
        if (this.edgeStartTime === 0) {
          this.edgeStartTime = timestamp;
        }
        
        const timeAtEdgeLevel = timestamp - this.edgeStartTime;
        if (timeAtEdgeLevel >= this.config.edgeConfirmationTime) {
          newState = ArousalStates.EDGE;
        } else {
          // Not confirmed yet, maintain current state or indicate approaching
          newState = this.currentState === ArousalStates.AROUSAL ? 
                    ArousalStates.AROUSAL : 
                    ArousalStates.EDGE;
        }
      } else {
        // Reset edge timer if below threshold
        this.edgeStartTime = 0;
        
        if (arousalPercentage >= this.config.arousalThreshold) {
          newState = ArousalStates.AROUSAL;
        } else if (arousalPercentage >= this.config.baselineThreshold) {
          newState = ArousalStates.AROUSAL;
        } else {
          newState = ArousalStates.BASELINE;
        }
      }
    }
    
    // Special case: transition from orgasm to post-orgasm
    if (this.currentState === ArousalStates.ORGASM && newState !== ArousalStates.ORGASM) {
      return ArousalStates.POST_ORGASM;
    }
    
    return newState;
  }
  
  /**
   * Gets the recent trend of arousal (increasing, decreasing, stable)
   * @returns {string} 'increasing', 'decreasing', or 'stable'
   */
  getArousalTrend() {
    if (this.recentReadings.length < 5) return 'stable';
    
    // Get last 5 readings
    const recentValues = this.recentReadings.slice(-5).map(r => r.arousal / r.arousalLimit);
    
    // Calculate average difference between consecutive readings
    let sumDiff = 0;
    for (let i = 1; i < recentValues.length; i++) {
      sumDiff += recentValues[i] - recentValues[i-1];
    }
    
    const avgDiff = sumDiff / (recentValues.length - 1);
    
    // Determine trend based on average difference
    if (avgDiff > 0.02) return 'increasing';
    if (avgDiff < -0.02) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Gets the time spent in the current state
   * @returns {number} Time in milliseconds
   */
  getTimeInCurrentState() {
    const lastTransition = this.stateHistory.length > 0 ? 
      this.stateHistory[this.stateHistory.length - 1] : 
      { timestamp: Date.now() };
      
    return Date.now() - lastTransition.timestamp;
  }
  
  /**
   * Gets the time spent in a specific state during the session
   * @param {string} state - The state to check
   * @returns {number} Total time in milliseconds
   */
  getTotalTimeInState(state) {
    let totalTime = 0;
    let currentStateStart = null;
    
    // Add up time periods in this state
    for (let i = 0; i < this.stateHistory.length; i++) {
      const transition = this.stateHistory[i];
      
      // If we're entering the target state
      if (transition.toState === state) {
        currentStateStart = transition.timestamp;
      }
      
      // If we're leaving the target state
      if (transition.fromState === state && currentStateStart !== null) {
        totalTime += transition.timestamp - currentStateStart;
        currentStateStart = null;
      }
    }
    
    // If we're currently in the target state, add the current time
    if (this.currentState === state && currentStateStart !== null) {
      totalTime += Date.now() - currentStateStart;
    }
    
    return totalTime;
  }
  
  /**
   * Resets the monitor for a new session
   */
  reset() {
    this.recentReadings = [];
    this.stateHistory = [];
    this.edgeStartTime = 0;
    this.orgasmStartTime = 0;
    this.currentState = ArousalStates.BASELINE;
    // Note: We don't reset lastOrgasmTime to maintain post-orgasm cooldown
  }
}

export default ArousalMonitor;