function changeVideo(element) {
    // 토글 버튼
    const buttons = document.querySelectorAll('.mp-video-btn');
    
    buttons.forEach(button => {
        if (button === element) {
            button.classList.add('active');
            var name = button.src.split('/').pop().split('.')[0];

            var video = document.querySelector('.mp-video');
            var source = video.querySelector('source');

            source.src = `../static/assets/dance/${name}.mp4`;
            video.load(); // 비디오 다시 로드

        } else {
            button.classList.remove('active');
        }
    });
}

function changemodel(element) {
    // 토글 버튼
    const buttons = document.querySelectorAll('.mp-img');
    
    buttons.forEach(button => {
        if (button === element) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function sendActiveButtonInfo(){
    var activeModel = document.querySelector('.mp-img.active');
    var activeVideo = document.querySelector('.mp-video-btn.active');

    var modelInfo = activeModel.src.split('/').pop().split('_')[1].split('.')[0];
    var videoInfo = activeVideo.src.split('/').pop().split('.')[0];

    console.log(modelInfo);
    console.log(videoInfo);

    // 모델 정보와 비디오 정보를 객체로 묶어 서버로 전송
    var buttonInfo = {
        modelInfo: modelInfo,
        videoInfo: videoInfo
    };

    // 데이터를 로컬 스토리지에 저장
    localStorage.setItem('buttonInfo', JSON.stringify(buttonInfo));

    // 다른 페이지로 이동
    window.location.href = '/motion_deepfake/result';
}