/**
 * 감성 분석 API (Vercel 서버리스 함수)
 * OpenAI를 통해 텍스트를 분석하고 결과를 Supabase에 저장합니다.
 */
const { OpenAI } = require('openai');
const supabase = require('../lib/supabase');
const dotenv = require('dotenv');

dotenv.config();

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 한글 라벨 매핑 테이블
const sentimentLabelMap = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립',
};

module.exports = async (req, res) => {
  // 1. POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '허용되지 않는 메서드입니다.' });
  }

  const { text } = req.body;

  // 2. 입력값 검증
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: '분석할 텍스트를 입력해주세요.' });
  }

  if (text.length > 1000) {
    return res.status(400).json({ success: false, message: '텍스트는 최대 1,000자까지 입력할 수 있습니다.' });
  }

  try {
    // 3. OpenAI API 호출 (감성 분석 요청)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // 혹은 "gpt-3.5-turbo" 사용 가능
      messages: [
        {
          role: "system",
          content: `당신은 한국어 텍스트의 감성을 분석하는 정밀한 AI 전문가입니다.
입력된 문장을 'positive', 'negative', 'neutral' 중 하나로 정확히 분류하세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 설명은 생략하세요.
confidence는 0에서 100 사이의 정수로 분석의 신뢰도를 나타냅니다.
reason은 해당 감성으로 분석한 구체적인 이유를 한국어 2~3문장으로 정중하게 설명하세요.`
        },
        {
          role: "user",
          content: `다음 텍스트의 감성을 분석하세요: "${text}"\n\n응답 형식:\n{\n  "sentiment": "positive | negative | neutral",\n  "confidence": 0-100,\n  "reason": "..."\n}`
        }
      ],
      response_format: { type: "json_object" } // JSON 모드 강제
    });

    // 4. AI 응답 파싱
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    const { sentiment, confidence, reason } = aiResponse;
    const sentimentLabel = sentimentLabelMap[sentiment] || '알 수 없음';

    // 5. Supabase에 분석 결과 저장
    // 분석 성공 여부가 사용자 경험을 방해하지 않도록 에러 처리를 분리합니다.
    const { error: dbError } = await supabase
      .from('sentiment_analyses')
      .insert([
        {
          input_text: text,
          sentiment: sentiment,
          sentiment_label: sentimentLabel,
          confidence: confidence,
          reason: reason
        }
      ]);

    if (dbError) {
      console.error('❌ Supabase 저장 실패:', dbError.message);
      // 저장에 실패하더라도 사용자에게는 결과를 반환합니다 (서버 로그만 남김)
    }

    // 6. 최종 성공 응답 반환
    return res.status(200).json({
      success: true,
      data: {
        sentiment,
        sentimentLabel,
        confidence,
        reason
      }
    });

  } catch (error) {
    console.error('❌ API 오류 발생:', error);
    
    // 에러 타입에 따른 메시지 처리
    let message = '감성 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    if (error.status === 401) message = 'OpenAI API 키가 올바르지 않습니다.';
    
    return res.status(500).json({
      success: false,
      message: message
    });
  }
};
