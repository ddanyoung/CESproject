// function changeModelImage(clickedImage) {
//     var imageName = clickedImage.src.split('/').pop().split('_')[1].split('.')[0];

//     // 모델 이미지 변경
//     var imgModel = document.querySelector('.img-model');
//     imgModel.style.transition = 'background-image 0.5s ease-in-out';
    
//     change_img = `url('../static/assets/img/${imageName}.png')`;
//     imgModel.style.backgroundImage = change_img;

//     // 버튼 이미지 변경
//     clickedImage.src = `../static/assets/img/cloth_${imageName}_hover.jpg`

//     // 트랜지션 효과를 적용하고 나서 삭제
//     setTimeout(() => {
//         imgModel.style.transition = '';
//     }, 600);
// };

function changeModel(modelName, element) {
    // 토글 버튼
    const buttons = document.querySelectorAll('.model-btn');
    
    buttons.forEach(button => {
        if (button === element) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // 모델 이미지 바꾸기
    var imgModel = document.querySelector('.img-model');
    imgModel.style.transition = 'background-image 0.5s ease-in-out';

    change_img = `url('../static/assets/img/model_${modelName}.png')`;
    imgModel.style.backgroundImage = change_img;

    // 트랜지션 효과를 적용하고 나서 삭제
    setTimeout(() => {
        imgModel.style.transition = '';
    }, 600);

    // 버튼 이미지 바꾸기
    const btn_img = document.querySelectorAll('.cloth-img');

    for (let i = 1; i <= 3; i++) {
        btn_img[i - 1].src = `../static/assets/img/cloth_${modelName}${i}.jpg`;
    }
}


const radioButtons = document.querySelectorAll('input[type="radio"]');
let currentCheckedRadio = null;

radioButtons.forEach(function(radioButton) {
    radioButton.addEventListener('change', function() {
        const labelFor = this.getAttribute('id');
        const label = document.querySelector(`label[for="${labelFor}"]`);
        const img = label.querySelector('img');
        var imageName = img.src.split('/').pop().split('_')[1].split('.')[0];

        if (this.checked) {
            if (currentCheckedRadio !== null) {
                const prevLabel = document.querySelector(`label[for="${currentCheckedRadio.getAttribute('id')}"]`);
                const prevImg = prevLabel.querySelector('img');
                var prevImageName = prevImg.src.split('/').pop().split('_')[1].split('.')[0];
                prevImg.src = `../static/assets/img/cloth_${prevImageName}.jpg`;
            }

            var imgModel = document.querySelector('.img-model');
            imgModel.style.transition = 'background-image 0.5s ease-in-out';

            change_img = `url('../static/assets/img/${imageName}.png')`;
            imgModel.style.backgroundImage = change_img;

            img.src = `../static/assets/img/cloth_${imageName}_hover.jpg`;
            currentCheckedRadio = this;
        } else {
            img.src = `../static/assets/img/cloth_${imageName}.jpg`;
        }
    });
});
