import React from 'react';
import useWebRTC from './hooks/useWebRTC';
import './App.css'

const DEFAULT_ROOM_ID = 'room1';

const App = () => {
  const { localVideoRef, remoteVideoRef } = useWebRTC(DEFAULT_ROOM_ID);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <div>
        <video ref={localVideoRef} autoPlay playsInline style={{ width: '300px', margin: '10px' }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', margin: '10px' }} />
      </div>
    </div>
  );
};

export default App;
