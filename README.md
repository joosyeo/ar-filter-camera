# 나만의 멀티 AR 필터 카메라 🎬

AI 기반 실시간 AR 필터 카메라 애플리케이션으로, Google MediaPipe의 얼굴 인식 기술을 활용하여 다양한 필터 효과를 제공합니다.

## 🎨 주요 기능

### 필터 효과
- **🕶️ 스웨그 선글라스** - 틱톡 스타일의 세련된 선글라스 이펙트
- **🌸 뽀샤시 볼터치** - 부드러운 그라데이션 핑크 볼터치 효과
- **🔥 사이버 네온 가발** - 네온 광원이 있는 미래형 가발 이펙트

### 카메라 제어
- 📷 **전면/후면 카메라 전환** - 자유로운 카메라 선택
- 🎥 **실시간 필터 적용** - 지연 없는 부드러운 렌더링

### 멀티미디어 녹화
- 🔴 **비디오 녹화** - Canvas 기반 고품질 녹화
- 🎵 **배경음악 추가** - 음악 파일을 선택하여 함께 녹화
- 📥 **자동 다운로드** - 촬영 완료 시 MP4 파일 자동 저장

## 🛠️ 기술 스택

- **언어**: HTML5, CSS3, JavaScript (ES6+)
- **AI 엔진**: Google MediaPipe Face Landmarker
- **API**: 
  - Canvas 2D Context (필터 렌더링)
  - WebRTC getUserMedia (카메라 접근)
  - Web Audio API (음성/음악 믹싱)
  - MediaRecorder API (비디오 녹화)

## 📁 프로젝트 구조

```
ar-filter-camera/
├── index.html          메인 페이지 (HTML 구조)
├── css/
│   └── style.css       스타일 및 반응형 디자인
├── js/
│   └── app.js          핵심 로직 (필터, 카메라, 녹화)
├── README.md           프로젝트 문서
└── .gitignore          Git 무시 파일
```

## 🚀 시작하기

### 요구사항
- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 카메라 권한 허용
- 마이크 권한 허용 (선택사항)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/joosyeo/ar-filter-camera.git
cd ar-filter-camera
```

2. **로컬 서버 실행**
   - Python 3:
   ```bash
   python -m http.server 8000
   ```
   - 또는 Node.js (http-server):
   ```bash
   npx http-server
   ```

3. **브라우저에서 열기**
```
http://localhost:8000
```

## 💻 사용 방법

1. **필터 선택** - 드롭다운에서 원하는 필터 선택
2. **카메라 선택** - 전면 또는 후면 카메라 선택
3. **음악 추가** (선택) - 🎵 버튼으로 배경음악 파일 선택
4. **촬영 시작** - 🔴 버튼을 클릭하여 녹화 시작
5. **촬영 종료** - ⏹️ 버튼을 클릭하면 자동으로 다운로드

## 🎯 핵심 코드 구조

### 필터 렌더링 파이프라인
```javascript
renderLoop() {
  - Canvas에 비디오 프레임 그리기
  - MediaPipe로 얼굴 랜드마크 감지
  - 감지된 위치에 필터 이펙트 적용
  - 다음 프레임 요청
}
```

### MediaPipe 통합
- **Face Landmarker**: 468개의 3D 얼굴 특징점 감지
- **주요 인덱스**:
  - 33: 왼쪽 눈
  - 263: 오른쪽 눈
  - 425: 왼쪽 볼
  - 205: 오른쪽 볼
  - 10: 이마 끝
  - 4: 코 끝

## 🌐 브라우저 호환성

| 브라우저 | 지원 |
|---------|------|
| Chrome  | ✅ |
| Firefox | ✅ |
| Safari  | ✅ |
| Edge    | ✅ |
| IE      | ❌ |

## ⚙️ 설정 및 커스터마이징

### 필터 추가 방법
1. `js/app.js`의 `renderLoop()` 함수에 조건 추가
2. 새로운 `drawYourFilter()` 함수 작성
3. `index.html`의 select 옵션에 추가

### 성능 최적화
- 렌더링 해상도 조정: `canvas.width`, `canvas.height`
- MediaPipe 모델 선택: GPU vs CPU delegate
- 프레임 레이트 조정: `captureStream(fps)`

## 🐛 알려진 제한사항

- WebRTC 카메라는 HTTPS 또는 localhost에서만 작동
- 오래된 브라우저에서는 MediaPipe 지원 불가
- 일부 브라우저에서 음성 녹음 권한 필요

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

버그 리포트, 기능 제안, Pull Request를 환영합니다!

## 📧 연락처

문제가 있거나 질문이 있으시면 GitHub Issues를 통해 보고해주세요.

---

**Made with ❤️ by joosyeo**
