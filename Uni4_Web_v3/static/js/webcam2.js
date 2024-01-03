const cameraSelect = document.getElementById('cameraSelect');
const videoOn = document.getElementById('toggle');

const webcam = document.getElementById('webcam');
const media_cam = document.getElementById('media_cam');
const webcamcanvas = document.getElementById('webcamCanvas')

const videoElement = document.getElementById("target_video");
const canvasElement = document.getElementById("target_outputCanvas");

// const scoreElement = document.getElementById("score");
const scoreBox = document.querySelector('.score-box');
const animatable = document.getElementById("animatable");
const scoreTermValue = document.getElementById("scoreTermValue");
let animateTimeout;


// 웹캠 목록을 가져오고 선택 목록을 채우는 함수
async function getWebcamList(){
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    videoDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${cameraSelect.length + 1}`;
        cameraSelect.appendChild(option);
    });
}
getWebcamList();

// 웹캠 켜고 끄기
let cameraRunning = false;

videoOn.addEventListener('change', function () {
    if (this.checked) {
        startCamera();
    } else {
        stopCamera();
    }
});

function startCamera() {
    if (!cameraRunning) {
      webcamcanvas.style.display = "block";
        var stream = null;
        const selectedCameraId = cameraSelect.value;
        
        // 웹캠 열기
        navigator.mediaDevices.getUserMedia({ video: {deviceId: selectedCameraId} })
        .then(function (cameraStream) {
            stream = cameraStream;
            webcam.srcObject = cameraStream;
            camera.start();
        });
    cameraRunning = true;
    // animatable.style.display = "block";
    // scoreTermValue.style.animation = "fontAnimation 0.5s linear 2";
    }
}

function stopCamera() {
    if(cameraRunning){
      // 웹캠1 끄기
      const stream = webcam.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcam.srcObject = null;

      // 웹캠2 끄기
      const stream2 = media_cam.srcObject;
      const tracks2 = stream2.getTracks();
      tracks2.forEach(tracks2 => tracks2.stop());
      media_cam.srcObject = null;

      // canvas 숨기기
      webcamcanvas.style.display = "none";
      user_landmarks = null;
      scoreElement.textContent = "0";
      cameraRunning = false;
      animatable.style.display = "none";
      clearTimeout(animateTimeout);
      // clearInterval(intervalId);
    }
}

// 스타트 버튼 누를때 동작
let countdownValue = 3;

function startCountdown() {
  document.getElementById('startDialogBtn').style.display = 'none';
  document.getElementById('countdown').style.display = 'block';
  // totalscore.style.display = 'none';
  let countdown = setInterval(function() {
    countdownValue--;
    document.getElementById('countdown').textContent = countdownValue;
    if (countdownValue <= 0) {
      clearInterval(countdown);
      document.getElementById('startDialog').style.display = 'none';
      animatable.style.display = "block";
      document.getElementById('target_video').play();
    }
  }, 1000);
  scoreTermValue.style.animation = "fontAnimation 0.5s linear 2";
  setInterval(() => {
    updateScoreAndAnimate();
    resetDictionary();
  }, 1000);
  // document.getElementById("firework").style.display = "block";
}

// 재생이 끝났을 때 이벤트 리스너 추가
videoElement.addEventListener("ended", function() {
  // 해당 요소 가져오기
  var startDialog = document.getElementById("startDialog");
  var startDialogBtn = document.getElementById("startDialogBtn");
  var countdown = document.getElementById("countdown");
  var restartDialogBtn = document.getElementById("restartDialogBtn");
  var resulttDialogBtn = document.getElementById("resulttDialogBtn");
  
  // 기존 스타일 유지하면서 display 속성 추가
  startDialog.style.display = "flex";
  startDialogBtn.style.display = "none";
  countdown.style.display = "none";
  restartDialogBtn.style.display = "block";
  resulttDialogBtn.style.display = "block";

  // 점수 애니메이션 없애기
  animatable.style.display = "none";
  clearTimeout(animateTimeout);
  // totalscore.style.display = "block";
  // clearInterval(intervalId);
});

// 리스타트 함수
function restartVideo() {
  var video = document.getElementById("target_video");
  video.currentTime = 0; // 동영상을 처음으로 되감기
  video.play(); // 동영상 재생
  document.getElementById("startDialog").style.display = "none";
  animatable.style.display = "block";
  // totalscore.style.display = 'none';
  setInterval(() => {
    updateScoreAndAnimate();
    resetDictionary();
  }, 1000);
}



// 포즈 정보 저장
let target_landmarks = null;
let user_landmarks = null;

let landmarkDict = {
    'target' : [],
    'user' : []
};



// 사용자 포즈 검출
const camera = new Camera(media_cam, {
  onFrame: async () => {
    await user_pose.send({ image: webcam });
  },
});

const user_pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
  });

  user_pose.setOptions({
    upperBodyOnly: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  user_pose.onResults((user_results) => {
    webcamcanvas.width = webcam.width;
    webcamcanvas.height = webcam.height;
    const canvasCtx_user = webcamcanvas.getContext("2d");
    canvasCtx_user.save();
    canvasCtx_user.clearRect(0, 0, webcam.width, webcam.height);
    canvasCtx_user.drawImage(user_results.image, 0, 0, webcam.width, webcam.height);
    const user_landmarks = user_results.poseLandmarks;
    landmarkDict['user'].push(user_landmarks);
    if (user_results.poseLandmarks) {
      // 관절 연결
      drawConnectors(canvasCtx_user, user_landmarks, POSE_CONNECTIONS, {
        color: 'white',
        lineWidth: 5,
      });

      // 왼쪽 관절 주황색
      drawLandmarks(canvasCtx_user, Object.values(POSE_LANDMARKS_LEFT).map(index=>user_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(255,138,0)',
      })

      // 오른쪽 관절 파란색
      drawLandmarks(canvasCtx_user, Object.values(POSE_LANDMARKS_RIGHT).map(index=>user_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(0,217,231)',
      })
    }
    canvasCtx_user.restore();
  });


// target 포즈 검출
async function processVideo() {
    await pose.send({ image: videoElement });
    requestAnimationFrame(processVideo);
}

// Pose Detection 모델 호출
const pose = new Pose({
    locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
});

// Pose Detection 설정
pose.setOptions({
    upperBodyOnly: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

// Pose Detection 콜백 함수 설정
pose.onResults((results) => {
    canvasElement.width = videoElement.width;
    canvasElement.height = videoElement.height;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoElement.width, videoElement.height);
    canvasCtx.drawImage(results.image, 0, 0, videoElement.width, videoElement.height);
    if (results.poseLandmarks) {
    const landmarks = results.poseLandmarks;
    landmarkDict['target'].push(landmarks);
    }
    canvasCtx.restore();
});
processVideo();

// 점수 계산


// 딕셔너리 초기화 함수
function resetDictionary() {
  landmarkDict = {
      'target': [],
      'user': []
  };
}

function minMaxNormalization(data, newMin = 0, newMax = 1) {
  const numCols = data[0].length; // 열의 수

  for (let col = 0; col < numCols; col++) {
    const column = data.map(row => row[col]); // 열 데이터 추출
    const min = Math.min(...column); // 열의 최소값
    const max = Math.max(...column); // 열의 최대값

    for (let i = 0; i < data.length; i++) {
      data[i][col] = newMin + ((data[i][col] - min) * (newMax - newMin)) / (max - min);
    }
  }

  return data;
}

function euclideanDistance(target, user) {
  let squaredSum = 0;
  for (let i = 0; i < target.length; i++) {
      squaredSum += Math.pow(target[i] - user[i], 2);
  }
  return Math.sqrt(squaredSum);
}

function calculateSimilarity(dis_x, dis_y, dis_z) {
  const meanDistance = (dis_x + dis_y + dis_z) / 3;
  const similarity = 1 / (1 + meanDistance);
  return similarity;
}

function getScore() {
  const sim = [];
  if (landmarkDict['target'].length !== 0 && landmarkDict['user'].length !== 0 && landmarkDict['target'].length === landmarkDict['user'].length){
      for (let i = 0; i < landmarkDict['target'].length; i++) {
          const target_lm = landmarkDict['target'][i].map((j) => [j.x, j.y, j.z]);
          const user_lm = landmarkDict['user'][i].map((j) => [j.x, j.y, j.z]);

          const target_norm = minMaxNormalization(target_lm);
          const user_norm = minMaxNormalization(user_lm);

          const dis_x = euclideanDistance(target_norm.map(point => point[0]), user_norm.map(point => point[0]));
          const dis_y = euclideanDistance(target_norm.map(point => point[1]), user_norm.map(point => point[1]));
          const dis_z = euclideanDistance(target_norm.map(point => point[2]), user_norm.map(point => point[2]));

          const similarity = calculateSimilarity(dis_x, dis_y, dis_z);
          sim.push(similarity);
      }
  } else if (landmarkDict['target'].length !== landmarkDict['user'].length){
      const minLength = Math.min(landmarkDict['target'].length, landmarkDict['user'].length);

      for (let i = 0; i < minLength; i++) {
        const target_lm = landmarkDict['target'][i].map((j) => [j.x, j.y, j.z]);
        const user_lm = landmarkDict['user'][i].map((j) => [j.x, j.y, j.z]);

        const target_norm = minMaxNormalization(target_lm);
        const user_norm = minMaxNormalization(user_lm);

        const dis_x = euclideanDistance(target_norm.map(point => point[0]), user_norm.map(point => point[0]));
        const dis_y = euclideanDistance(target_norm.map(point => point[1]), user_norm.map(point => point[1]));
        const dis_z = euclideanDistance(target_norm.map(point => point[2]), user_norm.map(point => point[2]));

        const similarity = calculateSimilarity(dis_x, dis_y, dis_z);
        sim.push(similarity);
      }
  }
  return sim;
}

// score 강조 효과
animatable.autoPlay = true;
animatable.animation = "bounceIn";
function updateScoreAndAnimate() {
  animatable.play();
  // 점수 계산 및 표시
  s = getScore();
  const sum = s.reduce((acc, curr) => acc + curr, 0);
  const average = Math.ceil(sum / s.length * 100);
  if (!isNaN(average)) {
    scoreTermValue.textContent = average;
  } else {
    scoreTermValue.textContent = 0;
  }

  let color = "white";
  if (average >=90){
    color = "#f05164";
  } else if (average >= 80){
    color = "#ff9100";
  } else if (average >= 70){
    color = "#ffdd57";
  } else if (average >= 60){
    color = "#52b79a";
  }

  scoreTermValue.style.color = color;
  scoreBox.style.setProperty('--bubble-color', color);

  if (average >= 60) {
    if (!scoreBox.classList.contains("animate")) {
      addAnimateClass();
    } else {
      clearTimeout(animateTimeout);
      addAnimateClass();
    }
  }
}

function addAnimateClass() {
  scoreBox.classList.add("animate");
  setTimeout(() => {
    scoreBox.classList.remove("animate");
  }, 500);
}