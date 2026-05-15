/**
 * 로컬 개발 및 테스트를 위한 익스프레스 서버
 * Vercel 서버리스 함수를 로컬에서 시뮬레이션합니다.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const analyzeHandler = require('./api/analyze');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 미들웨어 설정
app.use(cors());
app.use(express.json());

// 2. 정적 파일 서비스 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// 3. API 라우트 연결
app.post('/api/analyze', analyzeHandler);

// 4. 서버 실행
app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log(`🚀 SENTIMENT M 서버가 시작되었습니다!`);
  console.log(`🔗 접속 주소: http://localhost:${PORT}`);
  console.log('----------------------------------------------------');
  console.log('💡 테스트 전 .env 파일에 API 키를 설정했는지 확인하세요.');
});
