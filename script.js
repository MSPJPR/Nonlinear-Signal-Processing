document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('audioInput').addEventListener('change', handleAudioUpload);
document.getElementById('downloadImage').addEventListener('click', downloadFilteredImage);
document.getElementById('downloadAudio').addEventListener('click', downloadFilteredAudio);
document.getElementById('startRecording').addEventListener('click', startRecording);
document.getElementById('stopRecording').addEventListener('click', stopRecording);

let mediaRecorder;
let audioChunks = [];

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.getElementById('imageCanvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function applyAdaptiveMedianFilter() {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const median = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = median;
        data[i + 1] = median;
        data[i + 2] = median;
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyRankOrderFilter() {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const rank = (data[i] * 0.3 + data[i + 1] * 0.6 + data[i + 2] * 0.1);
        data[i] = rank;
        data[i + 1] = rank;
        data[i + 2] = rank;
    }

    ctx.putImageData(imageData, 0, 0);
}

function downloadFilteredImage() {
    const canvas = document.getElementById('imageCanvas');
    const link = document.createElement('a');
    link.download = 'filtered_image.png';
    link.href = canvas.toDataURL();
    link.click();
}

function applyWebcamFilter() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('webcamCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);
    }, 100);
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            document.getElementById('webcam').srcObject = stream;
        });
}

function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        document.getElementById('audioPlayer').src = url;
    }
}

function applyAdaptiveWienerFilter() {
    const audio = document.getElementById('audioPlayer');
    audio.volume = 0.8;
}

function applyDecisionDirectedFilter() {
    const audio = document.getElementById('audioPlayer');
    audio.playbackRate = 1.1;
}

function downloadFilteredAudio() {
    const audio = document.getElementById('audioPlayer');
    const link = document.createElement('a');
    link.download = 'filtered_audio.wav';
    link.href = audio.src;
    link.click();
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('recordedAudio').src = audioUrl;
                audioChunks = [];
            };

            document.getElementById('startRecording').disabled = true;
            document.getElementById('stopRecording').disabled = false;
        });
}

function stopRecording() {
    mediaRecorder.stop();
    document.getElementById('startRecording').disabled = false;
    document.getElementById('stopRecording').disabled = true;
}
