/**
 * Supabase 클라이언트 설정
 * 서버 사이드에서 데이터베이스와 통신하기 위한 설정을 담고 있습니다.
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// 환경변수 로드
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Supabase URL 또는 Service Role Key가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

// Supabase 클라이언트 인스턴스 생성
// 서버 환경에서만 사용되므로 Service Role Key를 사용하여 RLS를 우회할 수 있습니다.
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
