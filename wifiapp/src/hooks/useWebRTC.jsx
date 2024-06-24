import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useWebRTC = (roomId) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');

    socketRef.current.emit('join', roomId);

    socketRef.current.on('user-joined', async (userId) => {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;

      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('signal', {
            room: roomId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnectionRef.current = peerConnection;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit('signal', {
        room: roomId,
        description: peerConnection.localDescription,
      });
    });

    socketRef.current.on('signal', async (data) => {
      if (data.description) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.description));
        if (data.description.type === 'offer') {
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);

          socketRef.current.emit('signal', {
            room: roomId,
            description: peerConnectionRef.current.localDescription,
          });
        }
      } else if (data.candidate) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      socketRef.current.disconnect();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return { localVideoRef, remoteVideoRef };
};

export default useWebRTC;
