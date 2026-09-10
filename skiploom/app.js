import "./styles.css";

const $ = (selector) => document.querySelector(selector);

const elements = {
  setupView: $("#setupView"),
  recordingView: $("#recordingView"),
  resultView: $("#resultView"),
  startButton: $("#startButton"),
  pauseButton: $("#pauseButton"),
  stopButton: $("#stopButton"),
  newButton: $("#newButton"),
  downloadButton: $("#downloadButton"),
  shareButton: $("#shareButton"),
  micToggle: $("#micToggle"),
  cameraToggle: $("#cameraToggle"),
  permissionNote: $("#permissionNote"),
  screenPreview: $("#screenPreview"),
  cameraPreview: $("#cameraPreview"),
  resultVideo: $("#resultVideo"),
  recordingTitle: $("#recordingTitle"),
  recordingLabel: $("#recorderLabel"),
  recordingState: $("#recordingState"),
  timer: $("#timer"),
  countdown: $("#countdown"),
  canvas: $("#recordingCanvas"),
};

let displayStream;
let userStream;
let outputStream;
let mediaRecorder;
let audioContext;
let animationFrame;
let timerInterval;
let recordingBlob;
let recordingUrl;
let chunks = [];
let elapsedSeconds = 0;
let isPaused = false;

function supportsRecording() {
  return Boolean(
    navigator.mediaDevices?.getDisplayMedia &&
    window.MediaRecorder &&
    HTMLCanvasElement.prototype.captureStream,
  );
}

function setView(view) {
  elements.setupView.hidden = view !== "setup";
  elements.recordingView.hidden = view !== "recording";
  elements.resultView.hidden = view !== "result";
  elements.recordingLabel.textContent =
    view === "setup" ? "NEW RECORDING" : view === "recording" ? "LIVE CAPTURE" : "YOUR RECORDING";
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function selectMimeType() {
  const options = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return options.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function runCountdown() {
  elements.countdown.hidden = false;
  for (let value = 3; value > 0; value -= 1) {
    const span = document.createElement("span");
    span.textContent = value;
    elements.countdown.replaceChildren(span);
    await new Promise((resolve) => setTimeout(resolve, 760));
  }
  elements.countdown.hidden = true;
}

async function getUserMedia() {
  if (!elements.micToggle.checked && !elements.cameraToggle.checked) return null;

  return navigator.mediaDevices.getUserMedia({
    audio: elements.micToggle.checked
      ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      : false,
    video: elements.cameraToggle.checked
      ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
      : false,
  });
}

function connectAudio(stream, destination) {
  if (!stream?.getAudioTracks().length) return;
  const source = audioContext.createMediaStreamSource(
    new MediaStream(stream.getAudioTracks()),
  );
  const gain = audioContext.createGain();
  gain.gain.value = 1;
  source.connect(gain).connect(destination);
}

async function createOutputStream() {
  const screenTrack = displayStream.getVideoTracks()[0];
  const settings = screenTrack.getSettings();
  const width = settings.width || 1920;
  const height = settings.height || 1080;
  const context = elements.canvas.getContext("2d", { alpha: false });

  elements.canvas.width = width;
  elements.canvas.height = height;

  const draw = () => {
    context.fillStyle = "#161814";
    context.fillRect(0, 0, width, height);
    context.drawImage(elements.screenPreview, 0, 0, width, height);

    if (elements.cameraToggle.checked && elements.cameraPreview.readyState >= 2) {
      const bubbleSize = Math.round(Math.min(width, height) * 0.19);
      const inset = Math.round(bubbleSize * 0.22);
      const x = width - bubbleSize - inset;
      const y = height - bubbleSize - inset;

      context.save();
      context.beginPath();
      context.arc(x + bubbleSize / 2, y + bubbleSize / 2, bubbleSize / 2, 0, Math.PI * 2);
      context.clip();
      context.translate(x + bubbleSize, y);
      context.scale(-1, 1);
      context.drawImage(elements.cameraPreview, 0, 0, bubbleSize, bubbleSize);
      context.restore();

      context.beginPath();
      context.arc(
        x + bubbleSize / 2,
        y + bubbleSize / 2,
        bubbleSize / 2 - 3,
        0,
        Math.PI * 2,
      );
      context.lineWidth = Math.max(5, Math.round(bubbleSize * 0.025));
      context.strokeStyle = "#ffffff";
      context.stroke();
    }

    animationFrame = requestAnimationFrame(draw);
  };
  draw();

  const canvasStream = elements.canvas.captureStream(30);
  audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  connectAudio(displayStream, destination);
  connectAudio(userStream, destination);

  return new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...destination.stream.getAudioTracks(),
  ]);
}

function startTimer() {
  elapsedSeconds = 0;
  elements.timer.textContent = formatTime(elapsedSeconds);
  timerInterval = window.setInterval(() => {
    if (!isPaused) {
      elapsedSeconds += 1;
      elements.timer.textContent = formatTime(elapsedSeconds);
    }
  }, 1000);
}

async function startRecording() {
  elements.startButton.disabled = true;
  elements.permissionNote.classList.remove("error");
  elements.permissionNote.textContent = "Waiting for your browser…";

  try {
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 30, max: 60 } },
      audio: true,
    });

    try {
      userStream = await getUserMedia();
    } catch (error) {
      if (error.name === "NotAllowedError") {
        elements.micToggle.checked = false;
        elements.cameraToggle.checked = false;
        userStream = null;
      } else {
        throw error;
      }
    }

    elements.screenPreview.srcObject = displayStream;
    await elements.screenPreview.play();

    if (userStream?.getVideoTracks().length) {
      elements.cameraPreview.hidden = false;
      elements.cameraPreview.srcObject = userStream;
      await elements.cameraPreview.play();
    } else {
      elements.cameraPreview.hidden = true;
    }

    outputStream = await createOutputStream();
    chunks = [];
    const mimeType = selectMimeType();
    mediaRecorder = new MediaRecorder(outputStream, {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: 6_000_000,
    });

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    mediaRecorder.addEventListener("stop", showResult, { once: true });
    displayStream.getVideoTracks()[0].addEventListener("ended", stopRecording, { once: true });

    setView("recording");
    await runCountdown();
    mediaRecorder.start(1000);
    isPaused = false;
    startTimer();
  } catch (error) {
    stopTracks();
    setView("setup");
    elements.permissionNote.classList.add("error");
    elements.permissionNote.textContent =
      error.name === "NotAllowedError"
        ? "Screen access was cancelled. Try again when you’re ready."
        : `Couldn’t start recording: ${error.message}`;
  } finally {
    elements.startButton.disabled = false;
  }
}

function togglePause() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;

  if (mediaRecorder.state === "recording") {
    mediaRecorder.pause();
    isPaused = true;
    elements.recordingState.textContent = "PAUSED";
    elements.pauseButton.innerHTML = '<span class="play-icon"></span>';
    elements.pauseButton.setAttribute("aria-label", "Resume recording");
  } else if (mediaRecorder.state === "paused") {
    mediaRecorder.resume();
    isPaused = false;
    elements.recordingState.textContent = "RECORDING";
    elements.pauseButton.innerHTML = '<span class="pause-icon"></span>';
    elements.pauseButton.setAttribute("aria-label", "Pause recording");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}

function stopTracks() {
  clearInterval(timerInterval);
  cancelAnimationFrame(animationFrame);
  [displayStream, userStream, outputStream].forEach((stream) => {
    stream?.getTracks().forEach((track) => track.stop());
  });
  if (audioContext && audioContext.state !== "closed") audioContext.close();
  elements.screenPreview.srcObject = null;
  elements.cameraPreview.srcObject = null;
}

function showResult() {
  stopTracks();
  recordingBlob = new Blob(chunks, { type: mediaRecorder.mimeType || "video/webm" });
  if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  recordingUrl = URL.createObjectURL(recordingBlob);
  elements.resultVideo.src = recordingUrl;
  elements.recordingTitle.value = `Skiploom — ${new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
  setView("result");
}

function safeFilename() {
  const title = elements.recordingTitle.value.trim() || "skiploom-recording";
  return `${title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase()}.webm`;
}

function downloadRecording() {
  if (!recordingUrl) return;
  const link = document.createElement("a");
  link.href = recordingUrl;
  link.download = safeFilename();
  link.click();
}

async function shareRecording() {
  if (!recordingBlob) return;
  const file = new File([recordingBlob], safeFilename(), { type: recordingBlob.type });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: elements.recordingTitle.value,
        text: "Recorded with Skiploom",
        files: [file],
      });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  elements.shareButton.textContent = "Use download instead";
  setTimeout(() => {
    elements.shareButton.textContent = "Share file";
  }, 2200);
}

function resetRecorder() {
  elements.resultVideo.pause();
  elements.resultVideo.removeAttribute("src");
  elements.resultVideo.load();
  if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  recordingUrl = null;
  recordingBlob = null;
  chunks = [];
  elements.permissionNote.classList.remove("error");
  elements.permissionNote.textContent = "You’ll choose what to share in the next window.";
  elements.pauseButton.innerHTML = '<span class="pause-icon"></span>';
  elements.recordingState.textContent = "RECORDING";
  setView("setup");
}

elements.startButton.addEventListener("click", startRecording);
elements.pauseButton.addEventListener("click", togglePause);
elements.stopButton.addEventListener("click", stopRecording);
elements.newButton.addEventListener("click", resetRecorder);
elements.downloadButton.addEventListener("click", downloadRecording);
elements.shareButton.addEventListener("click", shareRecording);

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    if (!elements.setupView.hidden) startRecording();
    else if (!elements.recordingView.hidden) stopRecording();
  }
});

if (!supportsRecording()) {
  elements.startButton.disabled = true;
  elements.permissionNote.classList.add("error");
  elements.permissionNote.textContent = "Screen recording needs a current desktop browser.";
}
