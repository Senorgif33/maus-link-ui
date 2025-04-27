To implement Phase 1 for your Edge-o-Matic LLM integration, here are the necessary changes to the forked UI:
New Core Components

State Machine Components:

Create src/SessionController.js: Manages session flow and coordinates components
Create src/ArousalMonitor.js: Analyzes device readings to determine arousal state
Create src/StateManager.js: Handles state transitions with hysteresis logic
Create src/DeviceController.js: Controls device based on desired state


Data Models:

Create src/models/SessionConfig.js: Defines session parameters/modes
Create src/models/ArousalState.js: Defines state constants and transition rules



UI Modifications

New Routes:

Modify DeviceRoutes.js: Add routes for session and LLM interface
Create src/pages/Session.js: Main session control interface
Create src/pages/LLMChat.js: Placeholder for chat interface


New Components:

Create src/components/StateVisualizer.js: Visual representation of arousal state
Create src/components/SessionControls.js: Start/stop buttons and session status
Create src/components/SessionConfig.js: Session mode selection UI



WebSocket Integration

Extend DeviceProvider:

Modify src/DeviceProvider/index.js:

Add session state management
Add callbacks for state transitions
Create methods for session control




Modify Dashboard:

Update src/pages/Dashboard.js: Add session management panel
Add state visualization to the existing Stats component