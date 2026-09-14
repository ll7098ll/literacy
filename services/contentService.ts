/**
 * Content Service — Pre-generated content loader
 * Replaces geminiService.ts (AI API calls) with static data lookups.
 */

import {
  PreGeneratedTestSet,
  PreGeneratedPassage,
  PreGeneratedQuestion,
  TestSetIndex,
  GradeLevel,
  Difficulty,
  FAQ,
  ReadingHabitFeedbackTemplate,
} from '../types';
import { allTestSets, testSetIndex, getTestSetById, getTestSetsForGrade, getRandomTestSet } from '../data/tests/index';
import { readingHabitTemplates } from '../data/feedback/reading_habit_templates';

// ============================================
// 1. Test Set Retrieval (replaces generateTestSet)
// ============================================

/**
 * Get a pre-generated test set by its ID.
 * Replaces: generateTestSet()
 */
export function getTestSet(id: string): PreGeneratedTestSet | undefined {
  return getTestSetById(id);
}

/**
 * Get all available test set metadata for browsing.
 */
export function getTestSetList(grade?: GradeLevel): TestSetIndex[] {
  if (!grade) return testSetIndex;
  return testSetIndex.filter(ts => {
    const gradeStr = grade as string;
    const tsGrade = ts.grade as string;
    if (gradeStr.includes('고등') && tsGrade.includes('고등')) return true;
    if (gradeStr.includes('중학') && tsGrade.includes('중학')) return true;
    if (gradeStr.includes('초등학교 5') || gradeStr.includes('초등학교 6')) {
      return tsGrade.includes('5학년') || tsGrade.includes('6학년');
    }
    if (gradeStr.includes('초등학교 3') || gradeStr.includes('초등학교 4')) {
      return tsGrade.includes('3학년') || tsGrade.includes('4학년');
    }
    if (gradeStr.includes('초등학교 1') || gradeStr.includes('초등학교 2')) {
      return (tsGrade.includes('1학년') || tsGrade.includes('2학년')) && !tsGrade.includes('고등') && !tsGrade.includes('중학');
    }
    return false;
  });
}

/**
 * Get a random test set for a grade level, optionally filtered by difficulty.
 * Replaces: generateTestSet() in "auto mode" and daily learning.
 */
export function getRandomTestSetForGrade(grade: GradeLevel, difficulty?: Difficulty): PreGeneratedTestSet | undefined {
  return getRandomTestSet(grade, difficulty);
}

/**
 * Get all test sets for a specific grade.
 */
export function getTestSetsForGradeLevel(grade: GradeLevel): PreGeneratedTestSet[] {
  return getTestSetsForGrade(grade);
}

// ============================================
// 2. Vocabulary Lookup (replaces explainWordInContext)
// ============================================

/**
 * Look up a word's contextual meaning from a test set's vocabulary.
 * Replaces: explainWordInContext()
 * Returns the meaning if found, or a fallback message.
 */
export function lookupWord(testId: string, word: string): string | null {
  const testSet = getTestSetById(testId);
  if (!testSet) return null;

  // Exact match
  if (testSet.vocabulary[word]) {
    return testSet.vocabulary[word];
  }

  // Partial match (the word might be part of a longer entry)
  const entries = Object.entries(testSet.vocabulary);
  for (const [key, value] of entries) {
    if (key.includes(word) || word.includes(key)) {
      return `${key}: ${value}`;
    }
  }

  return null;
}

/**
 * Get all vocabulary for a test set.
 */
export function getVocabulary(testId: string): Record<string, string> {
  const testSet = getTestSetById(testId);
  return testSet?.vocabulary || {};
}

// ============================================
// 3. Reading Habit Feedback (replaces generateReadingHabitFeedback)
// ============================================

/**
 * Get template-based reading habit feedback based on score and strategy usage.
 * Replaces: generateReadingHabitFeedback()
 */
export function getReadingHabitFeedback(
  score: number,
  checkedCount: number,
  totalCount: number
): string {
  // Determine strategy level
  const ratio = totalCount > 0 ? checkedCount / totalCount : 0;
  let strategyLevel: 'low' | 'medium' | 'high';
  if (ratio >= 0.7) {
    strategyLevel = 'high';
  } else if (ratio >= 0.3) {
    strategyLevel = 'medium';
  } else {
    strategyLevel = 'low';
  }

  // Find matching template
  const template = readingHabitTemplates.find(
    t => score >= t.scoreRange[0] && score <= t.scoreRange[1] && t.strategyLevel === strategyLevel
  );

  if (template) {
    return template.feedback;
  }

  // Fallback: find closest match by score
  const fallback = readingHabitTemplates.find(
    t => score >= t.scoreRange[0] && score <= t.scoreRange[1]
  );

  return fallback?.feedback || '독해 전략을 적극 활용하면 독해력이 더욱 향상될 수 있습니다. 다음 학습에서도 체크리스트를 꼼꼼히 확인하며 읽기 연습을 해보세요!';
}

// ============================================
// 4. Paragraph Guide (replaces generateParagraphGuide)
// ============================================

/**
 * Get the pre-reading guide for a specific paragraph.
 * Replaces: generateParagraphGuide()
 * Returns immediately (no async needed).
 */
export function getParagraphGuide(
  testId: string,
  passageIdx: number,
  paragraphIdx: number
): string | null {
  const testSet = getTestSetById(testId);
  if (!testSet) return null;

  const passage = testSet.passages[passageIdx] as PreGeneratedPassage;
  if (!passage) return null;

  return passage.paragraphGuides?.[paragraphIdx] || null;
}

// ============================================
// 5. Paragraph Feedback (replaces generateParagraphFeedback)
// ============================================

/**
 * Evaluate student's paragraph summary by keyword matching.
 * Replaces: generateParagraphFeedback()
 * Instead of AI analysis, checks if key terms are present.
 */
export function getParagraphFeedback(
  testId: string,
  passageIdx: number,
  paragraphIdx: number,
  studentText: string
): string {
  const testSet = getTestSetById(testId);
  if (!testSet) return '피드백을 불러올 수 없습니다.';

  const passage = testSet.passages[passageIdx] as PreGeneratedPassage;
  if (!passage) return '피드백을 불러올 수 없습니다.';

  const keywords = passage.paragraphKeywords?.[paragraphIdx] || [];
  const modelSummary = passage.paragraphModelSummary?.[paragraphIdx] || '';
  
  if (keywords.length === 0) {
    return '이 문단에 대한 피드백 데이터가 아직 준비되지 않았습니다.';
  }

  // Check how many keywords the student mentioned
  const normalizedStudent = studentText.toLowerCase().replace(/\s+/g, '');
  const matchedKeywords = keywords.filter(kw => 
    normalizedStudent.includes(kw.toLowerCase().replace(/\s+/g, ''))
  );

  const matchRatio = matchedKeywords.length / keywords.length;

  let feedback = '';

  if (matchRatio >= 0.7) {
    feedback = `훌륭해요! 이 문단의 핵심 내용(${matchedKeywords.join(', ')})을 잘 파악했어요. `;
    if (matchRatio < 1) {
      const missed = keywords.filter(kw => !matchedKeywords.includes(kw));
      feedback += `추가로 '${missed.join("', '")}' 개념도 함께 정리하면 더 완벽한 요약이 될 거예요.`;
    } else {
      feedback += '핵심 키워드를 빠짐없이 짚어냈네요!';
    }
  } else if (matchRatio >= 0.3) {
    const missed = keywords.filter(kw => !matchedKeywords.includes(kw));
    feedback = `좋은 시도예요! ${matchedKeywords.length > 0 ? `'${matchedKeywords.join("', '")}'을(를) 잘 짚었어요. ` : ''}하지만 '${missed.join("', '")}' 같은 핵심 개념도 포함시켜 보세요.`;
    if (modelSummary) {
      feedback += `\n\n📌 **모범 요약 참고**: ${modelSummary}`;
    }
  } else {
    feedback = '이 문단의 핵심을 다시 한번 살펴볼까요? ';
    feedback += `핵심 키워드는 '${keywords.join("', '")}' 등이에요.`;
    if (modelSummary) {
      feedback += `\n\n📌 **모범 요약 참고**: ${modelSummary}`;
    }
  }

  return feedback;
}

// ============================================
// 6. Question Feedback (replaces generateInteractiveReadingFeedback)
// ============================================

/**
 * Get pre-generated feedback for a question based on correctness.
 * Replaces: generateInteractiveReadingFeedback()
 */
export function getQuestionFeedback(
  testId: string,
  passageIdx: number,
  questionIdx: number,
  isCorrect: boolean,
  checkedStrategyIds?: string[]
): string {
  const testSet = getTestSetById(testId);
  if (!testSet) return '피드백을 불러올 수 없습니다.';

  const passage = testSet.passages[passageIdx] as PreGeneratedPassage;
  if (!passage) return '피드백을 불러올 수 없습니다.';

  const question = passage.questions[questionIdx] as PreGeneratedQuestion;
  if (!question) return '피드백을 불러올 수 없습니다.';

  let feedback = isCorrect ? question.correctFeedback : question.incorrectFeedback;

  // Add strategy-specific feedback if strategies are checked
  if (checkedStrategyIds && checkedStrategyIds.length > 0 && question.strategyFeedback) {
    const strategyTips: string[] = [];
    for (const [strategy, tip] of Object.entries(question.strategyFeedback)) {
      if (!checkedStrategyIds.includes(strategy)) {
        strategyTips.push(tip);
      }
    }
    if (strategyTips.length > 0) {
      feedback += '\n\n💡 **독해 전략 팁**: ' + strategyTips[0];
    }
  }

  return feedback;
}

// ============================================
// 7. Question FAQ (replaces askAITutor)
// ============================================

/**
 * Get pre-generated FAQ for a specific question.
 * Replaces: askAITutor() (multi-turn chat → static FAQ list)
 */
export function getQuestionFAQ(
  testId: string,
  passageIdx: number,
  questionIdx: number
): FAQ[] {
  const testSet = getTestSetById(testId);
  if (!testSet) return [];

  const passage = testSet.passages[passageIdx] as PreGeneratedPassage;
  if (!passage) return [];

  const question = passage.questions[questionIdx] as PreGeneratedQuestion;
  if (!question) return [];

  return question.faq || [];
}
