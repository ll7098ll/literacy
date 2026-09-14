import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { TrendingUp, Award, AlertTriangle, BrainCircuit, Target, BookOpen, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface LiteracyReportProps {
  submissions: any[];
  studentName: string;
}

const LiteracyReport: React.FC<LiteracyReportProps> = ({ submissions, studentName }) => {
  const { radarData, trendData, summary, feedback } = useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return { radarData: [], trendData: [], summary: null, feedback: null };
    }

    const aggregated: Record<string, { total: number, correct: number }> = {};
    let totalScore = 0;

    // Sort submissions by date ascending
    const sortedSubmissions = [...submissions].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );

    const trendData = sortedSubmissions.map((sub, index) => {
      totalScore += sub.score;
      if (sub.stats) {
        try {
          const stats = JSON.parse(sub.stats);
          if (stats.typeStats) {
            Object.entries(stats.typeStats).forEach(([type, data]: [string, any]) => {
              if (!aggregated[type]) aggregated[type] = { total: 0, correct: 0 };
              aggregated[type].total += data.total;
              aggregated[type].correct += data.correct;
            });
          }
        } catch (e) {
          console.error("Failed to parse stats", e);
        }
      }
      return {
        name: `${index + 1}회차`,
        date: new Date(sub.submittedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        score: sub.score
      };
    });

    const radarData = Object.entries(aggregated).map(([type, data]) => ({
      subject: type,
      score: Math.round((data.correct / data.total) * 100),
      fullMark: 100
    }));

    const avgScore = Math.round(totalScore / submissions.length);

    let strongest = { subject: '', score: -1 };
    let weakest = { subject: '', score: 101 };

    radarData.forEach(d => {
      if (d.score > strongest.score) strongest = d;
      if (d.score < weakest.score) weakest = d;
    });

    // Qualitative Feedback Logic
    let overall = '';
    if (avgScore >= 80) {
      overall = '전반적인 문해력과 독해 사고력이 매우 우수합니다. 깊이 있는 비판적 사고와 고난도 추론 지문까지 주도적으로 읽어보세요.';
    } else if (avgScore >= 60) {
      overall = '기본적인 문해력을 잘 갖추고 있으나, 특정 영역에서 보완이 필요합니다. 취약 영역 중심의 지문 대조 훈련을 추천합니다.';
    } else {
      overall = '문해력 기초 다지기가 필요합니다. 단락별 중심 문장 찾기와 필수 어휘 익히기를 통해 차근차근 점수를 끌어올릴 수 있습니다.';
    }

    const adviceMap: Record<string, string> = {
      '사실적 이해': '글의 표면적인 정보를 정확히 파악하는 연습이 필요합니다. 지문 속 핵심 어휘에 밑줄을 긋는 습관을 들이세요.',
      '추론적 이해': '글에 명시되지 않은 숨은 의미를 유추하는 훈련이 필요합니다. "왜 그럴까?"를 스스로 질문하며 읽어보세요.',
      '비판적 이해': '작가의 의도나 글의 타당성을 평가하는 역량입니다. 서로 다른 관점의 글을 비교하며 논리성을 검토해 보세요.',
      '어휘력': '문맥 속에서 낯선 낱말의 뜻을 짐작하고 나만의 어휘장에 기록하는 꾸준한 복습이 필요합니다.',
      '문맥 파악': '문장과 문장의 인과관계, 접속사의 쓰임새를 파악하는 훈련이 필요합니다.',
      '핵심 파악': '각 문단마다 하나의 중심 문장을 요약해 보는 요약 훈련을 추천합니다.'
    };

    const feedback = {
      overall,
      strength: strongest.subject ? `가장 우수한 영역은 [${strongest.subject}](${strongest.score}점)입니다. 이 강점을 바탕으로 심화 독해를 확장할 수 있습니다.` : '',
      weakness: weakest.subject ? `가장 보완이 필요한 영역은 [${weakest.subject}](${weakest.score}점)입니다. ${adviceMap[weakest.subject] || '해당 영역의 집중 학습을 권장합니다.'}` : ''
    };

    return { 
      radarData, 
      trendData, 
      summary: { avgScore, totalTests: submissions.length, strongest, weakest }, 
      feedback 
    };
  }, [submissions]);

  if (!summary || submissions.length === 0) {
    return (
      <Card variant="paper" padding="lg" className="text-center py-16">
        <div className="w-14 h-14 bg-white rounded-xl border-2 border-slate-300 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-tactile-sm">
          <BookOpen className="w-7 h-7" />
        </div>
        <h4 className="editorial-serif text-base font-black text-slate-900 mb-1">분석 데이터가 아직 부족합니다</h4>
        <p className="text-xs text-slate-500 font-medium">과제를 풀고 제출하면 다각도 문해력 진단 리포트가 실시간 생성됩니다.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 3 Tremor-Style Metric Cards with Top Indicator Line */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="metric" padding="md" className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-tactile-sm">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">종합 평균 점수</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-900">{summary.avgScore}점</span>
            <span className="text-xs font-mono font-bold text-slate-400">/ 100점</span>
          </div>
        </Card>

        <Card variant="metric" padding="md" className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-900 text-emerald-300 flex items-center justify-center shadow-tactile-sm">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">최고 강점 영역</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="editorial-serif text-2xl font-black text-emerald-900">
              {summary.strongest.subject || '분석 중'}
            </span>
            {summary.strongest.score >= 0 && (
              <Badge variant="stamp-emerald" size="sm">{summary.strongest.score}점</Badge>
            )}
          </div>
        </Card>

        <Card variant="metric" padding="md" className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-900 text-amber-300 flex items-center justify-center shadow-tactile-sm">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">집중 보완 필요</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="editorial-serif text-2xl font-black text-amber-900">
              {summary.weakest.subject || '분석 중'}
            </span>
            {summary.weakest.score <= 100 && (
              <Badge variant="stamp-amber" size="sm">{summary.weakest.score}점</Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart: 6 Core Literacy Competencies */}
        <Card variant="paper" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-slate-900 text-amber-400 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h4 className="editorial-serif text-base font-black text-slate-900">문해력 6대 영역 밸런스</h4>
            </div>
            <Badge variant="stamp" size="sm">역량 방사형</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 800 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="문해력 성취도" dataKey="score" stroke="#0f172a" fill="#2563eb" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Line Chart: Score Growth Trend */}
        <Card variant="paper" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-emerald-900 text-emerald-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="editorial-serif text-base font-black text-slate-900">회차별 독해 점수 성장 추이</h4>
            </div>
            <Badge variant="stamp-emerald" size="sm">시계열 추세</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '2px solid #0f172a', boxShadow: '0 3px 0 0 #0f172a' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ fill: '#059669', r: 5, strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* AI Qualitative Feedback Card */}
      {feedback && (
        <Card variant="paper" padding="lg" className="space-y-4 border-2 border-slate-900 shadow-tactile">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-tactile-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="editorial-serif text-base font-black text-slate-900">AI 종합 문해력 처방 소견</h4>
              <p className="text-xs text-slate-500 font-mono">학생의 오답 패턴과 응시 기록 기반 정밀 분석</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-white p-4 rounded-xl border-2 border-slate-200">
            {feedback.overall}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {feedback.strength && (
              <div className="bg-white p-4 rounded-xl border-2 border-emerald-600 shadow-tactile-sm space-y-1.5">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 우수 강점 영역
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {feedback.strength}
                </p>
              </div>
            )}

            {feedback.weakness && (
              <div className="bg-white p-4 rounded-xl border-2 border-amber-600 shadow-tactile-sm space-y-1.5">
                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> 집중 보완 가이드
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {feedback.weakness}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

    </div>
  );
};

export default LiteracyReport;
