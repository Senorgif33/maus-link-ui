/**
 * ArousalState defines the possible arousal states and transition rules
 */

/**
 * Arousal states representing the different phases of arousal
 */
const ArousalStates = {
    // Baseline state (minimal arousal)
    BASELINE: 'baseline',
    
    // Aroused but not close to edge
    AROUSAL: 'arousal',
    
    // At or near the edge of orgasm
    EDGE: 'edge',
    
    // Experiencing orgasm
    ORGASM: 'orgasm',
    
    // After orgasm (sensitive/refractory)
    POST_ORGASM: 'post_orgasm'
  };
  
  /**
   * Valid state transitions define which states can follow others
   */
  const StateTransitions = {
    [ArousalStates.BASELINE]: [
      ArousalStates.AROUSAL
    ],
    
    [ArousalStates.AROUSAL]: [
      ArousalStates.BASELINE,
      ArousalStates.EDGE
    ],
    
    [ArousalStates.EDGE]: [
      ArousalStates.AROUSAL,
      ArousalStates.ORGASM
    ],
    
    [ArousalStates.ORGASM]: [
      ArousalStates.POST_ORGASM
    ],
    
    [ArousalStates.POST_ORGASM]: [
      ArousalStates.BASELINE,
      ArousalStates.AROUSAL
    ]
  };
  
  /**
   * State properties define the characteristics of each state
   */
  const StateProperties = {
    [ArousalStates.BASELINE]: {
      displayName: 'Baseline',
      color: '#3f51b5',  // Indigo
      minDuration: 5000, // ms
      description: 'Minimal arousal level',
      motorSpeedRange: [0, 50],  // Range of motor speeds (0-255)
      arousalRange: [0, 0.2],    // Range of arousal (0-1 as percentage of limit)
      canTransitionToOrgasm: false
    },
    
    [ArousalStates.AROUSAL]: {
      displayName: 'Aroused',
      color: '#ff9800',  // Orange
      minDuration: 3000, // ms
      description: 'Actively aroused but not near orgasm',
      motorSpeedRange: [30, 200], // Range of motor speeds (0-255)
      arousalRange: [0.2, 0.7],   // Range of arousal (0-1 as percentage of limit)
      canTransitionToOrgasm: false
    },
    
    [ArousalStates.EDGE]: {
      displayName: 'Edging',
      color: '#f44336',  // Red
      minDuration: 2000, // ms
      description: 'At or near the edge of orgasm',
      motorSpeedRange: [50, 180], // Range of motor speeds (0-255)
      arousalRange: [0.7, 0.95],  // Range of arousal (0-1 as percentage of limit)
      canTransitionToOrgasm: true
    },
    
    [ArousalStates.ORGASM]: {
      displayName: 'Orgasm',
      color: '#e91e63',  // Pink
      minDuration: 5000, // ms
      description: 'Experiencing orgasm',
      motorSpeedRange: [0, 255],  // Range of motor speeds (0-255)
      arousalRange: [0.95, 1.0],  // Range of arousal (0-1 as percentage of limit)
      canTransitionToOrgasm: false
    },
    
    [ArousalStates.POST_ORGASM]: {
      displayName: 'Post-Orgasm',
      color: '#9c27b0',  // Purple
      minDuration: 10000, // ms
      description: 'Sensitive period after orgasm',
      motorSpeedRange: [0, 150],  // Range of motor speeds (0-255)
      arousalRange: [0.2, 0.6],   // Range of arousal (0-1 as percentage of limit)
      canTransitionToOrgasm: false
    }
  };
  
  /**
   * Helper function to check if a transition between states is valid
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean} Whether the transition is valid
   */
  function isValidTransition(fromState, toState) {
    return StateTransitions[fromState]?.includes(toState) || false;
  }
  
  /**
   * Helper function to get a state property
   * @param {string} state - The state to query
   * @param {string} property - The property to retrieve
   * @param {*} defaultValue - Default value if property not found
   * @returns {*} The property value
   */
  function getStateProperty(state, property, defaultValue = undefined) {
    return StateProperties[state]?.[property] !== undefined ? 
      StateProperties[state][property] : 
      defaultValue;
  }
  
  /**
   * Helper function to get the display name for a state
   * @param {string} state - The state
   * @returns {string} Human-readable display name
   */
  function getStateDisplayName(state) {
    return StateProperties[state]?.displayName || state;
  }
  
  /**
   * Helper function to get the color for a state
   * @param {string} state - The state
   * @returns {string} CSS color value
   */
  function getStateColor(state) {
    return StateProperties[state]?.color || '#000000';
  }
  
  /**
   * Helper function to determine if a state can lead to orgasm
   * @param {string} state - The state to check
   * @returns {boolean} Whether the state can lead to orgasm
   */
  function canStateLeadToOrgasm(state) {
    return StateProperties[state]?.canTransitionToOrgasm || false;
  }
  
  /**
   * Helper function to get the next logical state in a progression
   * @param {string} currentState - The current state
   * @param {boolean} increasing - Whether arousal is increasing
   * @returns {string} The next logical state
   */
  function getNextLogicalState(currentState, increasing = true) {
    // Progression from lowest to highest arousal
    const progression = [
      ArousalStates.BASELINE,
      ArousalStates.AROUSAL,
      ArousalStates.EDGE,
      ArousalStates.ORGASM,
      ArousalStates.POST_ORGASM
    ];
    
    // Special case for post-orgasm
    if (currentState === ArousalStates.POST_ORGASM) {
      return ArousalStates.BASELINE;
    }
    
    const currentIndex = progression.indexOf(currentState);
    
    if (currentIndex === -1) {
      return ArousalStates.BASELINE; // Default to baseline if state not found
    }
    
    if (increasing) {
      // Move to next state if not already at the end
      return currentIndex < progression.length - 1 ? 
        progression[currentIndex + 1] : 
        currentState;
    } else {
      // Move to previous state if not already at the beginning
      return currentIndex > 0 ? 
        progression[currentIndex - 1] : 
        currentState;
    }
  }
  
  export {
    ArousalStates,
    StateTransitions,
    StateProperties,
    isValidTransition,
    getStateProperty,
    getStateDisplayName,
    getStateColor,
    canStateLeadToOrgasm,
    getNextLogicalState
  };