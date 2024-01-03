const animatable = document.getElementById("animatable");
const scoreElement = document.getElementById("scoreTermValue");

const videoElement = document.getElementById("target_video");
const canvasElement = document.getElementById("target_outputCanvas");
const Uservideo = document.getElementById("user_video");
const Usercanvas = document.getElementById("user_outputCanvas");

// 시작버튼 동작
const startbtn = document.getElementById("startDialogBtn");
startbtn.addEventListener("click", function(){
    videoElement.play();
    Uservideo.play();
    document.getElementById("startDialog").style.display = "none";
});


// 영상 관절 추출
async function processVideo() {
    await pose.send({ image: videoElement });
    await user_pose.send({ image: Uservideo });
    requestAnimationFrame(processVideo);
}

// Pose Detection 모델 호출
const pose = new Pose({
    locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    },
});

const user_pose = new Pose({
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

user_pose.setOptions({
    upperBodyOnly: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

// Pose Detection 콜백 함수 설정
let target_landmarks = null;
let user_landmarks = null;

let landmarkDict = {
    'target' : [],
    'user' : []
};


pose.onResults((results) => {
    canvasElement.width = videoElement.width;
    canvasElement.height = videoElement.height;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoElement.width, videoElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, videoElement.width, videoElement.height);
    if (results.poseLandmarks) {
        target_landmarks = results.poseLandmarks;
        landmarkDict['target'].push(target_landmarks);
        // 관절 연결
        drawConnectors(canvasCtx, target_landmarks, POSE_CONNECTIONS, {
        color: 'white',
        lineWidth: 5,
        });

        // 왼쪽 관절 주황색
        drawLandmarks(canvasCtx, Object.values(POSE_LANDMARKS_LEFT).map(index=>target_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(255,138,0)',
        })

        // 오른쪽 관절 파란색
        drawLandmarks(canvasCtx, Object.values(POSE_LANDMARKS_RIGHT).map(index=>target_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(0,217,231)',
        })
    }
    canvasCtx.restore();
});

user_pose.onResults((user_results) => {
    Usercanvas.width = videoElement.width;
    Usercanvas.height = videoElement.height;
    const user_canvasCtx = Usercanvas.getContext("2d");
    user_canvasCtx.save();
    user_canvasCtx.clearRect(0, 0, videoElement.width, videoElement.height);
    user_canvasCtx.drawImage(
        user_results.image, 0, 0, videoElement.width, videoElement.height);
    if (user_results.poseLandmarks) {
        user_landmarks = user_results.poseLandmarks;
        landmarkDict['user'].push(user_landmarks);
        // 관절 연결
        drawConnectors(user_canvasCtx, user_landmarks, POSE_CONNECTIONS, {
        color: 'white',
        lineWidth: 5,
        });

        // 왼쪽 관절 주황색
        drawLandmarks(user_canvasCtx, Object.values(POSE_LANDMARKS_LEFT).map(index=>user_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(255,138,0)',
        })

        // 오른쪽 관절 파란색
        drawLandmarks(user_canvasCtx, Object.values(POSE_LANDMARKS_RIGHT).map(index=>user_landmarks[index]),{
        color:'white', 
        fillColor: 'rgb(0,217,231)',
        })
    }
    user_canvasCtx.restore();
});
processVideo();



animatable.autoPlay = true;
animatable.animation = "bounceIn";
// 유사도 계산
setInterval(() => {
    s = getScore();
    const sum = s.reduce((acc, curr) => acc + curr, 0);
    const average = Math.ceil(sum / s.length * 100);

    if (!isNaN(average)) {
        scoreElement.textContent = average;
    } else {
        scoreElement.textContent = 0;
    }
    animatable.play();
    resetDictionary();
}, 1000);

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
        // console.log("다름!");
    }
    return sim;
}

