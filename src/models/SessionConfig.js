/**
 * SessionConfig defines the structure of session parameters and modes
 */

/**
 * Session modes define the permitted outcomes of an edging session
 */
const SessionModes = {
    // Full session with orgasm permitted at the end
    EDGING_WITH_ORGASM: 'edging_with_orgasm',
    
    // Edging with ruined orgasm only
    EDGING_WITH_RUINED: 'edging_with_ruined',
    
    // Edging only, no orgasm permitted
    EDGING_ONLY: 'edging_only',
    
    // Let the LLM/Mistress decide dynamically
    MISTRESS_CHOICE: 'mistress_choice'
  };
  
  /**
   * Default configuration parameters for different session modes
   */
  const SessionDefaults = {
    [SessionModes.EDGING_WITH_ORGASM]: {
      initialDuration: 30, // minutes
      minEdges: 5,
      maxEdgeHoldTime: 60, // seconds
      orgasmsPermitted: 1,
      postOrgasmTorture: false,
      postOrgasmDuration: 0 // seconds
    },
    
    [SessionModes.EDGING_WITH_RUINED]: {
      initialDuration: 45, // minutes
      minEdges: 8,
      maxEdgeHoldTime: 90, // seconds
      orgasmsPermitted: 1,
      postOrgasmTorture: true,
      postOrgasmDuration: 15 // seconds
    },
    
    [SessionModes.EDGING_ONLY]: {
      initialDuration: 60, // minutes
      minEdges: 10,
      maxEdgeHoldTime: 120, // seconds
      orgasmsPermitted: 0,
      postOrgasmTorture: false,
      postOrgasmDuration: 0 // seconds
    },
    
    [SessionModes.MISTRESS_CHOICE]: {
      initialDuration: 45, // minutes
      minEdges: 5,
      maxEdgeHoldTime: 60, // seconds
      orgasmsPermitted: undefined, // LLM will decide
      postOrgasmTorture: undefined, // LLM will decide
      postOrgasmDuration: undefined // LLM will decide
    }
  };
  
  /**
   * Session difficulty levels
   */
  const DifficultyLevels = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    EXTREME: 'extreme',
    CUSTOM: 'custom'
  };
  
  /**
   * Difficulty level modifiers
   */
  const DifficultyModifiers = {
    [DifficultyLevels.EASY]: {
      durationMultiplier: 0.7,
      edgeCountMultiplier: 0.7,
      edgeHoldTimeMultiplier: 0.7,
      postOrgasmDurationMultiplier: 0.5
    },
    
    [DifficultyLevels.MEDIUM]: {
      durationMultiplier: 1.0,
      edgeCountMultiplier: 1.0,
      edgeHoldTimeMultiplier: 1.0,
      postOrgasmDurationMultiplier: 1.0
    },
    
    [DifficultyLevels.HARD]: {
      durationMultiplier: 1.3,
      edgeCountMultiplier: 1.5,
      edgeHoldTimeMultiplier: 1.5,
      postOrgasmDurationMultiplier: 2.0
    },
    
    [DifficultyLevels.EXTREME]: {
      durationMultiplier: 2.0,
      edgeCountMultiplier: 2.0,
      edgeHoldTimeMultiplier: 2.0,
      postOrgasmDurationMultiplier: 3.0
    }
  };
  
  /**
   * Session class for creating and managing session configurations
   */
  class SessionConfig {
    constructor(options = {}) {
      // Default options
      this.options = {
        mode: SessionModes.EDGING_WITH_ORGASM,
        difficulty: DifficultyLevels.MEDIUM,
        duration: undefined, // Will be set based on mode and difficulty
        minEdges: undefined, // Will be set based on mode and difficulty
        maxEdgeHoldTime: undefined, // Will be set based on mode and difficulty
        orgasmsPermitted: undefined, // Will be set based on mode
        postOrgasmTorture: undefined, // Will be set based on mode
        postOrgasmDuration: undefined, // Will be set based on mode and difficulty
        
        // Device control settings
        deviceMode: 'eom', // 'eom' or 'buttplug'
        minMotorSpeed: 30,
        maxMotorSpeed: 200,
        motorRampTime: 30,
        arousalLimit: 600,
        
        // Advanced settings
        adaptiveDifficulty: false,
        randomizeIntensity: false,
        
        // LLM integration settings
        llmEnabled: true,
        llmEndpoint: '',
        llmModel: '',
        characterName: 'Mistress',
        characterPersonality: '',
        scenarioDescription: '',
        
        // User info
        userName: 'User',
        
        // Custom overrides
        ...options
      };
      
      // Apply mode defaults
      this.applyModeDefaults();
      
      // Apply difficulty modifiers
      this.applyDifficultyModifiers();
    }
    
    /**
     * Apply default settings based on selected mode
     */
    applyModeDefaults() {
      const modeDefaults = SessionDefaults[this.options.mode];
      
      // Apply defaults if not explicitly set
      for (const [key, value] of Object.entries(modeDefaults)) {
        if (this.options[key] === undefined) {
          this.options[key] = value;
        }
      }
    }
    
    /**
     * Apply difficulty modifiers to session parameters
     */
    applyDifficultyModifiers() {
      // Skip for custom difficulty
      if (this.options.difficulty === DifficultyLevels.CUSTOM) {
        return;
      }
      
      const modifiers = DifficultyModifiers[this.options.difficulty];
      
      // Apply modifiers
      this.options.duration = Math.round(this.options.initialDuration * modifiers.durationMultiplier);
      this.options.minEdges = Math.round(this.options.minEdges * modifiers.edgeCountMultiplier);
      this.options.maxEdgeHoldTime = Math.round(this.options.maxEdgeHoldTime * modifiers.edgeHoldTimeMultiplier);
      
      if (this.options.postOrgasmDuration > 0) {
        this.options.postOrgasmDuration = Math.round(
          this.options.postOrgasmDuration * modifiers.postOrgasmDurationMultiplier
        );
      }
    }
    
    /**
     * Get a specific configuration value
     * @param {string} key - Configuration key to retrieve
     * @param {*} defaultValue - Default value if key not found
     * @returns {*} Configuration value
     */
    get(key, defaultValue = undefined) {
      return this.options[key] !== undefined ? this.options[key] : defaultValue;
    }
    
    /**
     * Set a specific configuration value
     * @param {string} key - Configuration key to set
     * @param {*} value - Value to set
     */
    set(key, value) {
      this.options[key] = value;
      
      // Re-apply defaults and modifiers for certain key changes
      if (['mode', 'difficulty'].includes(key)) {
        this.applyModeDefaults();
        this.applyDifficultyModifiers();
      }
    }
    
    /**
     * Update multiple configuration values
     * @param {Object} updates - Object with key/value pairs to update
     */
    update(updates) {
      const modeOrDifficultyChanged = 
        (updates.mode && updates.mode !== this.options.mode) || 
        (updates.difficulty && updates.difficulty !== this.options.difficulty);
      
      // Apply updates
      Object.assign(this.options, updates);
      
      // Re-apply defaults and modifiers if mode or difficulty changed
      if (modeOrDifficultyChanged) {
        this.applyModeDefaults();
        this.applyDifficultyModifiers();
      }
    }
    
    /**
     * Get full configuration object
     * @returns {Object} Complete configuration
     */
    getConfig() {
      return { ...this.options };
    }
    
    /**
     * Create a session description for LLM prompting
     * @returns {string} Session description
     */
    createSessionDescription() {
      const config = this.options;
      
      let description = `Session Mode: ${config.mode.replace(/_/g, ' ')}\n`;
      description += `Duration: ${config.duration} minutes\n`;
      description += `Minimum Edges Required: ${config.minEdges}\n`;
      
      if (config.mode !== SessionModes.EDGING_ONLY) {
        description += `Orgasms Permitted: ${config.orgasmsPermitted}\n`;
        
        if (config.postOrgasmTorture) {
          description += `Post-Orgasm Torture: Enabled (${config.postOrgasmDuration} seconds)\n`;
        }
      }
      
      return description;
    }
  }
  
  export { 
    SessionModes, 
    SessionDefaults, 
    DifficultyLevels, 
    DifficultyModifiers,
    SessionConfig
  };