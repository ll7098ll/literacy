import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TestGenerator from '../components/TestGenerator';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { FileText, Users, BarChart3, PenTool } from 'lucide-react';
import { GenerationConfig, Subject, QuestionType, Difficulty } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import TeacherOverview from '../src/pages/teacher/TeacherOverview';
import StudentManagement from './teacher/StudentManagement';
import StudentDetail from '../src/pages/teacher/StudentDetail';
import Analytics from './teacher/Analytics';
import SubmissionsList from '../src/pages/teacher/SubmissionsList';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [remedialConfig, setRemedialConfig] = useState<Partial<GenerationConfig> | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    // Listen to students
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'), where('teacherCode', '==', user.uid));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    // Listen to tests
    const qTests = query(collection(db, 'tests'), where('teacherUid', '==', user.uid));
    const unsubTests = onSnapshot(qTests, (snap) => {
      setTests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tests'));

    // Listen to submissions
    const qSubmissions = query(collection(db, 'submissions'), where('teacherUid', '==', user.uid));
    const unsubSubmissions = onSnapshot(qSubmissions, (snap) => {
      setSubmissions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'submissions'));

    // Listen to assignments
    const qAssignments = query(collection(db, 'assignments'), where('teacherUid', '==', user.uid));
    const unsubAssignments = onSnapshot(qAssignments, (snap) => {
      setAssignments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'assignments'));

    return () => {
      unsubStudents();
      unsubTests();
      unsubSubmissions();
      unsubAssignments();
    };
  }, [user]);

  const { radarData, pieData, weakestSubject, weakestType } = useMemo(() => {
    const typeAgg: Record<string, { total: number, correct: number }> = {};
    const subjectAgg: Record<string, { total: number, correct: number }> = {};
    
    submissions.forEach(sub => {
      if (!sub.stats) return;
      try {
        const stats = JSON.parse(sub.stats);
        if (stats.typeStats) {
          Object.entries(stats.typeStats).forEach(([type, data]: [string, any]) => {
            if (!typeAgg[type]) typeAgg[type] = { total: 0, correct: 0 };
            typeAgg[type].total += data.total;
            typeAgg[type].correct += data.correct;
          });
        }
        if (stats.subjectStats) {
          Object.entries(stats.subjectStats).forEach(([subj, data]: [string, any]) => {
            if (!subjectAgg[subj]) subjectAgg[subj] = { total: 0, correct: 0 };
            subjectAgg[subj].total += data.total;
            subjectAgg[subj].correct += data.correct;
          });
        }
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    });

    const radar = Object.entries(typeAgg).map(([type, data]) => ({
      subject: type,
      score: Math.round((data.correct / data.total) * 100),
      fullMark: 100
    }));

    let minSubjScore = 100;
    let wSubj = Subject.HIGH_HUM_EPISTEMOLOGY; // default
    Object.entries(subjectAgg).forEach(([subj, data]) => {
      const score = (data.correct / data.total) * 100;
      if (score < minSubjScore && data.total > 0) {
        minSubjScore = score;
        wSubj = subj as Subject;
      }
    });

    let minTypeScore = 100;
    let wType = QuestionType.DETAIL; // default
    Object.entries(typeAgg).forEach(([type, data]) => {
      const score = (data.correct / data.total) * 100;
      if (score < minTypeScore && data.total > 0) {
        minTypeScore = score;
        wType = type as QuestionType;
      }
    });

    const pie = Object.entries(typeAgg).map(([type, data]) => ({
      name: type,
      value: data.total
    }));

    return { radarData: radar, pieData: pie, weakestSubject: wSubj, weakestType: wType };
  }, [submissions]);

  const { aiDifficultyStats, overallPredictedRate } = useMemo(() => {
    const stats: Record<string, { sum: number; count: number }> = {};
    
    tests.forEach(testDoc => {
      if (!testDoc.testSet) return;
      try {
        const testSet = JSON.parse(testDoc.testSet);
        testSet.passages?.forEach((p: any) => {
          p.questions?.forEach((q: any) => {
            const typeName = q.type?.split('(')[0].trim() || '기타';
            const rateMatch = q.predictedRate?.match(/(\d+)/);
            const rate = rateMatch ? parseInt(rateMatch[1], 10) : 0;
            
            if (rate > 0) {
              if (!stats[typeName]) stats[typeName] = { sum: 0, count: 0 };
              stats[typeName].sum += rate;
              stats[typeName].count += 1;
            }
          });
        });
      } catch (e) {
        console.error("Failed to parse testSet", e);
      }
    });

    const typeStats = Object.entries(stats)
      .map(([type, { sum, count }]) => ({
        type,
        avgRate: Math.round(sum / count),
        count
      }))
      .sort((a, b) => a.avgRate - b.avgRate);

    let overall = 0;
    if (typeStats.length > 0) {
      const totalSum = typeStats.reduce((acc, curr) => acc + (curr.avgRate * curr.count), 0);
      const totalCount = typeStats.reduce((acc, curr) => acc + curr.count, 0);
      overall = Math.round(totalSum / totalCount);
    }

    return { aiDifficultyStats: typeStats, overallPredictedRate: overall };
  }, [tests]);

  const handleGenerateRemedial = () => {
    setRemedialConfig({
      title: "취약점 집중 보완 모의고사",
      subjects: [weakestSubject],
      passageCount: 3,
      questionsPerPassage: 4,
      subjectBlueprints: {
        [weakestSubject]: [
          { type: weakestType, difficulty: Difficulty.MEDIUM },
          { type: weakestType, difficulty: Difficulty.HIGH },
          { type: QuestionType.DETAIL, difficulty: Difficulty.MEDIUM },
          { type: QuestionType.VOCABULARY, difficulty: Difficulty.MEDIUM }
        ]
      }
    });
    navigate('/teacher/generate');
  };

  const navItems = [
    { name: '학급 대시보드', path: '/teacher', icon: <BarChart3 className="w-5 h-5" /> },
    { name: '스마트 과제 출제', path: '/teacher/generate', icon: <PenTool className="w-5 h-5" /> },
    { name: '학생 개별 관리', path: '/teacher/students', icon: <Users className="w-5 h-5" /> },
    { name: '제출 답안 현황', path: '/teacher/submissions', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="선생님 대시보드">
      <Routes>
        <Route path="/" element={<TeacherOverview students={students} tests={tests} submissions={submissions} assignments={assignments} />} />
        <Route path="/generate" element={<TestGenerator initialConfig={remedialConfig} />} />
        <Route path="/students" element={<StudentManagement students={students} tests={tests} submissions={submissions} />} />
        <Route path="/students/:id" element={<StudentDetail students={students} tests={tests} submissions={submissions} />} />
        <Route path="/analytics" element={
          <Analytics 
            radarData={radarData}
            pieData={pieData}
            weakestSubject={weakestSubject}
            weakestType={weakestType}
            aiDifficultyStats={aiDifficultyStats}
            overallPredictedRate={overallPredictedRate}
            submissions={submissions}
            students={students}
            tests={tests}
            onGenerateRemedial={handleGenerateRemedial}
          />
        } />
        <Route path="/submissions" element={<SubmissionsList submissions={submissions} students={students} tests={tests} />} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
