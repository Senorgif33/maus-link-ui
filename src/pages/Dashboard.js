import React, {useContext, useState} from 'react';
import Stats from "../Stats";
import Graph from "../Graph";
import {Button, Container, Card, Row, Col, Switch} from "react-materialize";
import {DeviceContext, DeviceMode, ReadingsContext} from "../DeviceProvider";
import {SessionContext} from "../SessionController";
import StateVisualizer from "../components/StateVisualizer";
import {Link} from "react-router-dom";
import {ArousalStates} from "../models/ArousalState";

const Dashboard = () => {
  const deviceContext = useContext(DeviceContext);
  const readingsContext = useContext(ReadingsContext);
  const sessionContext = useContext(SessionContext);

  const onModeChange = (e) => {
    const auto = e.target.checked;
    const mode = auto ? DeviceMode.AUTOMATIC : DeviceMode.MANUAL;
    deviceContext.send({ setMode: mode });
  };

  const onStop = (e) => {
    e.preventDefault();

    deviceContext.send({
      setMode: DeviceMode.MANUAL,
      setMotor: 0
    });
  };

  const onJizzumPermitted = (e) => {
    e.preventDefault();

    deviceContext.send({
      setMode: DeviceMode.MANUAL,
      setMotor: 255
    });
  };

  return (
    <Container style={{ marginTop: '3rem' }}>
      <Stats />

      <Row>
        <Col s={12} m={8}>
          <div className={'row'} style={{ marginTop: '3rem' }}>
            <div className={'col s12 m4'}>
              <Button onClick={onStop} large disabled={ readingsContext.lastReading.motor === 0} className={'red darken-2 block'}>STOP!</Button>
            </div>
            <div className={'col s12 m4'}>
              <div className={'center'} style={{ lineHeight: '54px' }}>
                <Switch
                  id="ModeSwitch"
                  offLabel="Manual"
                  onChange={onModeChange}
                  onLabel="Automatic"
                  checked={deviceContext.mode === DeviceMode.AUTOMATIC}
                />
              </div>
            </div>
            <div className={'col s12 m4'}>
              <Button onClick={onJizzumPermitted} large disabled={ deviceContext.mode !== DeviceMode.AUTOMATIC } className={'green darken-2 block'}>Allow Orgasm</Button>
            </div>
          </div>
        </Col>
        
        <Col s={12} m={4}>
          <Card 
            title="AI Session" 
            className="blue-grey darken-1 white-text"
            style={{ marginTop: '3rem' }}
          >
            {!sessionContext.active ? (
              <div>
                <p>Start an AI-guided edging session.</p>
                <Link to="/session">
                  <Button className="purple darken-1" style={{ width: '100%' }}>
                    Configure Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <p>Session in progress</p>
                <StateVisualizer 
                  currentState={sessionContext.currentState}
                  targetState={sessionContext.targetState} 
                  readings={readingsContext}
                  config={deviceContext.config}
                />
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/session">
                    <Button className="purple darken-1" style={{ width: '100%' }}>
                      View Session
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <div className={'row'}>
        <div className={'col s12'}>
          <div className={'card'}>
            <div className={'card-content'}>
              <Graph />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
};

export default Dashboard;