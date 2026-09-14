import React from 'react';
import { BarChart3, Sparkles, TrendingDown, Layers, PieChart as PieIcon, Info, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

// Brand Design System Color Palette
const COLORS = ['#0F172A', '#1E40AF', '#2563EB', '#059669', '#D97706', '#475569', '#0D9488', '#B45309'];

interface AnalyticsProps {
  radarData: any[];
  pieData: any[];
  weakestSubject: string;
  weakestType: string;
  aiDifficultyStats: any[];
  overallPredictedRate: number;
  submissions?: any[];
  students?: any[];
  tests?: any[];
  onGenerateRemedial: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({
  radarData,
  pieData,
  weakestSubject,
  weakestType,
  aiDifficultyStats,
  overallPredictedRate,
  onGenerateRemedial
}) => {
  if (radarData.length === 0) {
    return (
      <Card variant="paper" padding="lg" className="text-center max-w-2xl mx-auto py-16 border-2 border-slate-900 shadow-tactile">
        <div className="w-16 h-16 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-tactile-sm border-2 border-slate-900">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="editorial-serif text-xl font-black text-slate-900 tracking-tight mb-2">분석 데이터가 아직 부족합니다</h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6">
          학생들이 배정된 문해력 과제를 풀고 제출하면, 학급 전체의 유형별 정답률 및 취약점 AI 정밀 분석이 자동으로 시작됩니다.
        </p>
        <Button
          onClick={onGenerateRemedial}
          variant="tactile-emerald"
          size="md"
          icon={<Sparkles className="w-4 h-4 text-amber-300" />}
        >
          과제 출제하러 가기
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Card with Remedial Action */}
      <Card variant="paper" padding="lg" className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-2 border-slate-900 shadow-tactile">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-tactile-sm border-2 border-slate-900">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="editorial-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">우리 반 문해력 정밀 진단</h3>
              <Badge variant="stamp" size="sm">학급 종합 분석</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              학생들이 제출한 답안 데이터를 바탕으로 취약 유형을 자동 도출합니다.
            </p>
          </div>
        </div>

        {weakestType && (
          <Button
            onClick={onGenerateRemedial}
            variant="tactile-emerald"
            size="md"
            icon={<Sparkles className="w-4 h-4 text-amber-300" />}
            iconRight={<ArrowRight className="w-4 h-4" />}
            className="shrink-0"
          >
            취약 영역 [{weakestType}] 보완 과제 출제
          </Button>
        )}
      </Card>

      {/* 2 Tremor Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card variant="metric" padding="md" className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-amber-900 text-amber-300 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold text-amber-900 uppercase">학급 최다 오답 독해 영역</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="editorial-serif text-2xl sm:text-3xl font-black text-slate-900">{weakestType || '데이터 분석 중'}</span>
            <Badge variant="stamp-amber" size="sm">집중 보완 권장</Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            해당 영역 문항에서 오답률이 가장 높게 집계되었습니다. 지문 대조 훈련을 추천합니다.
          </p>
        </Card>

        <Card variant="metric" padding="md" className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-emerald-900 text-emerald-300 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-900 uppercase">학급 평균 정답률 수준</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">{overallPredictedRate || 74}%</span>
            <Badge variant="stamp-emerald" size="sm">안정권 성취도</Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            초등 5·6학년 표준 성취도 기준에 부합하는 안정적인 문해력 발달을 보이고 있습니다.
          </p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart: Class Competencies */}
        <Card variant="paper" padding="lg" className="space-y-4 border-2 border-slate-900 shadow-tactile">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <h4 className="editorial-serif text-base font-black text-slate-900">학급 문해력 유형별 정답률 (%)</h4>
            <Badge variant="stamp" size="sm">역량 밸런스</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 800 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar name="학급 평균" dataKey="score" stroke="#0f172a" fill="#2563eb" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart: Question Distribution */}
        <Card variant="paper" padding="lg" className="space-y-4 border-2 border-slate-900 shadow-tactile">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <h4 className="editorial-serif text-base font-black text-slate-900">응시한 문항 유형별 비중</h4>
            <Badge variant="stamp-amber" size="sm">출제 분포</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '2px solid #0f172a', boxShadow: '0 3px 0 0 #0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

    </div>
  );
};

export default Analytics;
