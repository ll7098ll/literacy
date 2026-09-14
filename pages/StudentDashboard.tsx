import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { FileText, CheckCircle, LayoutDashboard, BrainCircuit, BookA } from 'lucide-react';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getRandomTestSetForGrade } from '../services/contentService';
import { GradeLevel, Subject, TextType, VocabularyLevel, Difficulty, TargetCorrectRate, QuestionType } from '../types';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import StudentOverview from './student/StudentOverview';
import DailyLearning from '../src/pages/student/DailyLearning';
import AvailableTests from './student/AvailableTests';
import TestHistory from './student/TestHistory';
import VocabularyList from './student/VocabularyList';

const getSubjectsForGrade = (grade: string) => {
  const allSubjects = Object.values(Subject);
  if (grade.includes('초등학교 1') || grade.includes('초등학교 2')) return allSubjects.filter(s => s.includes('초1~2'));
  if (grade.includes('초등학교 3') || grade.includes('초등학교 4')) return allSubjects.filter(s => s.includes('초3~4'));
  if (grade.includes('초등학교 5') || grade.includes('초등학교 6')) return allSubjects.filter(s => s.includes('초5~6'));
  if (grade.includes('중학교')) return allSubjects.filter(s => s.includes('중등'));
  return allSubjects.filter(s => s.includes('고등'));
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Listen to my submissions
    const qSubmissions = query(collection(db, 'submissions'), where('studentUid', '==', user.uid));
    const unsubSubmissions = onSnapshot(qSubmissions, (snap) => {
      setSubmissions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'submissions'));

    // Listen to assignments from my teacher
    let unsubAssignments = () => {};
    if (user.teacherCode) {
      const qAssignments = query(
        collection(db, 'assignments'),
        where('teacherUid', '==', user.teacherCode)
      );
      unsubAssignments = onSnapshot(qAssignments, (snap) => {
        setAssignments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'assignments'));
    }

    return () => {
      unsubSubmissions();
      unsubAssignments();
    };
  }, [user]);

  const navItems = [
    { name: '과제 대시보드', path: '/student', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: '나만의 단어장', path: '/student/vocabulary', icon: <BookA className="w-5 h-5" /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="학생 대시보드">
      <Routes>
        <Route path="/" element={
          <StudentOverview 
            user={user}
            submissions={submissions}
            assignments={assignments}
          />
        } />

        <Route path="/vocabulary" element={<VocabularyList />} />

        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
