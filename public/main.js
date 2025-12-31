// // ==========================
// // DOM
// // ==========================
// const meetingInput = document.getElementById("meetingIdInput");
// const userInput = document.getElementById("userIdInput");
// const joinBtn = document.getElementById("joinBtn");
// const localVideo = document.getElementById("localVideo");
// const remoteVideo = document.getElementById("remoteVideo");
// const endCallBtn = document.getElementById("end-call-btn");
// const statusText = document.getElementById("status-text");

// let pendingCandidates = [];

// // ==========================
// // SOCKET
// // ==========================
// const socket = io("https://webrtc-test.knot.dating", {
//   transports: ["websocket", "polling"],
// });

// // ==========================
// // STATE
// // ==========================
// let meetingId = null;
// let userId = null;
// let localStream = null;
// let peerConnection = null;

// // ==========================
// // WEBRTC CONFIG
// // ==========================
// const rtcConfig = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     {
//         urls: "turn:34.131.190.182:3478",
//         username: "webrtc_user",
//         credential: "webrtc_pass"
//     }
//   ],
// };

// // ==========================
// // PEER CONNECTION
// // ==========================
// const PeerConnection = (function () {
//     let peerConnection = null;
  
//     const createPeerConnection = () => {
//       const config = {
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           {
//             urls: "turn:34.131.109.208:3478",
//             username: "webrtc_user",
//             credential: "webrtc_pass"
//           }
//         ],
//       };
  
//       const pc = new RTCPeerConnection(config);
  
//       localStream.getTracks().forEach(track =>
//         pc.addTrack(track, localStream)
//       );
  
//       pc.ontrack = (event) => {
//         remoteVideo.srcObject = event.streams[0];
//       };
  
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           console.log("❄️ ICE GENERATED", {
//             type: event.candidate.type,
//             protocol: event.candidate.protocol,
//             address: event.candidate.address,
//             port: event.candidate.port,
//           });
      
//           socket.emit("webrtc-ice", {
//             candidate: event.candidate.toJSON(),
//           });          
          
//         } else {
//           console.log("🧊 ICE GATHERING COMPLETE");
//         }
//       };
      
  
//       return pc;
//     };
  
//     return {
//       getInstance: () => {
//         if (!peerConnection) peerConnection = createPeerConnection();
//         return peerConnection;
//       },
//       reset: () => {
//         peerConnection = null;
//       },
//     };
//   })();
  

// // ==========================
// // MEDIA
// // ==========================
// async function startMedia() {
//   localStream = await navigator.mediaDevices.getUserMedia({
//     audio: true,
//     video: true,
//   });
//   localVideo.srcObject = localStream;
// }

// // ==========================
// // JOIN FLOW
// // ==========================
// joinBtn.addEventListener("click", async () => {
//   meetingId = meetingInput.value.trim();
//   userId = userInput.value.trim();

//   if (!meetingId || !userId) {
//     alert("Enter meetingId and userId");
//     return;
//   }

//   await startMedia();

//   socket.emit("join-meeting", {
//     meetingId,
//     userId,
//   });

//   statusText.innerText = "Joining meeting...";
//   joinBtn.disabled = true;
// });

// // ==========================
// // MEETING EVENTS
// // ==========================
// socket.on("meeting-waiting", () => {
//   statusText.innerText = "Waiting for other user to join…";
// });

// socket.on("peer-joined", async () => {
//     const pc = PeerConnection.getInstance();
  
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);
  
//     console.log("📤 OFFER CREATED", {
//       type: offer.type,
//       sdpLength: offer.sdp.length,
//     });
  
//     socket.emit("webrtc-offer", {
//       offer: pc.localDescription,
//     });
  
//     console.log("📤 OFFER SENT");
//     showCallUI();
//   });
  

// // socket.on("peer-left", () => {
// //   statusText.innerText = "Other user left the meeting.";
// //   cleanup();
// // });

// // socket.on("meeting-ended", ({ reason }) => {
// //   statusText.innerText = `Meeting ended (${reason})`;
// //   cleanup();
// // });

// socket.on("peer-left", () => {
//     endCall(false);
//   });
  
//   socket.on("meeting-ended", () => {
//     endCall(false);
//   });
  

// async function flushCandidates() {
//     for (const c of pendingCandidates) {
//       await peerConnection.addIceCandidate(c);
//     }
//     pendingCandidates = [];
//   }

// // ==========================
// // WEBRTC SIGNALING
// // ==========================
// socket.on("webrtc-offer", async ({ offer }) => {
//     console.log("📥 OFFER RECEIVED", {
//       type: offer.type,
//       sdpLength: offer.sdp.length,
//     });
  
//     const pc = PeerConnection.getInstance();
  
//     await pc.setRemoteDescription(offer);
  
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);
  
//     console.log("📤 ANSWER CREATED", {
//       type: answer.type,
//       sdpLength: answer.sdp.length,
//     });
  
//     socket.emit("webrtc-answer", {
//       answer: pc.localDescription,
//     });
  
//     console.log("📤 ANSWER SENT");
//     showCallUI();
//   });
  
  
//   socket.on("webrtc-answer", async ({ answer }) => {
//     console.log("📥 ANSWER RECEIVED", {
//       type: answer.type,
//       sdpLength: answer.sdp.length,
//     });
  
//     const pc = PeerConnection.getInstance();
//     await pc.setRemoteDescription(answer);
//   });
  
  

//   socket.on("webrtc-ice", async ({ candidate }) => {
//     console.log("📥 ICE RECEIVED", {
//       type: candidate.type,
//       protocol: candidate.protocol,
//       address: candidate.address,
//       port: candidate.port,
//     });
  
//     const pc = PeerConnection.getInstance();
//     await pc.addIceCandidate(new RTCIceCandidate(candidate));
//   });
  


// function showCallUI() {
//     const endBtn = document.getElementById("end-call-btn");
//     endBtn.style.display = "block";
// }

// function hideCallUI() {
//     const endBtn = document.getElementById("end-call-btn");
//     endBtn.style.display = "none";

//     // Stop showing videos
//     const remoteVideo = document.getElementById("remoteVideo");
//     const localVideo = document.getElementById("localVideo");

//     remoteVideo.srcObject = null;
//     localVideo.srcObject = null;
// }

// // ==========================
// // END CALL
// // ==========================
// endCallBtn.addEventListener("click", () => {
//   socket.emit("end-call");
//   cleanup();
// });

// // ==========================
// // CLEANUP
// // ==========================
// function cleanup() {
//   if (peerConnection) {
//     peerConnection.close();
//     peerConnection = null;
//   }

//   if (localStream) {
//     localStream.getTracks().forEach((t) => t.stop());
//     localStream = null;
//   }

//   localVideo.srcObject = null;
//   remoteVideo.srcObject = null;
//   endCallBtn.style.display = "none";
//   joinBtn.disabled = false;
// }




























// ============================================
// UPDATED FRONTEND - Meeting with Transcription
// ============================================

// ==========================
// DOM ELEMENTS
// ==========================
const meetingInput = document.getElementById("meetingIdInput");
const userInput = document.getElementById("userIdInput");
const joinBtn = document.getElementById("joinBtn");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");
const statusText = document.getElementById("status-text");

// ==========================
// SOCKET CONNECTION
// ==========================
const socket = io("https://webrtc-test.knot.dating", {
  transports: ["websocket", "polling"],
});

// ==========================
// STATE
// ==========================
let meetingId = null;
let userId = null;
let localStream = null;
let peerConnection = null;
let audioContext = null;
let processor = null;
let isInMeeting = false;
let isAudioStreamingActive = false;

// ==========================
// WEBRTC CONFIG
// ==========================
const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:34.131.190.182:3478",
      username: "webrtc_user",
      credential: "webrtc_pass",
    },
  ],
};

// ==========================
// SOCKET EVENT HANDLERS
// ==========================
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err);
  alert("Connection error. Please check your internet.");
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
  if (isInMeeting) {
    cleanup();
  }
});

// Meeting waiting
socket.on("meeting-waiting", () => {
  console.log("⏳ Waiting for other user...");
  statusText.innerText = "Waiting for other user to join…";
});

// Peer joined
socket.on("peer-joined", async () => {
  console.log("👥 Peer joined, creating offer...");
  statusText.innerText = "Peer joined. Connecting...";

  const pc = getPeerConnection();

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  console.log("📤 OFFER CREATED", {
    type: offer.type,
    sdpLength: offer.sdp.length,
  });

  socket.emit("webrtc-offer", {
    offer: pc.localDescription,
  });

  console.log("📤 OFFER SENT");
  showCallUI();
});

// Peer left
socket.on("peer-left", () => {
  console.log("❌ Peer left");
  statusText.innerText = "Other user left the meeting.";
  cleanup();
});

// Meeting ended (normal)
socket.on("meeting-ended", ({ reason }) => {
  console.log("📴 Meeting ended:", reason);
  statusText.innerText = `Meeting ended (${reason})`;
  cleanup();
});

// Meeting force-ended (AI moderation)
socket.on("force-end-meeting", ({ reason, timestamp }) => {
  console.warn("🚨 Meeting force-ended:", reason);
  alert(`⚠️ Meeting ended: ${reason}`);
  statusText.innerText = `Meeting ended: ${reason}`;
  cleanup();
});

// WebRTC Offer received
socket.on("webrtc-offer", async ({ offer }) => {
  console.log("📥 OFFER RECEIVED", {
    type: offer.type,
    sdpLength: offer.sdp.length,
  });

  const pc = getPeerConnection();

  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  console.log("📤 ANSWER CREATED", {
    type: answer.type,
    sdpLength: answer.sdp.length,
  });

  socket.emit("webrtc-answer", {
    answer: pc.localDescription,
  });

  console.log("📤 ANSWER SENT");

  // ✅ START AUDIO STREAMING when answer is sent
  startAudioStreaming(localStream);

  showCallUI();
});

// WebRTC Answer received
socket.on("webrtc-answer", async ({ answer }) => {
  console.log("📥 ANSWER RECEIVED", {
    type: answer.type,
    sdpLength: answer.sdp.length,
  });

  const pc = getPeerConnection();
  await pc.setRemoteDescription(new RTCSessionDescription(answer));

  // ✅ START AUDIO STREAMING when answer is received
  startAudioStreaming(localStream);

  statusText.innerText = "Connected!";
});

// ICE Candidate received
socket.on("webrtc-ice", async ({ candidate }) => {
  console.log("📥 ICE RECEIVED", {
    type: candidate.type,
    protocol: candidate.protocol,
    address: candidate.address,
    port: candidate.port,
  });

  const pc = getPeerConnection();
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

// Transcription received (optional - for display)
socket.on("transcription", ({ userId: speaker, text, timestamp }) => {
  console.log(`📝 [${speaker}]:`, text);
  // You can display this in UI if needed
  // Example: Add to a chat-like display
});

// ==========================
// PEER CONNECTION
// ==========================
function getPeerConnection() {
  if (peerConnection) {
    return peerConnection;
  }

  console.log("🔗 Creating peer connection...");

  peerConnection = new RTCPeerConnection(rtcConfig);

  // Add local stream tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
      console.log(`➕ Added ${track.kind} track`);
    });
  }

  // Handle incoming tracks
  peerConnection.ontrack = (event) => {
    console.log("📺 Received remote track:", event.track.kind);
    remoteVideo.srcObject = event.streams[0];
    statusText.innerText = "Call connected!";
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("❄️ ICE GENERATED", {
        type: event.candidate.type,
        protocol: event.candidate.protocol,
        address: event.candidate.address,
        port: event.candidate.port,
      });

      socket.emit("webrtc-ice", {
        candidate: event.candidate.toJSON(),
      });
    } else {
      console.log("🧊 ICE GATHERING COMPLETE");
    }
  };

  // Handle connection state
  peerConnection.onconnectionstatechange = () => {
    console.log("🔗 Connection state:", peerConnection.connectionState);

    if (
      peerConnection.connectionState === "disconnected" ||
      peerConnection.connectionState === "failed" ||
      peerConnection.connectionState === "closed"
    ) {
      console.log("Connection lost");
      cleanup();
    }
  };

  return peerConnection;
}

// ==========================
// MEDIA
// ==========================
async function startMedia() {
  try {
    console.log("🎥 Requesting camera and microphone...");

    localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000, // Match backend
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });

    localVideo.srcObject = localStream;

    console.log("✅ Camera and microphone started");
    console.log("   Audio tracks:", localStream.getAudioTracks().length);
    console.log("   Video tracks:", localStream.getVideoTracks().length);

    // ❌ DO NOT START AUDIO STREAMING HERE
    // It will start after WebRTC connection is established

  } catch (error) {
    console.error("❌ Media error:", error);
    alert("Failed to access camera/microphone. Please grant permissions.");
    throw error;
  }
}

// ==========================
// AUDIO STREAMING FOR TRANSCRIPTION
// ==========================
function startAudioStreaming(stream) {
  if (!stream) {
    console.error("❌ No stream available for audio streaming");
    return;
  }

  if (isAudioStreamingActive) {
    console.log("ℹ️ Audio streaming already active");
    return;
  }

  try {
    console.log("🎤 Starting audio streaming for transcription...");

    // Create audio context
    audioContext = new AudioContext({ sampleRate: 16000 });

    // Create media stream source
    const source = audioContext.createMediaStreamSource(stream);

    // Create script processor
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    // Process audio
    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm16 = convertFloatToInt16(input);

      // Send to backend
      socket.emit("audio-chunk", pcm16.buffer);
    };

    // Connect nodes
    source.connect(processor);
    processor.connect(audioContext.destination);

    isAudioStreamingActive = true;

    console.log(`✅ Audio streaming started (16kHz, 16-bit PCM)`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

  } catch (err) {
    console.error(`❌ Audio streaming error:`, err);
  }
}

function stopAudioStreaming() {
  if (processor) {
    processor.disconnect();
    processor = null;
    console.log("⏹️ Audio processor stopped");
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
    console.log("⏹️ Audio context closed");
  }

  isAudioStreamingActive = false;
}

function convertFloatToInt16(float32Array) {
  const int16Array = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  return int16Array;
}

// ==========================
// JOIN MEETING
// ==========================
joinBtn.addEventListener("click", async () => {
  meetingId = meetingInput.value.trim();
  userId = userInput.value.trim();

  if (!meetingId || !userId) {
    alert("Enter meetingId and userId");
    return;
  }

  try {
    console.log(`📞 Joining meeting: ${meetingId} as ${userId}`);

    // Start camera and microphone
    await startMedia();

    // Join meeting
    socket.emit("join-meeting", {
      meetingId,
      userId,
    });

    isInMeeting = true;
    statusText.innerText = "Joining meeting...";
    joinBtn.disabled = true;

  } catch (error) {
    console.error("❌ Failed to join meeting:", error);
    alert("Failed to join meeting");
  }
});

// ==========================
// END CALL
// ==========================
endCallBtn.addEventListener("click", () => {
  console.log("📵 User clicked end call");
  socket.emit("end-call");
  cleanup();
});

// ==========================
// UI HELPERS
// ==========================
function showCallUI() {
  endCallBtn.style.display = "block";
  console.log("✅ Call UI shown");
}

function hideCallUI() {
  endCallBtn.style.display = "none";
  remoteVideo.srcObject = null;
  console.log("✅ Call UI hidden");
}

// ==========================
// CLEANUP
// ==========================
function cleanup() {
  console.log("🧹 Cleaning up...");

  // Stop audio streaming
  stopAudioStreaming();

  // Close peer connection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
    console.log("✅ Peer connection closed");
  }

  // Stop local stream
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
    console.log("✅ Local stream stopped");
  }

  // Clear videos
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;

  // Reset UI
  hideCallUI();
  joinBtn.disabled = false;

  // Reset state
  isInMeeting = false;
  isAudioStreamingActive = false;

  console.log("✅ Cleanup complete");
}

// ==========================
// CLEANUP ON PAGE UNLOAD
// ==========================
window.addEventListener("beforeunload", () => {
  if (isInMeeting) {
    socket.emit("end-call");
    cleanup();
  }
});

// ==========================
// DEBUG HELPER
// ==========================
window.debugMeeting = {
  getMeetingInfo: () => {
    socket.emit("get-meeting-info", {}, (response) => {
      console.log("Meeting Info:", response);
    });
  },
  checkAudioStreaming: () => {
    console.log("Audio Context:", audioContext);
    console.log("Processor:", processor);
    console.log("Is Active:", isAudioStreamingActive);
  },
  testAudioChunk: () => {
    const testChunk = new Int16Array(4096);
    socket.emit("audio-chunk", testChunk.buffer);
    console.log("Test audio chunk sent");
  },
};

console.log("🚀 Application initialized");
console.log("Debug: window.debugMeeting available");

// ============================================
// FLOW SUMMARY
// ============================================
/**
 * COMPLETE FLOW:
 *
 * 1. Page loads → Camera/Mic NOT started yet
 *
 * 2. User enters meetingId and userId → Click "Join"
 *    - startMedia() → Camera/Mic access granted
 *    - localVideo displays camera
 *    - emit('join-meeting')
 *    - ❌ Audio streaming NOT started yet
 *
 * 3. If first user:
 *    - Receives 'meeting-waiting'
 *    - Waits for second user
 *
 * 4. Second user joins:
 *    - First user receives 'peer-joined'
 *    - First user creates offer
 *    - emit('webrtc-offer')
 *
 * 5. Second user receives offer:
 *    - socket.on('webrtc-offer')
 *    - Creates answer
 *    - emit('webrtc-answer')
 *    - ✅ START AUDIO STREAMING (second user)
 *
 * 6. First user receives answer:
 *    - socket.on('webrtc-answer')
 *    - ✅ START AUDIO STREAMING (first user)
 *
 * 7. ICE candidates exchanged
 *    - Connection established
 *
 * 8. Audio flows:
 *    - User A: audio-chunk → Backend → Google STT → AI Check
 *    - User B: audio-chunk → Backend → Google STT → AI Check
 *
 * 9. If personal info detected:
 *    - Backend: force-end-meeting → Both users
 *    - Frontend: Alert shown + cleanup
 *
 * 10. Normal end:
 *     - User clicks end call → emit('end-call')
 *     - Stop audio streaming
 *     - Close peer connection
 *     - Clear videos
 *
 * KEY POINTS:
 * - ✅ Audio streaming starts AFTER WebRTC answer (when call is connected)
 * - ✅ Each user has separate audio stream on backend
 * - ✅ Backend tracks who said what
 * - ✅ Force end affects ALL users in meeting
 * - ✅ Proper cleanup on all scenarios
 */























// // working code with logs

// const createUserBtn = document.getElementById("create-user");
// const username = document.getElementById("username");
// const allusersHtml = document.getElementById("allusers");
// const localVideo = document.getElementById("localVideo");
// const remoteVideo = document.getElementById("remoteVideo");
// const endCallBtn = document.getElementById("end-call-btn");

// const socket = io("https://webrtc-test.knot.dating", {
//     transports: ["websocket", "polling"]
// });

// let localStream;
// let caller = [];
// let peerConnection = null;  
// let currentCallUser = null; 

// // Peer connection wrapper
// const PeerConnection = (function () {
//     let peerConnection = null;

//     const createPeerConnection = () => {
//         const config = {
//             iceServers: [
//                 { urls: "stun:stun.l.google.com:19302" },
//                 {
//                     urls: "turn:34.131.109.208:3478",
//                     username: "webrtc_user",
//                     credential: "webrtc_pass"
//                 }
//             ]
//         };

//         const pc = new RTCPeerConnection(config);

//         // Add local tracks
//         if(localStream) {
//             localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
//         }

//         // Log ICE candidates
//         pc.onicecandidate = (event) => {
//             if (event.candidate) {
//                 console.log(`[ICE Candidate] type: ${event.candidate.candidate.split(" ")[7]} | candidate:`, event.candidate.candidate);
//                 console.log(`[${new Date().toISOString()}] ICE candidate generated:`, event.candidate);
//                 socket.emit("icecandidate", {
//                     candidate: event.candidate,
//                     by: username.value
//                 });
//             }
//         };

//         // Log remote stream
//         pc.ontrack = (event) => {
//             console.log(`[${new Date().toISOString()}] Remote track received:`, event.streams[0]);
//             remoteVideo.srcObject = event.streams[0];
//         };

//         // ICE connection state change
//         pc.oniceconnectionstatechange = () => {
//             console.log(`[${new Date().toISOString()}] ICE connection state:`, pc.iceConnectionState);
//         };

//         // Peer connection state change
//         pc.onconnectionstatechange = () => {
//             console.log(`[${new Date().toISOString()}] Peer connection state:`, pc.connectionState);
//         };

//         // Log signaling state
//         pc.onsignalingstatechange = () => {
//             console.log(`[${new Date().toISOString()}] Signaling state:`, pc.signalingState);
//         };

//         return pc;
//     };

//     return {
//         getInstance: () => {
//             if (!peerConnection) peerConnection = createPeerConnection();
//             return peerConnection;
//         },
//         reset: () => {
//             peerConnection = null;
//         }
//     };
// })();

// // Join user
// createUserBtn.addEventListener("click", () => {
//     console.log(`[${new Date().toISOString()}] Emitting join-user for:`, username.value, "->", socket.id);
//     if(username.value !== "") {
//         const box = document.querySelector(".username-input");
//         socket.emit("join-user", username.value);
//         box.style.display = 'none';
//     }
// });

// // User list
// socket.on("joined", allusers => {
//     console.log(`[${new Date().toISOString()}] Users in room:`, allusers);
//     allusersHtml.innerHTML = "";

//     for(const user in allusers) {
//         const li = document.createElement("li");
//         li.textContent = `${user} ${user === username.value ? "(You)" : ""}`;

//         if(user !== username.value) {
//             const btn = document.createElement("button");
//             btn.classList.add("call-btn");
//             btn.addEventListener("click", () => startCall(user));

//             const img = document.createElement("img");
//             img.src = "./images/phone.png";
//             img.width = 20;

//             btn.appendChild(img);
//             li.appendChild(btn);
//         }

//         allusersHtml.appendChild(li);
//     }
// });

// // Offer received
// socket.on("offer", async ({ from, to, offer }) => {
//     console.log(`[${new Date().toISOString()}] Offer received from: ${from}`, offer);
//     const pc = PeerConnection.getInstance();
//     currentCallUser = from;

//     try {
//         await pc.setRemoteDescription(offer);
//         console.log(`[${new Date().toISOString()}] Remote description set`);
//     } catch (err) {
//         console.error(`[${new Date().toISOString()}] Error setting remote description:`, err);
//     }

//     try {
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
//         console.log(`[${new Date().toISOString()}] Local description set (answer)`);
//         socket.emit("answer", { from, to, answer: pc.localDescription });
//     } catch (err) {
//         console.error(`[${new Date().toISOString()}] Error creating/sending answer:`, err);
//     }

//     showCallUI();
// });

// // Answer received
// socket.on("answer", async ({ from, to, answer }) => {
//     console.log(`[${new Date().toISOString()}] Answer received from: ${from}`, answer);
//     const pc = PeerConnection.getInstance();

//     try {
//         await pc.setRemoteDescription(answer);
//         console.log(`[${new Date().toISOString()}] Remote description set (answer)`);
//     } catch (err) {
//         console.error(`[${new Date().toISOString()}] Error setting remote description:`, err);
//     }

//     showCallUI();
// });

// // ICE candidate received
// socket.on("icecandidate", async ({ candidate }) => {
//     console.log(`[${new Date().toISOString()}] ICE candidate received:`, candidate);
//     const pc = PeerConnection.getInstance();
//     try {
//         await pc.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log(`[${new Date().toISOString()}] ICE candidate added successfully`);
//     } catch (err) {
//         console.error(`[${new Date().toISOString()}] Error adding ICE candidate:`, err);
//     }
// });

// // End call
// socket.on("call-ended", () => {
//     console.log(`[${new Date().toISOString()}] Call ended by other user`);
//     endCall(false);
// });

// socket.on("force-end-call", () => {
//     console.warn(`[${new Date().toISOString()}] Call forcefully ended by system (AI moderation).`);
//     endCall(true);
// });

// function showCallUI() {
//     const endBtn = document.getElementById("end-call-btn");
//     endBtn.style.display = "block";
// }

// function hideCallUI() {
//     const endBtn = document.getElementById("end-call-btn");
//     endBtn.style.display = "none";

//     const remoteVideo = document.getElementById("remoteVideo");
//     const localVideo = document.getElementById("localVideo");

//     remoteVideo.srcObject = null;
//     localVideo.srcObject = null;
// }

// // Initiate call
// const startCall = async (user) => {
//     console.log(`[${new Date().toISOString()}] Starting call to:`, user);
//     const pc = PeerConnection.getInstance();
//     currentCallUser = user;
//     try {
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(offer);
//         console.log(`[${new Date().toISOString()}] Offer created and local description set`);
//         socket.emit("offer", {
//             from: username.value,
//             to: user,
//             offer: pc.localDescription
//         });
//     } catch (err) {
//         console.error(`[${new Date().toISOString()}] Error creating/sending offer:`, err);
//     }
// };

// function endCall(forced) {
//     console.log(`[${new Date().toISOString()}] Ending call...`);

//     if (localStream) {
//         localStream.getTracks().forEach(t => t.stop());
//     }

//     remoteVideo.srcObject = null;
//     localVideo.srcObject = null;

//     const pc = PeerConnection.getInstance();
//     if (pc) pc.close();

//     PeerConnection.reset();
//     currentCallUser = null;

//     if (forced) {
//         alert("Call ended automatically due to sharing personal information.");
//     }

//     hideCallUI();
// }

// // =========================
// // START CAM + MIC
// // =========================
// async function startMyVideo() {
//     try {
//         localStream = await navigator.mediaDevices.getUserMedia({
//             audio: true,
//             video: true,
//         });

//         localVideo.srcObject = localStream;
//         console.log(`[${new Date().toISOString()}] Local camera and mic started`);

//         startAudioStreaming(localStream);
//     } catch (err) {
//         console.error(`[${new Date().toISOString()}] Camera/Mic error:`, err);
//     }
// }

// startMyVideo();

// // =========================
// // START AUDIO STREAMING
// // =========================
// function startAudioStreaming(stream) {
//     try {
//         audioContext = new AudioContext({ sampleRate: 16000 });
//         const source = audioContext.createMediaStreamSource(stream);
//         processor = audioContext.createScriptProcessor(4096, 1, 1);

//         processor.onaudioprocess = (e) => {
//             const input = e.inputBuffer.getChannelData(0);
//             const pcm16 = convertFloatToInt16(input);
//             // socket.emit("audio-chunk", pcm16);
//         };

//         source.connect(processor);
//         processor.connect(audioContext.destination);

//         console.log(`[${new Date().toISOString()}] Audio streaming started`);
//     } catch (err) {
//         console.error(`[${new Date().toISOString()}] Audio streaming error:`, err);
//     }
// }

// function convertFloatToInt16(float32Array) {
//     let int16Array = new Int16Array(float32Array.length);
//     for (let i = 0; i < float32Array.length; i++) {
//         let s = Math.max(-1, Math.min(1, float32Array[i]));
//         int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
//     }
//     return int16Array;
// }

// // Socket connection logs
// socket.on("connect", () => {
//     console.log(`[${new Date().toISOString()}] Socket connected with id:`, socket.id);
// });

// socket.on("connect_error", (err) => {
//     console.error(`[${new Date().toISOString()}] Socket connection error:`, err);
// });


























































































// // working code

// const createUserBtn = document.getElementById("create-user");
// const username = document.getElementById("username");
// const allusersHtml = document.getElementById("allusers");
// const localVideo = document.getElementById("localVideo");
// const remoteVideo = document.getElementById("remoteVideo");
// const endCallBtn = document.getElementById("end-call-btn");

// // IMPORTANT: CONNECT TO REMOTE NESTJS SERVER
// // const socket = io("http://34.131.190.182:3000", {
// //     transports: ["websocket", "polling"], // always include polling first
// //   });
  
// //   const socket = io("https://34.102.240.255:3000", {
// //     transports: ["websocket", "polling"], // always include polling first
// //   });

// //   const socket = io("https://webrtc-test.knot.dating", {
// //     transports: ["websocket", "polling"], // always include polling first
// //   });

//   const socket = io("https://webrtc-test.knot.dating", {
//     transports: ["websocket", "polling"]
// });


// let localStream
// let caller = [];
// let peerConnection = null;  // override wrapper confusion
// let currentCallUser = null; // who you are talking to


// // Peer connection wrapper
// const PeerConnection = (function () {
//     let peerConnection = null;

//     const createPeerConnection = () => {
//         const config = {
//             iceServers: [
//                 { urls: "stun:stun.l.google.com:19302" },
//                 {
//                     urls: "turn:34.131.109.208:3478",
//                     username: "webrtc_user",
//                     credential: "webrtc_pass"
//                 }
//             ]
//         };

//         const pc = new RTCPeerConnection(config);

//         localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

//         pc.ontrack = (event) => {
//             remoteVideo.srcObject = event.streams[0];
//         };

//         pc.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.emit("icecandidate", {
//                     candidate: event.candidate,
//                     by: username.value
//                 });
//             }
//         };

//         return pc;
//     };

//     return {
//         getInstance: () => {
//             if (!peerConnection) peerConnection = createPeerConnection();
//             return peerConnection;
//         },
//         reset: () => {
//             peerConnection = null;
//         }
//     };
// })();


// // Join user
// createUserBtn.addEventListener("click", () => {
//     console.log("Emitting join-user for:", username.value, "  -> ", socket.id);
//     if(username.value !== "") {
//         const box = document.querySelector(".username-input");
//         socket.emit("join-user", username.value);
//         box.style.display = 'none';
//     }
// });

// // User list
// socket.on("joined", allusers => {
//     allusersHtml.innerHTML = "";

//     for(const user in allusers) {
//         const li = document.createElement("li");
//         li.textContent = `${user} ${user === username.value ? "(You)" : ""}`;

//         if(user !== username.value) {
//             const btn = document.createElement("button");
//             btn.classList.add("call-btn");
//             btn.addEventListener("click", () => startCall(user));

//             const img = document.createElement("img");
//             img.src = "./images/phone.png";
//             img.width = 20;

//             btn.appendChild(img);
//             li.appendChild(btn);
//         }

//         allusersHtml.appendChild(li);
//     }
// });

// // endCallBtn.addEventListener("click", () => {
// //     socket.emit("end-call", caller);   // notify backend
// //     endCall();
// // });
// endCallBtn.addEventListener("click", () => {
//     if (currentCallUser) {
//         socket.emit("end-call", { to: currentCallUser });
//     }
//     endCall(false);
// });



// // Offer received
// // socket.on("offer", async ({ from, to, offer }) => {
// //     const pc = PeerConnection.getInstance();
// //     await pc.setRemoteDescription(offer);

// //     const answer = await pc.createAnswer();
// //     await pc.setLocalDescription(answer);

// //     socket.emit("answer", { from, to, answer: pc.localDescription });

// //     caller = [from, to];
// // });
// socket.on("offer", async ({ from, to, offer }) => {
//     const pc = PeerConnection.getInstance();
//     currentCallUser = from;

//     await pc.setRemoteDescription(offer);

//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     socket.emit("answer", { from, to, answer: pc.localDescription });
//     showCallUI();
// });


// // Answer received
// // socket.on("answer", async ({ from, to, answer }) => {
// //     const pc = PeerConnection.getInstance();
// //     await pc.setRemoteDescription(answer);

// //     endCallBtn.style.display = "block";
// //     caller = [from, to];
// // });

// socket.on("answer", async ({ from, to, answer }) => {
//     const pc = PeerConnection.getInstance();
//     await pc.setRemoteDescription(answer);

//     showCallUI();
// });


// // ICE candidate
// socket.on("icecandidate", async ({ candidate }) => {
//     const pc = PeerConnection.getInstance();
//     await pc.addIceCandidate(new RTCIceCandidate(candidate));
// });

// // End call
// socket.on("call-ended", () => {
//     console.log("Other user ended call");
  
//     // Same cleanup
//     if (peerConnection) {
//       peerConnection.close();
//       peerConnection = null;
//     }
  
//     localStream?.getTracks().forEach(t => t.stop());
//     remoteVideo.srcObject = null;
//     localVideo.srcObject = null;
  
//     hideCallUI();
//   });

//   function showCallUI() {
//     const endBtn = document.getElementById("end-call-btn");
//     endBtn.style.display = "block";
// }

// function hideCallUI() {
//     const endBtn = document.getElementById("end-call-btn");
//     endBtn.style.display = "none";

//     // Stop showing videos
//     const remoteVideo = document.getElementById("remoteVideo");
//     const localVideo = document.getElementById("localVideo");

//     remoteVideo.srcObject = null;
//     localVideo.srcObject = null;
// }

  


// socket.on("connect", () => {
//     console.log("Socket connected with id:", socket.id);
// });

// socket.on("connect_error", (err) => {
//     console.log("Socket connection error:", err);
// });

// // Initiate call
// const startCall = async (user) => {
//     const pc = PeerConnection.getInstance();
//     currentCallUser = user;   // store who we are calling
//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     socket.emit("offer", {
//         from: username.value,
//         to: user,
//         offer: pc.localDescription
//     });
// };

// socket.on("force-end-call", () => {
//     console.warn("Call forcefully ended by system (AI moderation).");
//     endCall(true);   // pass true to show warning message
// });


// // End call
// // const endCall = () => {
// //     const pc = PeerConnection.getInstance();
// //     if(pc) {
// //         pc.close();
// //         endCallBtn.style.display = 'none';
// //     }
// // };
// // const endCall = () => {
// //     const pc = PeerConnection.getInstance();

// //     if (pc) {
// //         pc.close();
// //     }

// //     PeerConnection.reset();

// //     remoteVideo.srcObject = null;

// //     endCallBtn.style.display = "none";

// //     console.log("Call ended and peer connection reset.");
// // };


// // function endCall() {
// //     // Inform other peer
// //     socket.emit("call-ended", { to: otherUserId });
  
// //     // Stop local camera/audio tracks
// //     localStream.getTracks().forEach(t => t.stop());
  
// //     // Remove video
// //     remoteVideo.srcObject = null;
// //     localVideo.srcObject = null;
  
// //     // Close RTCPeerConnection
// //     if (peerConnection) {
// //       peerConnection.close();
// //       peerConnection = null;
// //     }
  
// //     // Hide call UI
// //     hideCallUI();
// //   }

// function endCall(forced) {
//     console.log("Ending call...");

//     // Stop local camera & mic
//     if (localStream) {
//         localStream.getTracks().forEach(t => t.stop());
//     }

//     // Clear video
//     remoteVideo.srcObject = null;
//     localVideo.srcObject = null;

//     // Close peer connection
//     const pc = PeerConnection.getInstance();
//     if (pc) pc.close();

//     PeerConnection.reset();
//     currentCallUser = null;

//     // stop local stream only when call actually ends
//     if (forced) {
//         alert("Call ended automatically due to sharing personal information.");
//     }

//     hideCallUI();
// }

  


// let audioRecorder;

// // =========================
// //  START AUDIO STREAMING
// // =========================
// function startAudioStreaming(stream) {
//     try {
//         audioContext = new AudioContext({ sampleRate: 16000 });

//         const source = audioContext.createMediaStreamSource(stream);

//         processor = audioContext.createScriptProcessor(4096, 1, 1);

//         processor.onaudioprocess = (e) => {
//             const input = e.inputBuffer.getChannelData(0);
//             const pcm16 = convertFloatToInt16(input);
//             // socket.emit("audio-chunk", pcm16);
//         };

//         source.connect(processor);
//         processor.connect(audioContext.destination);

//         console.log("Audio streaming started using Web Audio API");
//     } catch (err) {
//         console.error("Audio streaming error:", err);
//     }
// }

// function convertFloatToInt16(float32Array) {
//     let int16Array = new Int16Array(float32Array.length);
//     for (let i = 0; i < float32Array.length; i++) {
//         let s = Math.max(-1, Math.min(1, float32Array[i]));
//         int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
//     }
//     return int16Array;
// }

// // async function startAudioStreaming(stream) {
// //     try {
// //         const audioContext = new AudioContext({
// //             sampleRate: 48000   // Ideal for transcription (Whisper, Google STT)
// //         });

// //         // Load audio worklet script
// //         await audioContext.audioWorklet.addModule("/audio-processor.js");

// //         const source = audioContext.createMediaStreamSource(stream);

// //         const workletNode = new AudioWorkletNode(audioContext, "audio-processor");

// //         // Receive raw PCM float32 audio
// //         workletNode.port.onmessage = (event) => {
// //             const float32Data = event.data;

// //             // Convert Float32Array → Int16Array (smaller size)
// //             const int16Data = floatTo16BitPCM(float32Data);

// //             // Send PCM chunk to backend
// //             socket.emit("audio-chunk", int16Data);
// //         };

// //         // Connect
// //         source.connect(workletNode).connect(audioContext.destination);

// //         console.log("Audio streaming started using AudioWorkletNode");

// //     } catch (error) {
// //         console.error("Audio Worklet error:", error);
// //     }
// // }

// // // Convert Float32 → 16-bit PCM before sending
// // function floatTo16BitPCM(float32Array) {
// //     let buffer = new Int16Array(float32Array.length);
// //     for (let i = 0; i < float32Array.length; i++) {
// //         let s = Math.max(-1, Math.min(1, float32Array[i]));
// //         buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
// //     }
// //     return buffer;
// // }



// // =========================
// //  START CAM + MIC
// // =========================
// async function startMyVideo() {
//     try {
//         localStream = await navigator.mediaDevices.getUserMedia({
//             audio: true,
//             video: true,
//         });

//         localVideo.srcObject = localStream;

//         // start audio streaming
//         startAudioStreaming(localStream);

//     } catch (err) {
//         console.error("Camera/Mic error:", err);
//     }
// }


// startMyVideo();




























// // ============================================
// // FIXED FRONTEND CODE - Aligned with Backend
// // ============================================

// const createUserBtn = document.getElementById("create-user");
// const username = document.getElementById("username");
// const allusersHtml = document.getElementById("allusers");
// const localVideo = document.getElementById("localVideo");
// const remoteVideo = document.getElementById("remoteVideo");
// const endCallBtn = document.getElementById("end-call-btn");

// // Socket connection
// const socket = io("https://webrtc-test.knot.dating", {
//     transports: ["websocket", "polling"]
// });

// // Global state
// let localStream = null;
// let peerConnection = null;
// let currentCallUser = null;
// let audioContext = null;
// let processor = null;
// let isInCall = false;

// // ============================================
// // PEER CONNECTION CONFIGURATION
// // ============================================
// const ICE_SERVERS = {
//     iceServers: [
//         { urls: "stun:stun.l.google.com:19302" },
//         {
//             urls: "turn:34.131.190.182:3478",
//             username: "webrtc_user",
//             credential: "webrtc_pass"
//         }
//     ]
// };

// /**
//  * Create RTCPeerConnection
//  */
// function createPeerConnection() {
//     console.log('📡 Creating peer connection...');
    
//     const pc = new RTCPeerConnection(ICE_SERVERS);

//     // Add local stream tracks
//     if (localStream) {
//         localStream.getTracks().forEach(track => {
//             pc.addTrack(track, localStream);
//             console.log(`➕ Added ${track.kind} track to peer connection`);
//         });
//     }

//     // Handle incoming tracks
//     pc.ontrack = (event) => {
//         console.log('📺 Received remote track:', event.track.kind);
//         remoteVideo.srcObject = event.streams[0];
//     };

//     // Handle ICE candidates
//     pc.onicecandidate = (event) => {
//         if (event.candidate) {
//             console.log('🧊 Sending ICE candidate');
//             socket.emit("icecandidate", {
//                 candidate: event.candidate,
//                 to: currentCallUser
//             });
//         }
//     };

//     // Handle connection state changes
//     pc.onconnectionstatechange = () => {
//         console.log('🔗 Connection state:', pc.connectionState);
        
//         if (pc.connectionState === 'disconnected' || 
//             pc.connectionState === 'failed' || 
//             pc.connectionState === 'closed') {
//             console.log('Connection lost, cleaning up...');
//             endCall(false);
//         }
//     };

//     return pc;
// }

// // ============================================
// // SOCKET EVENT HANDLERS
// // ============================================

// socket.on("connect", () => {
//     console.log("✅ Socket connected:", socket.id);
// });

// socket.on("connect_error", (err) => {
//     console.error("❌ Socket connection error:", err);
//     alert("Connection error. Please check your internet connection.");
// });

// socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected");
//     if (isInCall) {
//         endCall(false);
//     }
// });

// /**
//  * User joined - update user list
//  */
// socket.on("joined", (allusers) => {
//     console.log('👥 User list updated:', allusers);
//     updateUserList(allusers);
// });

// /**
//  * Incoming call offer
//  */
// socket.on("offer", async ({ from, to, offer }) => {
//     console.log(`📞 Incoming call from: ${from}`);
    
//     // Ask user to accept call
//     const accept = confirm(`Incoming call from ${from}. Accept?`);
    
//     if (!accept) {
//         console.log('📵 Call rejected');
//         socket.emit("end-call", { from: to, to: from });
//         return;
//     }

//     try {
//         currentCallUser = from;
//         isInCall = true;

//         // Create peer connection
//         peerConnection = createPeerConnection();

//         // Set remote description (offer)
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//         console.log('✅ Remote description (offer) set');

//         // Create answer
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         console.log('✅ Local description (answer) set');

//         // Send answer back
//         socket.emit("answer", {
//             from: to,
//             to: from,
//             answer: peerConnection.localDescription
//         });

//         // Start audio streaming ONLY AFTER answer
//         startAudioStreaming(localStream);

//         // Show call UI
//         showCallUI();
        
//         console.log('✅ Call accepted and answer sent');

//     } catch (error) {
//         console.error('❌ Error handling offer:', error);
//         alert('Failed to accept call: ' + error.message);
//         endCall(false);
//     }
// });

// /**
//  * Call answer received
//  */
// socket.on("answer", async ({ from, to, answer }) => {
//     console.log(`📞 Call answered by: ${from}`);

//     try {
//         if (!peerConnection) {
//             console.error('❌ No peer connection exists');
//             return;
//         }

//         // Set remote description (answer)
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//         console.log('✅ Remote description (answer) set');

//         // Start audio streaming ONLY AFTER answer
//         startAudioStreaming(localStream);

//         // Show call UI
//         showCallUI();
        
//         console.log('✅ Call connected');

//     } catch (error) {
//         console.error('❌ Error handling answer:', error);
//         alert('Failed to establish call: ' + error.message);
//         endCall(false);
//     }
// });

// /**
//  * ICE candidate received
//  */
// socket.on("icecandidate", async ({ candidate }) => {
//     console.log('🧊 Received ICE candidate');

//     try {
//         if (peerConnection && candidate) {
//             await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//             console.log('✅ ICE candidate added');
//         }
//     } catch (error) {
//         console.error('❌ Error adding ICE candidate:', error);
//     }
// });

// /**
//  * Call ended by other user
//  */
// socket.on("call-ended", () => {
//     console.log('📵 Call ended by other user');
//     endCall(false);
// });

// /**
//  * Call force-ended by AI moderation
//  */
// socket.on("force-end-call", ({ reason }) => {
//     console.warn('🚨 Call force-ended:', reason);
//     endCall(true, reason);
// });

// /**
//  * Transcription received (optional - for debugging)
//  */
// socket.on("transcription", ({ username: speaker, text, timestamp }) => {
//     console.log(`📝 [${speaker}]:`, text);
//     // You can display this in UI if needed
// });

// // ============================================
// // USER INTERFACE FUNCTIONS
// // ============================================

// /**
//  * Join as user
//  */
// createUserBtn.addEventListener("click", () => {
//     const user = username.value.trim();
    
//     if (user === "") {
//         alert("Please enter a username");
//         return;
//     }

//     console.log(`👤 Joining as: ${user}`);
//     socket.emit("join-user", user);
    
//     // Hide username input
//     const box = document.querySelector(".username-input");
//     box.style.display = 'none';
// });

// /**
//  * Update user list
//  */
// function updateUserList(allusers) {
//     allusersHtml.innerHTML = "";

//     for (const user of allusers) {   // <-- FIXED
//         const li = document.createElement("li");
//         const isCurrentUser = user === username.value;
        
//         li.textContent = `${user} ${isCurrentUser ? "(You)" : ""}`;

//         if (!isCurrentUser) {
//             const btn = document.createElement("button");
//             btn.classList.add("call-btn");
//             btn.addEventListener("click", () => startCall(user));

//             const img = document.createElement("img");
//             img.src = "./images/phone.png";
//             img.width = 20;

//             btn.appendChild(img);
//             li.appendChild(btn);
//         }

//         allusersHtml.appendChild(li);
//     }
// }

// /**
//  * Start call
//  */
// async function startCall(user) {
//     if (isInCall) {
//         alert("You are already in a call");
//         return;
//     }

//     console.log(`📞 Starting call with: ${user}`);

//     try {
//         currentCallUser = user;
//         isInCall = true;

//         // Create peer connection
//         peerConnection = createPeerConnection();

//         // Create offer
//         const offer = await peerConnection.createOffer();
//         await peerConnection.setLocalDescription(offer);
//         console.log('✅ Local description (offer) set');

//         // Send offer
//         socket.emit("offer", {
//             from: username.value,
//             to: user,
//             offer: peerConnection.localDescription
//         });

//         console.log('✅ Offer sent');

//     } catch (error) {
//         console.error('❌ Error starting call:', error);
//         alert('Failed to start call: ' + error.message);
//         endCall(false);
//     }
// }

// /**
//  * End call button
//  */
// endCallBtn.addEventListener("click", () => {
//     console.log('📵 User clicked end call');
    
//     if (currentCallUser) {
//         socket.emit("end-call", {
//             from: username.value,
//             to: currentCallUser
//         });
//     }
    
//     endCall(false);
// });

// /**
//  * End call function
//  */
// function endCall(forced = false, reason = null) {
//     console.log('📵 Ending call...', forced ? '(Forced)' : '(Normal)');

//     // Stop audio streaming
//     stopAudioStreaming();

//     // Close peer connection
//     if (peerConnection) {
//         peerConnection.close();
//         peerConnection = null;
//         console.log('✅ Peer connection closed');
//     }

//     // Clear remote video
//     if (remoteVideo) {
//         remoteVideo.srcObject = null;
//     }

//     // Reset state
//     currentCallUser = null;
//     isInCall = false;

//     // Hide call UI
//     hideCallUI();

//     // Show alert if force-ended
//     if (forced) {
//         const message = reason || "Call ended due to policy violation";
//         alert(`⚠️ ${message}`);
//     }

//     console.log('✅ Call ended');
// }

// /**
//  * Show call UI
//  */
// function showCallUI() {
//     endCallBtn.style.display = "block";
//     console.log('✅ Call UI shown');
// }

// /**
//  * Hide call UI
//  */
// function hideCallUI() {
//     endCallBtn.style.display = "none";
//     console.log('✅ Call UI hidden');
// }

// // ============================================
// // AUDIO STREAMING FOR TRANSCRIPTION
// // ============================================

// /**
//  * Start streaming audio to backend for transcription
//  * CRITICAL: Only call this AFTER the call is connected (after answer)
//  */
// function startAudioStreaming(stream) {
//     if (!stream) {
//         console.error('❌ No stream available for audio streaming');
//         return;
//     }

//     // Stop existing audio streaming if any
//     stopAudioStreaming();

//     try {
//         console.log('🎤 Starting audio streaming for transcription...');

//         // Create audio context
//         audioContext = new AudioContext({ sampleRate: 16000 });

//         // Create media stream source
//         const source = audioContext.createMediaStreamSource(stream);

//         // Create script processor (4096 buffer size, 1 input channel, 1 output channel)
//         processor = audioContext.createScriptProcessor(4096, 1, 1);

//         // Process audio
//         processor.onaudioprocess = (e) => {
//             const input = e.inputBuffer.getChannelData(0);
//             const pcm16 = convertFloatToInt16(input);
            
//             // Send to backend
//             socket.emit("audio-chunk", pcm16);
//         };

//         // Connect nodes
//         source.connect(processor);
//         processor.connect(audioContext.destination);

//         console.log('✅ Audio streaming started (16kHz, 16-bit PCM)');

//     } catch (error) {
//         console.error('❌ Audio streaming error:', error);
//     }
// }

// /**
//  * Stop audio streaming
//  */
// function stopAudioStreaming() {
//     if (processor) {
//         processor.disconnect();
//         processor = null;
//         console.log('⏹️ Audio processor stopped');
//     }

//     if (audioContext) {
//         audioContext.close();
//         audioContext = null;
//         console.log('⏹️ Audio context closed');
//     }
// }

// // /**
// //  * Convert Float32Array to Int16Array (PCM 16-bit)
// //  */
// // function convertFloatToInt16(float32Array) {
// //     const int16Array = new Int16Array(float32Array.length);
    
// //     for (let i = 0; i < float32Array.length; i++) {
// //         // Clamp value between -1 and 1
// //         const s = Math.max(-1, Math.min(1, float32Array[i]));
// //         // Convert to 16-bit integer
// //         int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
// //     }
    
// //     return int16Array;
// // }
// /**
//  * Convert Float32Array to Int16 PCM Buffer (16-bit little-endian)
//  */
// function convertFloatToInt16(float32Array) {
//     const buffer = new ArrayBuffer(float32Array.length * 2); // 2 bytes per sample
//     const view = new DataView(buffer);

//     for (let i = 0; i < float32Array.length; i++) {
//         let s = Math.max(-1, Math.min(1, float32Array[i]));
//         view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // little-endian
//     }

//     return buffer; // return ArrayBuffer ready to send via socket
// }


// // ============================================
// // INITIALIZE CAMERA AND MICROPHONE
// // ============================================

// /**
//  * Start local video and audio
//  */
// async function startMyVideo() {
//     try {
//         console.log('🎥 Requesting camera and microphone access...');

//         localStream = await navigator.mediaDevices.getUserMedia({
//             audio: {
//                 echoCancellation: true,
//                 noiseSuppression: true,
//                 autoGainControl: true,
//                 sampleRate: 16000  // Match audio context sample rate
//             },
//             video: {
//                 width: { ideal: 1280 },
//                 height: { ideal: 720 },
//                 facingMode: "user"
//             }
//         });

//         // Display local video
//         localVideo.srcObject = localStream;

//         console.log('✅ Camera and microphone started');
//         console.log('   Audio tracks:', localStream.getAudioTracks().length);
//         console.log('   Video tracks:', localStream.getVideoTracks().length);

//         // DO NOT START AUDIO STREAMING HERE
//         // Audio streaming starts only when call connects (after answer)

//     } catch (error) {
//         console.error('❌ Camera/Microphone error:', error);
//         alert('Failed to access camera/microphone. Please grant permissions and refresh.');
//     }
// }

// // ============================================
// // CLEANUP ON PAGE UNLOAD
// // ============================================

// window.addEventListener('beforeunload', () => {
//     if (isInCall) {
//         socket.emit("end-call", {
//             from: username.value,
//             to: currentCallUser
//         });
//     }

//     stopAudioStreaming();

//     if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//     }

//     if (peerConnection) {
//         peerConnection.close();
//     }
// });

// // ============================================
// // START APPLICATION
// // ============================================

// // Initialize camera and microphone on page load
// startMyVideo();

// console.log('🚀 Application initialized');

// // ============================================
// // FLOW SUMMARY
// // ============================================
// /**
//  * CORRECT FLOW:
//  * 
//  * 1. Page loads → startMyVideo() → Camera/Mic access granted
//  *    - localStream created
//  *    - localVideo displays camera
//  *    - ❌ Audio streaming NOT started yet
//  * 
//  * 2. User enters username → Click "Create" → emit('join-user')
//  *    - Server stores user
//  *    - Receives user list
//  * 
//  * 3. User A clicks call on User B → startCall()
//  *    - Create peer connection
//  *    - Create offer
//  *    - emit('offer', { from: A, to: B, offer })
//  *    - ❌ Audio streaming NOT started yet
//  * 
//  * 4. User B receives offer → socket.on('offer')
//  *    - User prompted to accept/reject
//  *    - If accepted:
//  *      - Create peer connection
//  *      - Set remote description (offer)
//  *      - Create answer
//  *      - Set local description (answer)
//  *      - emit('answer', { from: B, to: A, answer })
//  *      - ✅ START AUDIO STREAMING for User B
//  * 
//  * 5. User A receives answer → socket.on('answer')
//  *    - Set remote description (answer)
//  *    - ✅ START AUDIO STREAMING for User A
//  * 
//  * 6. ICE candidates exchanged
//  *    - Connection established
//  * 
//  * 7. Audio flows:
//  *    - User A speaks → audio-chunk → Backend → Google STT → Transcription
//  *    - User B speaks → audio-chunk → Backend → Google STT → Transcription
//  * 
//  * 8. AI moderation checks transcriptions
//  *    - If personal info detected → socket.on('force-end-call')
//  *    - Both users disconnected
//  * 
//  * 9. Normal end:
//  *    - User clicks end call → emit('end-call')
//  *    - Stop audio streaming
//  *    - Close peer connection
//  *    - Clear videos
//  * 
//  * KEY POINTS:
//  * - ✅ Audio streaming starts AFTER answer (when call is connected)
//  * - ✅ Each user has their own audio stream to backend
//  * - ✅ Backend has separate Google STT stream per user
//  * - ✅ AI moderation tracks who said what
//  * - ✅ Force end affects both users
//  */