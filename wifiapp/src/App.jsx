// App.jsx
import React, { useState } from 'react';
import useWebRTC from './hooks/useWebRTC';
import './App.css'
const App = () => {
  const [roomId, setRoomId] = useState('');
  const [inCall, setInCall] = useState(false);
  const { localVideoRef, remoteVideoRef } = useWebRTC(roomId);

  const handleJoinRoom = () => {
    setInCall(true);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px',border:'2px solid #fff',borderRadius:'5px' }}>
      {!inCall ? (
        <div>
          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <video ref={localVideoRef} autoPlay playsInline style={{ width: '300px', margin: '10px' }} />
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', margin: '10px' }} />
        </div>
      )}
    </div>
  );
};

export default App;
