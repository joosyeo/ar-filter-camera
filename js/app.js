const video = document.getElementById('webcam');
const canvas = document.getElementById('arCanvas');
const ctx = canvas.getContext('2d');

const filterSelect = document.getElementById('filterSelect');
const cameraSelect = document.getElementById('cameraSelect');
const bgmInput = document.getElementById('bgmInput');
const recordBtn = document.getElementById('recordBtn');

let faceLandmarker;
let runningMode = "VIDEO";
let currentFacingMode = "user";
let chosenFilter = "sunglasses";

let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

let audioContext;
let bgmSource;
let audioDestination;

// Initialize MediaPipe Face Landmarker
async function initMediaPipe() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: runningMode,
        numFaces: 1
    });
    startCamera();
}

async function startCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    const constraints = {
        video: { facingMode: currentFacingMode, width: 640, height: 480 },
        audio: true
    };
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            requestAnimationFrame(renderLoop);
        });
    } catch (err) {
        alert("카메라 권한을 확인해주세요!");
        console.error(err);
    }
}

let lastVideoTime = -1;
async function renderLoop() {
    ctx.save();
    if (currentFacingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();
        const results = faceLandmarker.detectForVideo(video, startTimeMs);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            if (chosenFilter === "sunglasses") {
                const p1 = landmarks[33];
                const p2 = landmarks[263];
                
                const x1 = p1.x * canvas.width;
                const y1 = p1.y * canvas.height;
                const x2 = p2.x * canvas.width;
                const y2 = p2.y * canvas.height;

                if (currentFacingMode === "user") {
                    drawSunglasses(canvas.width - x1, y1, canvas.width - x2, y2);
                } else {
                    drawSunglasses(x1, y1, x2, y2);
                }
            } 
            else if (chosenFilter === "blush") {
                const leftCheek = landmarks[425];
                const rightCheek = landmarks[205];
                const faceCenter = landmarks[4];
                const faceTop = landmarks[10];
                
                const r = Math.abs(faceTop.y - faceCenter.y) * canvas.height * 0.25;

                if (currentFacingMode === "user") {
                    drawBlush(canvas.width - leftCheek.x * canvas.width, leftCheek.y * canvas.height, r);
                    drawBlush(canvas.width - rightCheek.x * canvas.width, rightCheek.y * canvas.height, r);
                } else {
                    drawBlush(leftCheek.x * canvas.width, leftCheek.y * canvas.height, r);
                    drawBlush(rightCheek.x * canvas.width, rightCheek.y * canvas.height, r);
                }
            } 
            else if (chosenFilter === "neonHair") {
                const headTop = landmarks[10];
                const nose = landmarks[4];
                
                const hx = headTop.x * canvas.width;
                const hy = headTop.y * canvas.height;
                const size = Math.abs(headTop.y - nose.y) * canvas.height * 1.5;

                if (currentFacingMode === "user") {
                    drawNeonHair(canvas.width - hx, hy, size);
                } else {
                    drawNeonHair(hx, hy, size);
                }
            }
        }
    }
    requestAnimationFrame(renderLoop);
}

// Filter Drawing Functions
function drawSunglasses(x1, y1, x2, y2) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const w = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(angle);
    
    // Sunglasses frame
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.roundRect(-w * 0.9, -w * 0.3, w * 1.8, w * 0.6, w * 0.2);
    ctx.fill();
    
    // Left and right lens shine effect
    ctx.fillStyle = "#333";
    ctx.fillRect(-w * 0.75, -w * 0.2, w * 0.6, w * 0.4);
    ctx.fillRect(w * 0.15, -w * 0.2, w * 0.6, w * 0.4);
    
    // TikTok style white diagonal glare lines
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-w*0.6, -w*0.1);
    ctx.lineTo(-w*0.3, w*0.1);
    ctx.moveTo(w*0.3, -w*0.1);
    ctx.lineTo(w*0.6, w*0.1);
    ctx.stroke();

    ctx.restore();
}

function drawBlush(cx, cy, r) {
    ctx.save();
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    gradient.addColorStop(0, "rgba(255, 105, 180, 0.6)");
    gradient.addColorStop(1, "rgba(255, 105, 180, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawNeonHair(hx, hy, size) {
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#00ffff";
    ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.moveTo(hx - size * 0.6, hy);
    ctx.bezierCurveTo(hx - size * 0.8, hy - size, hx - size * 0.2, hy - size * 1.2, hx, hy - size * 1.5);
    ctx.bezierCurveTo(hx + size * 0.2, hy - size * 1.2, hx + size * 0.8, hy - size, hx + size * 0.6, hy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Recording System
recordBtn.addEventListener('click', () => {
    if (!isRecording) startRecording();
    else stopRecording();
});

async function startRecording() {
    recordedChunks = [];
    const videoStream = canvas.captureStream(30);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioDestination = audioContext.createMediaStreamDestination();
    
    if (video.srcObject && video.srcObject.getAudioTracks().length > 0) {
        const micSource = audioContext.createMediaStreamSource(video.srcObject);
        micSource.connect(audioDestination);
    }
    
    if (bgmInput.files.length > 0) {
        const file = bgmInput.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        bgmSource = audioContext.createBufferSource();
        bgmSource.buffer = audioBuffer;
        bgmSource.connect(audioDestination);
        bgmSource.connect(audioContext.destination);
        bgmSource.start(0);
    }
    
    const combinedStream = new MediaStream();
    combinedStream.addTrack(videoStream.getVideoTracks()[0]);
    if (audioDestination.stream.getAudioTracks().length > 0) {
        combinedStream.addTrack(audioDestination.stream.getAudioTracks()[0]);
    }
    
    mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = videoUrl;
        downloadLink.download = 'my_ar_filter_video.mp4';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        if (bgmSource) bgmSource.stop();
    };
    mediaRecorder.start();
    isRecording = true;
    recordBtn.innerText = '⏹️ 촬영 종료 및 자동저장';
    recordBtn.classList.add('recording');
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.innerText = '🔴 촬영 시작';
    recordBtn.classList.remove('recording');
}

// Event Listeners
filterSelect.addEventListener('change', (e) => {
    chosenFilter = e.target.value;
});

cameraSelect.addEventListener('change', (e) => {
    currentFacingMode = e.target.value;
    startCamera();
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', initMediaPipe);
