import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

export interface AppUser {
  uid: string;
  role: 'teacher' | 'student' | null;
  displayName: string;
  email: string;
  teacherCode?: string;
  classCode?: string;
  gradeLevel?: string;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: 'teacher' | 'student', teacherCode?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = auth.onAuthStateChanged(async (fUser) => {
      setFirebaseUser(fUser);
      
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      if (fUser) {
        // Listen to user document
        const userRef = doc(db, 'users', fUser.uid);
        unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as AppUser;
            setUser(userData);
            
            // Auto generate classCode for existing teacher if missing
            if (userData.role === 'teacher' && !userData.classCode) {
              generateClassCode(fUser.uid).then(code => {
                updateDoc(userRef, { classCode: code });
              }).catch(err => console.error("Error generating classCode for teacher", err));
            }
          } else {
            // User document doesn't exist yet, they need to select a role
            setUser({
              uid: fUser.uid,
              role: null,
              displayName: fUser.displayName || 'Unknown',
              email: fUser.email || '',
              createdAt: new Date().toISOString()
            });
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) {
        unsubDoc();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const generateClassCode = async (teacherUid: string): Promise<string> => {
    let attempts = 0;
    while (attempts < 10) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeRef = doc(db, 'classCodes', code);
      const codeSnap = await getDoc(codeRef);
      if (!codeSnap.exists()) {
        await setDoc(codeRef, { teacherUid });
        return code;
      }
      attempts++;
    }
    throw new Error('Failed to generate a unique 6-digit class code.');
  };

  const setRole = async (role: 'teacher' | 'student', teacherCode?: string) => {
    if (!firebaseUser) return;
    
    const newUser: AppUser = {
      uid: firebaseUser.uid,
      role,
      displayName: firebaseUser.displayName || 'Unknown',
      email: firebaseUser.email || '',
      createdAt: new Date().toISOString()
    };

    try {
      if (role === 'student' && teacherCode) {
        const cleanCode = teacherCode.trim().replace(/-/g, '');
        if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
          // 6-digit simple code resolution
          const codeRef = doc(db, 'classCodes', cleanCode);
          const codeSnap = await getDoc(codeRef);
          if (codeSnap.exists()) {
            newUser.teacherCode = codeSnap.data().teacherUid;
            newUser.classCode = cleanCode;
          } else {
            throw new Error('존재하지 않는 학급 코드입니다. 올바른 6자리 숫자를 입력해 주세요.');
          }
        } else {
          // Fallback legacy long UID
          newUser.teacherCode = teacherCode;
          // Look up classCode
          const teacherRef = doc(db, 'users', teacherCode);
          const teacherSnap = await getDoc(teacherRef);
          if (teacherSnap.exists()) {
            const tData = teacherSnap.data();
            if (tData.classCode) {
              newUser.classCode = tData.classCode;
            }
          }
        }
      } else if (role === 'teacher') {
        const classCode = await generateClassCode(firebaseUser.uid);
        newUser.classCode = classCode;
        newUser.teacherCode = firebaseUser.uid;
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    } catch (error: any) {
      alert(error.message || '역할 설정 중 오류가 발생했습니다.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithGoogle, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
