import os

from flask import Flask, render_template, request, session, redirect
app = Flask(__name__)
app.secret_key = 'Uni4'


# 홈
@app.route('/')
def index():
    return render_template('home.html')

# 춤채점
@app.route('/dance_scoring')
def dance_scoring():
    video_dir = './static/assets/dance/album'
    video_cover = os.listdir(video_dir)
    return render_template('dance_scoring.html', video_cover=video_cover)

@app.route('/dance_scoring/rec', methods=['GET', 'POST'])
def dance_scoring_rec():
    album_file = request.args.get('video', '')
    video_file = album_file.split('.')[0] + '.mp4'
    session['video_file'] = video_file
    return render_template('dance_scoring_rec.html', video_file=video_file, album_file = album_file)

@app.route('/dance_scoring/demo', methods=['GET', 'POST'])
def dance_scoring_demo():
    album_file = request.args.get('video', '')
    video_file = album_file.split('.')[0] + '.mp4'
    session['video_file'] = video_file
    return render_template('dance_scoring_demo.html', video_file=video_file, album_file = album_file)

# 의상 체인지
@app.route('/cloth_change')
def cloth_change():
    return render_template('cloth_change.html')

# 모션딥페이크
@app.route('/motion_deepfake')
def motion_deepfake():
    return render_template('motion_deepfake.html')

@app.route('/button_clicked', methods=['POST'])
def handle_button_click():
    if request.method == 'POST':
        button_info = request.json.get('buttonInfo')  # 클라이언트에서 전송된 버튼 정보

        # 예시: 모델 정보와 비디오 정보에 접근하여 활용
        model_info = button_info.get('modelInfo')
        video_info = button_info.get('videoInfo')

        # 여기서 원하는 작업 수행
        # 예를 들어, 다른 라우트로 이동하거나 데이터를 이용하여 템플릿 렌더링 등을 수행할 수 있습니다.
        return render_template('motion_deepfake_result.html', model_info=model_info, video_info=video_info)

@app.route('/motion_deepfake/result')
def motion_deepfake_result():
    return render_template('motion_deepfake_result.html')