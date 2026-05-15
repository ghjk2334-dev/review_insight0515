/**
 * SENTIMENT M - 프론트엔드 핵심 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM 요소 선택
  const textarea = document.querySelector("#sentimentText");
  const analyzeButton = document.querySelector("#analyzeButton");
  const errorMessage = document.querySelector("#errorMessage");

  const modalBackdrop = document.querySelector("#resultModalBackdrop");
  const modalConfirmButton = document.querySelector("#modalConfirmButton");

  const sentimentBadge = document.querySelector("#sentimentBadge");
  const resultConfidence = document.querySelector("#resultConfidence");
  const confidenceBarFill = document.querySelector("#confidenceBarFill");
  const resultReason = document.querySelector("#resultReason");

  // 감성별 텍스트 및 클래스 매핑
  const sentimentMap = {
    positive: { label: '긍정', class: 'sentiment-positive' },
    negative: { label: '부정', class: 'sentiment-negative' },
    neutral: { label: '중립', class: 'sentiment-neutral' }
  };

  // 2. 분석 버튼 클릭 이벤트
  analyzeButton.addEventListener('click', async () => {
    const text = textarea.value.trim();

    // 입력값 검증
    if (!text) {
      showError("분석할 텍스트를 입력해주세요.");
      return;
    }

    if (text.length > 1000) {
      showError("텍스트는 최대 1,000자까지 입력할 수 있습니다.");
      return;
    }

    // 로딩 상태 시작
    setLoading(true);
    hideError();

    try {
      // API 요청
      const data = await analyzeSentiment(text);
      
      // 결과 표시 (모달)
      showResult(data);
    } catch (error) {
      console.error(error);
      showError(error.message || "서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      // 로딩 상태 종료
      setLoading(false);
    }
  });

  // 3. API 요청 함수
  async function analyzeSentiment(text) {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "감성 분석 중 문제가 발생했습니다.");
    }

    return result.data;
  }

  // 4. 결과 표시 (모달) 함수
  function showResult(data) {
    const { sentiment, confidence, reason } = data;
    const config = sentimentMap[sentiment] || sentimentMap.neutral;

    // 데이터 바인딩
    sentimentBadge.textContent = config.label;
    sentimentBadge.className = `sentiment-badge ${config.class}`;
    
    resultConfidence.textContent = `${confidence}%`;
    resultReason.textContent = reason;

    // 모달 활성화
    modalBackdrop.classList.add('active');

    // 신뢰도 바 애니메이션 (모달이 나타난 후 약간의 지연 후 실행)
    setTimeout(() => {
      confidenceBarFill.style.width = `${confidence}%`;
    }, 100);
  }

  // 5. 유틸리티 함수들
  function setLoading(isLoading) {
    if (isLoading) {
      analyzeButton.disabled = true;
      analyzeButton.textContent = "분석 중...";
    } else {
      analyzeButton.disabled = false;
      analyzeButton.textContent = "감성 분석";
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    textarea.style.borderColor = "#c82014";
  }

  function hideError() {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
    textarea.style.borderColor = "#dcdcdc";
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    // 바 너비 초기화
    setTimeout(() => {
      confidenceBarFill.style.width = '0%';
    }, 300);
  }

  // 6. 모달 닫기 이벤트들
  modalConfirmButton.addEventListener('click', closeModal);

  // 배경 클릭 시 닫기
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // ESC 키 입력 시 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });
});
