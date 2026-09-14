export const getReadingStrategies = (gradeLevel: string, category: string) => {
  const isElementary = gradeLevel.includes('초등');
  const isMiddle = gradeLevel.includes('중학');
  const isHigh = gradeLevel.includes('고등');

  if (isElementary) {
    if (category.includes('문학') || category.includes('동화') || category.includes('이야기')) {
      return [
        { id: 'elem_lit_1', text: '누가, 언제, 어디서 무엇을 했는지 찾기' },
        { id: 'elem_lit_2', text: '주인공의 기분이나 마음이 어떨지 상상하기' },
        { id: 'elem_lit_3', text: '모르는 낱말의 뜻을 앞뒤 문장으로 짐작하기' },
        { id: 'elem_lit_4', text: '이야기의 순서(처음, 가운데, 끝) 생각하며 읽기' }
      ];
    } else {
      return [
        { id: 'elem_info_1', text: '글의 제목을 보고 내용 예상하기' },
        { id: 'elem_info_2', text: '문단마다 가장 중요한 문장(중심 문장) 찾기' },
        { id: 'elem_info_3', text: '새롭게 알게 된 사실이나 정보 밑줄 치기' },
        { id: 'elem_info_4', text: '글쓴이가 하고 싶은 말이 무엇인지 생각하기' }
      ];
    }
  }

  if (isMiddle) {
    if (category.includes('문학') || category.includes('소설') || category.includes('시')) {
      return [
        { id: 'mid_lit_1', text: '화자/서술자의 상황과 정서 파악하기' },
        { id: 'mid_lit_2', text: '인물 간의 관계와 갈등 양상 확인하기' },
        { id: 'mid_lit_3', text: '시간적/공간적 배경의 의미와 역할 이해하기' },
        { id: 'mid_lit_4', text: '비유, 상징 등 표현상의 특징 찾기' }
      ];
    } else if (category.includes('사회') || category.includes('역사')) {
      return [
        { id: 'mid_soc_1', text: '사회적 현상이나 역사적 사건의 원인 파악하기' },
        { id: 'mid_soc_2', text: '주요 개념의 정의와 특징 확인하기' },
        { id: 'mid_soc_3', text: '글쓴이의 관점이나 주장에 대한 근거 찾기' },
        { id: 'mid_soc_4', text: '도표나 그래프가 설명하는 내용 연결하기' }
      ];
    } else if (category.includes('과학') || category.includes('기술')) {
      return [
        { id: 'mid_sci_1', text: '과학적 원리나 기술의 개념 이해하기' },
        { id: 'mid_sci_2', text: '과정이나 단계(Step 1→2→3) 순서대로 파악하기' },
        { id: 'mid_sci_3', text: '실험이나 관찰의 목적과 결과 연결하기' },
        { id: 'mid_sci_4', text: '원인과 결과, 비례/반비례 관계 파악하기' }
      ];
    } else {
      return [
        { id: 'mid_def_1', text: '글의 화제(무엇에 대해 쓰는가?) 파악하기' },
        { id: 'mid_def_2', text: '문단별 중심 내용 요약하며 읽기' },
        { id: 'mid_def_3', text: '글쓴이의 주장이나 핵심 정보 파악하기' },
        { id: 'mid_def_4', text: '주장을 뒷받침하는 근거와 사례 확인하기' }
      ];
    }
  }

  // High School (Default to High School if not Elementary or Middle)
  if (category.includes('인문') || category.includes('철학') || category.includes('윤리')) {
    return [
      { id: 'hum_1', text: '핵심 개념과 학자의 관점 파악하기' },
      { id: 'hum_2', text: '대립되는 두 관점(A vs B)의 차이점 비교하기' },
      { id: 'hum_3', text: '시대적 배경이나 사상의 흐름 이해하기' },
      { id: 'hum_4', text: '구체적 사례에 학자의 관점 적용해보기' }
    ];
  }
  if (category.includes('사회') || category.includes('경제') || category.includes('법') || category.includes('정치')) {
    return [
      { id: 'soc_1', text: '사회적 현상이나 문제의 원인 파악하기' },
      { id: 'soc_2', text: '법률적/경제적 개념의 정의와 조건 확인하기' },
      { id: 'soc_3', text: '제시된 원리(예: 수요-공급)의 인과 관계 파악하기' },
      { id: 'soc_4', text: '예외 상황이나 한계점 체크하기' }
    ];
  }
  if (category.includes('과학') || category.includes('물리') || category.includes('생명') || category.includes('지구') || category.includes('화학')) {
    return [
      { id: 'sci_1', text: '자연 현상의 원리나 과학적 개념 이해하기' },
      { id: 'sci_2', text: '과정이나 단계(Step 1→2→3) 순서대로 파악하기' },
      { id: 'sci_3', text: '비례/반비례 등 변인 간의 상관관계 파악하기' },
      { id: 'sci_4', text: '도표나 그래프로 변환될 수 있는 정보 주의해서 읽기' }
    ];
  }
  if (category.includes('기술') || category.includes('공학') || category.includes('데이터')) {
    return [
      { id: 'tech_1', text: '핵심 기술이나 장치의 목적 파악하기' },
      { id: 'tech_2', text: '장치의 구성 요소와 각 요소의 기능 매칭하기' },
      { id: 'tech_3', text: '작동 원리와 시스템의 메커니즘 이해하기' },
      { id: 'tech_4', text: '기술의 장단점 및 한계점 파악하기' }
    ];
  }
  if (category.includes('예술') || category.includes('미술') || category.includes('음악') || category.includes('건축')) {
    return [
      { id: 'art_1', text: '예술 사조나 작가의 독창적 특징 파악하기' },
      { id: 'art_2', text: '작품의 표현 기법과 그 효과 이해하기' },
      { id: 'art_3', text: '예술관의 변화나 다른 사조와의 차이점 비교하기' },
      { id: 'art_4', text: '예술과 다른 분야의 융합적 요소 찾기' }
    ];
  }
  if (category.includes('문학') || category.includes('소설') || category.includes('시') || category.includes('수필')) {
    return [
      { id: 'lit_1', text: '화자/서술자의 상황과 정서 파악하기' },
      { id: 'lit_2', text: '인물 간의 관계와 갈등 양상 확인하기' },
      { id: 'lit_3', text: '시간적/공간적 배경의 의미와 역할 이해하기' },
      { id: 'lit_4', text: '상징적 소재나 표현상의 특징 찾기' }
    ];
  }
  
  // Default for High School
  return [
    { id: 'def_1', text: '글의 화제(무엇에 대해 쓰는가?) 파악하기' },
    { id: 'def_2', text: '문단별 중심 내용 요약하며 읽기' },
    { id: 'def_3', text: '글쓴이의 주장이나 핵심 정보 파악하기' },
    { id: 'def_4', text: '주장을 뒷받침하는 근거와 사례 확인하기' }
  ];
};
