"use client";

import React, { useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth'; 
import { collection, query, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Sidebar } from './components/Sidebar';
import { DashboardView, GoalsView, VisionView, Goal, VisionItem } from './components/Views';
import { AddGoalModal, AddVisionModal } from './components/Modals';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);

  useEffect(() => {

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
           
            console.log("Restored session for:", currentUser.uid);
            setUser(currentUser);
          } else {
            
            console.log("No user found. Creating new anonymous account...");
            signInAnonymously(auth).catch((err) => console.error("Auth Error:", err));
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Persistence failed:", error);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const qGoals = query(collection(db, 'users', user.uid, 'goals'), orderBy('order', 'asc'));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    });

    const qVision = query(collection(db, 'users', user.uid, 'visionBoard'), orderBy('createdAt', 'desc'));
    const unsubVision = onSnapshot(qVision, (snapshot) => {
      setVisionItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisionItem)));
    });

    return () => {
      unsubGoals();
      unsubVision();
    };
  }, [user]);

  const handleReorder = async (newGoals: Goal[]) => {
    setGoals(newGoals);
    if (!user) return;
    try {
      const batch = writeBatch(db);
      newGoals.forEach((goal, index) => {
        const ref = doc(db, 'users', user.uid, 'goals', goal.id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error saving order:", err);
    }
  };

  if (!user) return <div className="flex h-screen items-center justify-center text-stone-400">Loading your workspace...</div>;

  return (
    <div className="flex h-screen bg-[#F5F5F4] text-stone-800 font-sans antialiased overflow-hidden">
      <Sidebar currentView={view} setView={setView} userEmail={user.isAnonymous ? 'Guest User' : user.email} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8 pt-12">
          {view === 'dashboard' && <DashboardView goals={goals} visionItems={visionItems} />}
          {view === 'goals' && (
            <GoalsView 
              goals={goals} 
              userId={user.uid} 
              onAdd={() => setShowGoalModal(true)} 
              onReorder={handleReorder} 
            />
          )}
          {view === 'vision' && <VisionView items={visionItems} userId={user.uid} onAdd={() => setShowVisionModal(true)} />}
        </div>
      </main>

      <AddGoalModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} userId={user.uid} />
      <AddVisionModal isOpen={showVisionModal} onClose={() => setShowVisionModal(false)} userId={user.uid} />
    </div>
  );
}