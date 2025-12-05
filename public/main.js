const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");

// IMPORTANT: CONNECT TO REMOTE NESTJS SERVER
// const socket = io("http://34.131.190.182:3000", {
//     transports: ["websocket", "polling"], // always include polling first
//   });
  
//   const socket = io("https://34.102.240.255:3000", {
//     transports: ["websocket", "polling"], // always include polling first
//   });

//   const socket = io("https://webrtc-test.knot.dating", {
//     transports: ["websocket", "polling"], // always include polling first
//   });

  const socket = io("https://webrtc-test.knot.dating", {
    transports: ["websocket", "polling"]
});


let localStream
let caller = [];

// Peer connection wrapper
const PeerConnection = (function(){
    let peerConnection;

    const createPeerConnection = () => {
        // const config = {
        //     iceServers: [
        //         { urls: 'stun:stun.l.google.com:19302' },
        //     ]
        // };

        const config = {
            iceServers: [
              // Public STUN
              { urls: 'stun:stun.l.google.com:19302' },
          
              // Your TURN server
              {
                urls: 'turn:34.131.190.182:3478',
                username: 'webrtc_user',
                credential: 'webrtc_pass'
              }
            ]
          };

        peerConnection = new RTCPeerConnection(config);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = function(event) {
            remoteVideo.srcObject = event.streams[0];
        };

        peerConnection.onicecandidate = function(event) {
            if(event.candidate) {
                socket.emit("icecandidate", { candidate: event.candidate, by: username.value });
            }
        };

        return peerConnection;
    };

    return {
        getInstance: () => {
            if(!peerConnection) {
                peerConnection = createPeerConnection();
            }
            return peerConnection;
        }
    };
})();

// Join user
createUserBtn.addEventListener("click", () => {
    console.log("Emitting join-user for:", username.value, "  -> ", socket.id);
    if(username.value !== "") {
        const box = document.querySelector(".username-input");
        socket.emit("join-user", username.value);
        box.style.display = 'none';
    }
});

// User list
socket.on("joined", allusers => {
    allusersHtml.innerHTML = "";

    for(const user in allusers) {
        const li = document.createElement("li");
        li.textContent = `${user} ${user === username.value ? "(You)" : ""}`;

        if(user !== username.value) {
            const btn = document.createElement("button");
            btn.classList.add("call-btn");
            btn.addEventListener("click", () => startCall(user));

            const img = document.createElement("img");
            img.src = "./images/phone.png";
            img.width = 20;

            btn.appendChild(img);
            li.appendChild(btn);
        }

        allusersHtml.appendChild(li);
    }
});

// Offer received
socket.on("offer", async ({ from, to, offer }) => {
    const pc = PeerConnection.getInstance();
    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", { from, to, answer: pc.localDescription });

    caller = [from, to];
});

// Answer received
socket.on("answer", async ({ from, to, answer }) => {
    const pc = PeerConnection.getInstance();
    await pc.setRemoteDescription(answer);

    endCallBtn.style.display = "block";
    caller = [from, to];
});

// ICE candidate
socket.on("icecandidate", async ({ candidate }) => {
    const pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

// End call
socket.on("call-ended", () => endCall());


socket.on("connect", () => {
    console.log("Socket connected with id:", socket.id);
});

socket.on("connect_error", (err) => {
    console.log("Socket connection error:", err);
});

// Initiate call
const startCall = async (user) => {
    const pc = PeerConnection.getInstance();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", {
        from: username.value,
        to: user,
        offer: pc.localDescription
    });
};

// End call
const endCall = () => {
    const pc = PeerConnection.getInstance();
    if(pc) {
        pc.close();
        endCallBtn.style.display = 'none';
    }
};

let audioRecorder;

// =========================
//  START AUDIO STREAMING
// =========================
function startAudioStreaming(stream) {
    try {
        audioContext = new AudioContext({ sampleRate: 16000 });

        const source = audioContext.createMediaStreamSource(stream);

        processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const pcm16 = convertFloatToInt16(input);
            socket.emit("audio-chunk", pcm16);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        console.log("Audio streaming started using Web Audio API");
    } catch (err) {
        console.error("Audio streaming error:", err);
    }
}

function convertFloatToInt16(float32Array) {
    let int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
}

// async function startAudioStreaming(stream) {
//     try {
//         const audioContext = new AudioContext({
//             sampleRate: 48000   // Ideal for transcription (Whisper, Google STT)
//         });

//         // Load audio worklet script
//         await audioContext.audioWorklet.addModule("/audio-processor.js");

//         const source = audioContext.createMediaStreamSource(stream);

//         const workletNode = new AudioWorkletNode(audioContext, "audio-processor");

//         // Receive raw PCM float32 audio
//         workletNode.port.onmessage = (event) => {
//             const float32Data = event.data;

//             // Convert Float32Array → Int16Array (smaller size)
//             const int16Data = floatTo16BitPCM(float32Data);

//             // Send PCM chunk to backend
//             socket.emit("audio-chunk", int16Data);
//         };

//         // Connect
//         source.connect(workletNode).connect(audioContext.destination);

//         console.log("Audio streaming started using AudioWorkletNode");

//     } catch (error) {
//         console.error("Audio Worklet error:", error);
//     }
// }

// // Convert Float32 → 16-bit PCM before sending
// function floatTo16BitPCM(float32Array) {
//     let buffer = new Int16Array(float32Array.length);
//     for (let i = 0; i < float32Array.length; i++) {
//         let s = Math.max(-1, Math.min(1, float32Array[i]));
//         buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
//     }
//     return buffer;
// }



// =========================
//  START CAM + MIC
// =========================
async function startMyVideo() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        localVideo.srcObject = localStream;

        // start audio streaming
        startAudioStreaming(localStream);

    } catch (err) {
        console.error("Camera/Mic error:", err);
    }
}


startMyVideo();
