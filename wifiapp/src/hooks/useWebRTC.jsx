import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useWebRTC = (roomId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    const initWebRTC = async () => {
      // Get local media stream (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      // Initialize socket connection
      socketRef.current = io('https://letscall.onrender.com'); // Replace with your backend URL
      socketRef.current.emit('join', roomId);

      // Initialize peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Set up event listeners for peer connection
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

      // Set peerConnectionRef for cleanup
      peerConnectionRef.current = peerConnection;

      // Create and send offer to signaling server
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit('signal', {
        room: roomId,
        description: peerConnection.localDescription,
      });

      // Handle signals received from signaling server
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
    };

    initWebRTC();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
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
