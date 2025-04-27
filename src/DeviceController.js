import { ArousalStates } from './models/ArousalState';
import { DeviceMode } from './DeviceProvider';

/**
 * DeviceController handles the control of devices based on desired state
 * Supports both EOM and Buttplug.io devices
 */
class DeviceController {
  constructor(config = {}) {
    // Configuration with defaults
    this.config = {
      // Control modes
      mode: 'eom', // 'eom' or 'buttplug'
      
      // EOM settings
      minMotorSpeed: 30,     // Minimum motor speed (0-255)
      maxMotorSpeed: 200,    // Maximum motor speed (0-255)
      motorRampTime: 30,     // Time to ramp up in seconds
      motorRampSteps: 50,    // Number of steps for ramp
      
      // Control settings
      baselineSpeed: 0,      // Speed at baseline (0-255, or 0-1 for buttplug)
      arousalMinSpeed: 50,   // Min speed in arousal state
      arousalMaxSpeed: 150,  // Max speed in arousal state
      edgeMinSpeed: 70,      // Min speed in edge state
      edgeMaxSpeed: 130,     // Max speed in edge state
      orgasmSpeed: 255,      // Speed during orgasm
      postOrgasmSpeed: 150,  // Speed during post-orgasm
      
      // Control algorithm settings
      updateInterval: 200,   // Control update interval in ms
      
      // Hysteresis settings
      rampUpThreshold: 0.05, // Amount below target to ramp up speed
      rampDownThreshold: 0.05,// Amount above target to ramp down speed
      
      // Dynamic response
      adaptiveMode: false,   // Whether to use adaptive response
      adaptiveScale: 0.8,    // Scaling factor for adaptive response
      
      ...config
    };
    
    // State tracking
    this.active = false;
    this.currentMotorSpeed = 0;
    this.targetMotorSpeed = 0;
    this.targetState = ArousalStates.BASELINE;
    this.controlTimer = null;
    this.rampInterval = null;
    
    // Device references
    this.deviceContext = null;
    this.buttplugDevice = null;
    
    // State transition timestamps
    this.lastStateTransition = Date.now();
    
    // Ramp state
    this.rampInProgress = false;
    this.rampStartTime = 0;
    this.rampStartSpeed = 0;
    this.rampEndSpeed = 0;
  }
  
  /**
   * Set the device context for communication
   * @param {Object} deviceContext - The device context from DeviceProvider
   */
  setDeviceContext(deviceContext) {
    this.deviceContext = deviceContext;
  }
  
  /**
   * Set buttplug device for communication
   * @param {Object} device - The buttplug device
   */
  setButtplugDevice(device) {
    this.buttplugDevice = device;
  }
  
  /**
   * Start controller operation
   */
  start() {
    if (this.active) return;
    
    this.active = true;
    
    // Set device to automatic mode if using EOM
    if (this.config.mode === 'eom' && this.deviceContext) {
      this.deviceContext.send({
        setMode: DeviceMode.AUTOMATIC
      });
    }
    
    // Start control loop
    this.controlTimer = setInterval(() => {
      this.updateControl();
    }, this.config.updateInterval);
  }
  
  /**
   * Stop controller operation
   */
  stop() {
    if (!this.active) return;
    
    this.active = false;
    
    // Clear timers
    if (this.controlTimer) {
      clearInterval(this.controlTimer);
      this.controlTimer = null;
    }
    
    if (this.rampInterval) {
      clearInterval(this.rampInterval);
      this.rampInterval = null;
    }
    
    // Stop stimulation
    this.setMotorSpeed(0);
    
    // Reset to manual mode if using EOM
    if (this.config.mode === 'eom' && this.deviceContext) {
      this.deviceContext.send({
        setMode: DeviceMode.MANUAL
      });
    }
  }
  
  /**
   * Set the target arousal state
   * @param {string} state - The target arousal state
   */
  setTargetState(state) {
    if (this.targetState !== state) {
      this.targetState = state;
      this.lastStateTransition = Date.now();
      
      // Determine initial target speed for the new state
      this.determineTargetSpeed();
    }
  }
  
  /**
   * Update device control based on current readings and target state
   * @param {Object} reading - Current device reading
   * @param {string} currentState - Current detected arousal state
   */
  updateControl(reading, currentState) {
    if (!this.active) return;
    
    // If we're not in a ramp operation, adjust target speed
    if (!this.rampInProgress) {
      // Determine target speed based on state and readings
      this.determineTargetSpeed(reading, currentState);
      
      // Adjust current speed towards target
      this.adjustMotorSpeed();
    }
  }
  
  /**
   * Determine target motor speed based on target state
   * @param {Object} reading - Current device reading
   * @param {string} currentState - Current detected arousal state
   */
  determineTargetSpeed(reading, currentState) {
    let targetSpeed = 0;
    
    // Calculate time since last state transition
    const timeSinceTransition = Date.now() - this.lastStateTransition;
    
    switch (this.targetState) {
      case ArousalStates.BASELINE:
        targetSpeed = this.config.baselineSpeed;
        break;
        
      case ArousalStates.AROUSAL:
        // Gradually ramp up in arousal state
        const arousalRange = this.config.arousalMaxSpeed - this.config.arousalMinSpeed;
        const arousalProgress = Math.min(1, timeSinceTransition / (this.config.motorRampTime * 1000));
        targetSpeed = this.config.arousalMinSpeed + (arousalRange * arousalProgress);
        
        // If we're at the edge or approaching it, back off
        if (currentState === ArousalStates.EDGE) {
          targetSpeed = Math.max(this.config.arousalMinSpeed, targetSpeed * 0.7);
        }
        break;
        
      case ArousalStates.EDGE:
        // Modulate speed to maintain edge state
        targetSpeed = this.calculateEdgeSpeed(reading, currentState);
        break;
        
      case ArousalStates.ORGASM:
        targetSpeed = this.config.orgasmSpeed;
        break;
        
      case ArousalStates.POST_ORGASM:
        targetSpeed = this.config.postOrgasmSpeed;
        break;
    }
    
    this.targetMotorSpeed = Math.max(0, Math.min(255, Math.round(targetSpeed)));
  }
  
  /**
   * Calculate the ideal speed to maintain an edge state
   * @param {Object} reading - Current device reading
   * @param {string} currentState - Current detected arousal state
   * @returns {number} Target motor speed
   */
  calculateEdgeSpeed(reading, currentState) {
    if (!reading) return this.config.edgeMinSpeed;
    
    // Calculate target speed based on current arousal percentage
    const arousalLimit = reading.arousalLimit || this.deviceContext?.config?.sensitivity_threshold || 1000;
    const arousalPercentage = reading.arousal / arousalLimit;
    
    // Base edge speed range
    const edgeRange = this.config.edgeMaxSpeed - this.config.edgeMinSpeed;
    
    // If currently at edge, keep speed constant
    if (currentState === ArousalStates.EDGE) {
      return this.currentMotorSpeed;
    }
    
    // If below edge (arousal state), gradually increase
    if (currentState === ArousalStates.AROUSAL) {
      const normalizedArousal = Math.min(1, arousalPercentage / 0.85); // Normalize to edge threshold
      return this.config.edgeMinSpeed + (edgeRange * normalizedArousal);
    }
    
    // If at orgasm, back off significantly
    if (currentState === ArousalStates.ORGASM) {
      return this.config.edgeMinSpeed * 0.8;
    }
    
    // Default edge speed
    return this.config.edgeMinSpeed;
  }
  
  /**
   * Adjust current motor speed towards target
   */
  adjustMotorSpeed() {
    if (this.currentMotorSpeed === this.targetMotorSpeed) return;
    
    // If significant change, use ramp
    if (Math.abs(this.currentMotorSpeed - this.targetMotorSpeed) > 20) {
      this.startRamp(this.currentMotorSpeed, this.targetMotorSpeed);
    } else {
      // Small change, update directly
      this.setMotorSpeed(this.targetMotorSpeed);
    }
  }
  
  /**
   * Start a speed ramp operation
   * @param {number} startSpeed - Starting motor speed
   * @param {number} endSpeed - Target motor speed
   */
  startRamp(startSpeed, endSpeed) {
    // Clear any existing ramp
    if (this.rampInterval) {
      clearInterval(this.rampInterval);
    }
    
    // Set ramp parameters
    this.rampInProgress = true;
    this.rampStartTime = Date.now();
    this.rampStartSpeed = startSpeed;
    this.rampEndSpeed = endSpeed;
    
    // Calculate ramp duration based on change magnitude
    const changeSize = Math.abs(endSpeed - startSpeed);
    const normalizedChange = changeSize / 255;
    const rampDuration = normalizedChange * this.config.motorRampTime * 1000;
    
    // Set up ramp interval
    const stepTime = rampDuration / this.config.motorRampSteps;
    
    this.rampInterval = setInterval(() => {
      const elapsed = Date.now() - this.rampStartTime;
      const progress = Math.min(1, elapsed / rampDuration);
      
      // Calculate current speed in ramp
      const currentSpeed = this.rampStartSpeed + ((this.rampEndSpeed - this.rampStartSpeed) * progress);
      
      // Update motor speed
      this.setMotorSpeed(Math.round(currentSpeed));
      
      // End ramp when complete
      if (progress >= 1) {
        this.rampInProgress = false;
        clearInterval(this.rampInterval);
        this.rampInterval = null;
      }
    }, stepTime);
  }
  
  /**
   * Set motor speed on active device
   * @param {number} speed - Target motor speed (0-255)
   */
  setMotorSpeed(speed) {
    speed = Math.max(0, Math.min(255, Math.round(speed)));
    
    // Update internal tracking
    this.currentMotorSpeed = speed;
    
    // Update the appropriate device
    if (this.config.mode === 'eom' && this.deviceContext) {
      this.deviceContext.send({
        setMotor: speed
      });
    } else if (this.config.mode === 'buttplug' && this.buttplugDevice) {
      // Normalize to 0-1 for buttplug
      const normalizedSpeed = speed / 255;
      
      try {
        if (normalizedSpeed > 0) {
          this.buttplugDevice.SendVibrateCmd(normalizedSpeed);
        } else {
          this.buttplugDevice.SendStopDeviceCmd();
        }
      } catch (error) {
        console.error('Error controlling buttplug device:', error);
      }
    }
  }
  
  /**
   * Update controller configuration
   * @param {Object} newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}

export default DeviceController;