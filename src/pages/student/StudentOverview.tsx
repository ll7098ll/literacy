import React from 'react';
import LiteracyReport from '@/components/LiteracyReport';

interface StudentOverviewProps {
  user: any;
  submissions: any[];
  completedDailyCount: number;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({
  user,
  submissions,
  completedDailyCount,
}) => {
  return (
    <div className="space-y-8">
      <div className="mb-10 animate-fade-in-up">
        <h2 className="text-3xl font-black text-slate-900 mb-2">나의 학습 현황</h2>
        <p className="text-slate-500 font-medium">문해력 분석 결과와 시험 내역을 확인하세요.</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="mb-12">
        <LiteracyReport submissions={submissions} studentName={user?.displayName || '학생'} />
      </div>
    </div>
  );
};

export default StudentOverview;
