-- 001_create_sentiment_analyses_table.sql
-- 사용자의 감성 분석 요청과 결과를 저장하는 테이블입니다.

CREATE TABLE IF NOT EXISTS sentiment_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text TEXT NOT NULL,                         -- 사용자가 입력한 원문
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')), -- AI 분석 결과 (영문)
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('긍정', '부정', '중립')), -- AI 분석 결과 (한글)
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),       -- AI 신뢰도 (0~100)
  reason TEXT NOT NULL,                             -- AI가 분석한 구체적인 이유
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()    -- 분석 일시
);

-- 성능 최적화를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS sentiment_analyses_created_at_idx ON sentiment_analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS sentiment_analyses_sentiment_idx ON sentiment_analyses (sentiment);

-- 주석 추가 (관리 용이성)
COMMENT ON TABLE sentiment_analyses IS 'AI 감성 분석 이력 데이터';
COMMENT ON COLUMN sentiment_analyses.input_text IS '분석 대상 텍스트';
COMMENT ON COLUMN sentiment_analyses.sentiment IS '감성 분류 (영문)';
COMMENT ON COLUMN sentiment_analyses.sentiment_label IS '감성 분류 (한글)';
COMMENT ON COLUMN sentiment_analyses.confidence IS 'AI 분석 신뢰도';
COMMENT ON COLUMN sentiment_analyses.reason IS 'AI 분석 사유';
