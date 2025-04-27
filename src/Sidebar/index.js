import React, {useContext, useState} from 'react'
import {Button, Icon, SideNav, SideNavItem} from "react-materialize";
import blueprint from '../assets/EoM_Blueprint.svg';
import Connect from "../DeviceProvider/Connect";
import {DeviceContext} from "../DeviceProvider";
import {NavLink} from "react-router-dom";
import {ButtplugContext, ButtplugState} from "../DeviceProvider/ButtplugProvider";
import './index.scss'
import {SessionContext} from "../SessionController";

const Sidebar = () => {
  const context = useContext(DeviceContext);
  const buttplug = useContext(ButtplugContext);
  const sessionContext = useContext(SessionContext);
  const connecting = context.state === 'connecting';
  const connected = context.state === 'connected';
  const disconnected = context.state === 'disconnected';

  return (
    <SideNav
      id="SideNav"
      options={{
        draggable: true
      }}
      fixed
    >
      <SideNavItem
        user={{
          background: blueprint,
          image: blueprint,
          name: context.state === 'connecting' ? "Connecting..." : (context.info.deviceName || "Unknown Device"),
          email: context.ip || "Disconnected"
        }}
        userView
      />

      { buttplug.devices.map((device, i) => {
        let klass = "";

        if (device.Name && device.Name.match(/lovense/i)) {
          klass = "lovense";
        }

        return (<li className={'buttplug-device ' + klass} key={i}>
          <div className="device-name">{ device.Name }</div>
          <div className="status" />
          <a href={'#'} className="disconnect" onClick={e => e.preventDefault() } title={'Pause Control'}>
            <Icon>pause</Icon>
          </a>
        </li>);
      })}

      <li><NavLink to={"/"} exact activeClassName={'primary-dark white-text'}><Icon className={'prefix'}>dashboard</Icon> Dashboard</NavLink></li>
      
      {/* Session Navigation Links */}
      <li>
        <NavLink to={"/session"} activeClassName={'primary-dark white-text'}>
          <Icon className={'prefix'}>timer</Icon> 
          AI Session
          {sessionContext.active && 
            <span className="new badge pulse" style={{float: 'none', marginLeft: '10px'}}>Active</span>}
        </NavLink>
      </li>
      <li>
        <NavLink to={"/chat"} activeClassName={'primary-dark white-text'}>
          <Icon className={'prefix'}>chat</Icon> 
          LLM Chat
        </NavLink>
      </li>
      
      <li><NavLink to={"/settings"} activeClassName={'primary-dark white-text'}><Icon className={'prefix'}>settings</Icon> Settings</NavLink></li>
      <li><NavLink to={"/console"} activeClassName={'primary-dark white-text'}><Icon className={'prefix'}>code</Icon> Serial Console</NavLink></li>
      <li><NavLink to={"/files"} activeClassName={'primary-dark white-text'}><Icon className={'prefix'}>folder_open</Icon> File Manager</NavLink></li>

      { !disconnected && <React.Fragment>
        <SideNavItem divider />

        { buttplug.state === ButtplugState.IDLE && <SideNavItem
          href={'#!buttplug'}
          onClick={e => {
            e.preventDefault();
            buttplug.startPairing()
          }}
          waves
          icon={<Icon>bluetooth</Icon>}
        >
          Pair Device
        </SideNavItem> }

        { buttplug.state === ButtplugState.PAIRING && <SideNavItem
          href={'#!buttplug'}
          onClick={e => {
            e.preventDefault();
            buttplug.stopPairing()
          }}
          waves
          icon={<Icon>bluetooth</Icon>}
        >
          Cancel Pairing
        </SideNavItem> }

        <SideNavItem
          href="#!disconnect"
          onClick={e => {
            e.preventDefault(); context.connect(null)
          }}
          waves
          icon={<Icon>close</Icon>}
        >
          Disconnect
        </SideNavItem>
      </React.Fragment> }
    </SideNav>
  )
};

export default Sidebar;