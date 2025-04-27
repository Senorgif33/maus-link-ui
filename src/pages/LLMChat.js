import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, TextInput, Select, Tabs, Tab } from 'react-materialize';

const LLMChat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // LLM Settings
  const [settings, setSettings] = useState({
    endpoint: 'http://localhost:8000/api/chat', // Default local endpoint
    model: 'llama3', // Default model
    temperature: 0.7,
    maxTokens: 1024,
    characterName: 'Mistress',
    characterPersonality: 'Stern but caring mistress who enjoys control and teasing.',
    scenario: 'An edging session where the mistress controls when and if the user is allowed to orgasm.',
    firstMessage: 'Hello, I\'m your mistress for today\'s session. Are you ready to surrender control to me?'
  });
  
  // Scroll to bottom when chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // Start new chat with first message from character
  const startNewChat = () => {
    setChatHistory([
      { 
        role: 'assistant',
        content: settings.firstMessage,
        name: settings.characterName
      }
    ]);
  };
  
  // Handle settings change
  const handleSettingsChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    const updatedChat = [
      ...chatHistory, 
      { role: 'user', content: message }
    ];
    
    setChatHistory(updatedChat);
    setMessage('');
    setLoading(true);
    
    try {
      // Prepare the conversation context for the LLM
      const context = `You are ${settings.characterName}. ${settings.characterPersonality}
      
      Scenario: ${settings.scenario}
      
      The user is using an Edge-o-Matic 3000 device for automated edging. You are in control of the session.
      Only respond in character as ${settings.characterName}.`;
      
      // In a real implementation, this would call the LLM API
      // For now, we'll simulate a response after a short delay
      setTimeout(() => {
        const mockResponse = {
          role: 'assistant',
          content: `This is a simulated response from ${settings.characterName}. In a real implementation, this would come from the actual LLM API. The response would be based on your message: "${message}"`,
          name: settings.characterName
        };
        
        setChatHistory([...updatedChat, mockResponse]);
        setLoading(false);
      }, 1000);
      
      // Real implementation would look like:
      /*
      const response = await fetch(settings.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: context },
            ...updatedChat.map(msg => ({
              role: msg.role,
              content: msg.content,
              name: msg.name
            }))
          ],
          temperature: parseFloat(settings.temperature),
          max_tokens: parseInt(settings.maxTokens)
        })
      });
      
      const data = await response.json();
      setChatHistory([...updatedChat, data.message]);
      */
      
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };
  
  return (
    <Container style={{ marginTop: '3rem' }}>
      <Row>
        <Col s={12}>
          <Tabs className="tab-demo z-depth-1">
            <Tab title="Chat" active>
              <Card>
                <div className="chat-container" style={{ height: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                  {chatHistory.length === 0 ? (
                    <div className="center" style={{ marginTop: '2rem' }}>
                      <p>No messages yet. Configure the AI settings and start a new chat.</p>
                      <Button onClick={startNewChat}>Start New Chat</Button>
                    </div>
                  ) : (
                    chatHistory.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`message ${msg.role === 'assistant' ? 'ai-message' : 'user-message'}`}
                        style={{
                          margin: '0.5rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '1rem',
                          maxWidth: '80%',
                          alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end',
                          backgroundColor: msg.role === 'assistant' ? '#308cb3' : '#1F5A73',
                          marginLeft: msg.role === 'assistant' ? '0' : 'auto',
                          marginRight: msg.role === 'assistant' ? 'auto' : '0',
                        }}
                      >
                        {msg.role === 'assistant' && (
                          <div className="message-name" style={{ fontWeight: 'bold' }}>
                            {msg.name || 'AI'}
                          </div>
                        )}
                        <div className="message-content">
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage}>
                  <Row style={{ marginBottom: '0' }}>
                    <Col s={9}>
                      <TextInput
                        id="message"
                        label="Type your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading || chatHistory.length === 0}
                      />
                    </Col>
                    <Col s={3}>
                      <Button
                        type="submit"
                        disabled={loading || !message.trim() || chatHistory.length === 0}
                        style={{ marginTop: '1.5rem' }}
                      >
                        {loading ? 'Sending...' : 'Send'}
                      </Button>
                    </Col>
                  </Row>
                </form>
              </Card>
            </Tab>
            
            <Tab title="AI Settings">
              <Card>
                <h5>LLM Configuration</h5>
                
                <Row>
                  <Col s={12} m={6}>
                    <TextInput
                      id="endpoint"
                      label="API Endpoint"
                      value={settings.endpoint}
                      onChange={(e) => handleSettingsChange('endpoint', e.target.value)}
                    />
                  </Col>
                  <Col s={12} m={6}>
                    <Select
                      id="model"
                      label="Model"
                      value={settings.model}
                      onChange={(e) => handleSettingsChange('model', e.target.value)}
                    >
                      <option value="llama3">Llama 3</option>
                      <option value="mistral">Mistral</option>
                      <option value="claude">Claude</option>
                      <option value="gpt4">GPT-4</option>
                    </Select>
                  </Col>
                </Row>
                
                <Row>
                  <Col s={12} m={6}>
                    <p className="range-field">
                      <label>Temperature: {settings.temperature}</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => handleSettingsChange('temperature', e.target.value)}
                      />
                    </p>
                  </Col>
                  <Col s={12} m={6}>
                    <p className="range-field">
                      <label>Max Tokens: {settings.maxTokens}</label>
                      <input
                        type="range"
                        min="256"
                        max="4096"
                        step="256"
                        value={settings.maxTokens}
                        onChange={(e) => handleSettingsChange('maxTokens', e.target.value)}
                      />
                    </p>
                  </Col>
                </Row>
                
                <h5>Character Settings</h5>
                
                <Row>
                  <Col s={12} m={6}>
                    <TextInput
                      id="characterName"
                      label="Character Name"
                      value={settings.characterName}
                      onChange={(e) => handleSettingsChange('characterName', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col s={12}>
                    <TextInput
                      id="characterPersonality"
                      label="Character Personality"
                      value={settings.characterPersonality}
                      onChange={(e) => handleSettingsChange('characterPersonality', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col s={12}>
                    <TextInput
                      id="scenario"
                      label="Scenario"
                      value={settings.scenario}
                      onChange={(e) => handleSettingsChange('scenario', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col s={12}>
                    <TextInput
                      id="firstMessage"
                      label="First Message"
                      value={settings.firstMessage}
                      onChange={(e) => handleSettingsChange('firstMessage', e.target.value)}
                    />
                  </Col>
                </Row>
                
                <Row>
                  <Col s={12} className="center">
                    <Button onClick={startNewChat}>Start New Chat with These Settings</Button>
                  </Col>
                </Row>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default LLMChat;