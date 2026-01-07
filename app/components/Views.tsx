"use client";

import React, { useState } from 'react';
import { Target, CheckCircle2, Calendar, Trash2, Plus } from 'lucide-react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button, Card, Badge } from './UI';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface Goal {
  id: string;
  title: string;
  category: string;
  deadline: string;
  progress: number;
  completed: boolean;
  order?: number; 
}

export interface VisionItem {
  id: string;
  type: 'image' | 'quote' | 'text';
  content: string;
  caption: string;
  order?: number; 
}

const SortableGoalCard = ({ goal, userId }: { goal: Goal; userId: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GoalCard goal={goal} userId={userId} />
    </div>
  );
};

const GoalCard = ({ goal, userId, readOnly = false }: { goal: Goal; userId?: string; readOnly?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userId && confirm('Delete this goal?')) {
      await deleteDoc(doc(db, 'users', userId, 'goals', goal.id));
    }
  };

  const toggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (readOnly || !userId) return;
    await updateDoc(doc(db, 'users', userId, 'goals', goal.id), {
      completed: !goal.completed,
      progress: !goal.completed ? 100 : 0
    });
  };

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 h-full ${goal.completed ? 'opacity-75 bg-stone-50' : 'hover:-translate-y-1'}`}>
      <div className="p-5 flex flex-col h-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="flex justify-between items-start mb-3">
          <Badge color={goal.category === 'Career' ? 'blue' : goal.category === 'Health' ? 'emerald' : 'rose'}>{goal.category}</Badge>
          {!readOnly && isHovered && (
             <button onPointerDown={(e) => e.stopPropagation()} onClick={handleDelete} className="text-stone-300 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
          )}
        </div>
        <h3 className={`text-lg font-semibold text-stone-800 mb-1 ${goal.completed ? 'line-through text-stone-400' : ''}`}>{goal.title}</h3>
        {goal.deadline && (
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-4">
            <Calendar size={12} /><span>{new Date(goal.deadline).toLocaleDateString()}</span>
          </div>
        )}
        <div className="mt-auto pt-4"> 
          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden relative">
            <div className={`h-full rounded-full transition-all duration-500 ${goal.completed ? 'bg-emerald-400' : 'bg-stone-800'}`} style={{ width: `${goal.progress}%` }} />
          </div>
          {!readOnly && (
            <div className="mt-4 border-t border-stone-100 flex justify-end pt-3">
              <button onPointerDown={(e) => e.stopPropagation()} onClick={toggleComplete} className={`text-sm font-medium flex items-center gap-2 transition-colors ${goal.completed ? 'text-emerald-600' : 'text-stone-500 hover:text-stone-800'}`}>
                <CheckCircle2 size={16}/>{goal.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const DashboardView = ({ goals, visionItems }: { goals: Goal[]; visionItems: VisionItem[] }) => {
  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-serif font-medium text-stone-800">Good afternoon</h1>
        <p className="text-stone-500 mt-1">Here is a snapshot of your vision.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 h-32 flex flex-col justify-between">
          <div className="flex justify-between items-start"><h3 className="text-stone-500 font-medium text-sm">Active Goals</h3><Target className="text-stone-300" size={20} /></div>
          <div className="text-4xl font-semibold text-stone-800">{activeGoals.length}</div>
        </Card>
        <Card className="p-6 h-32 flex flex-col justify-between">
          <div className="flex justify-between items-start"><h3 className="text-stone-500 font-medium text-sm">Completed</h3><CheckCircle2 className="text-stone-300" size={20} /></div>
          <div className="text-4xl font-semibold text-stone-800">{completedGoals.length}</div>
        </Card>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Vision Board Preview</h2>
        
        {visionItems.length === 0 ? (
          <div className="h-32 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 border border-dashed border-stone-200">
             Your vision board is empty
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {visionItems.slice(0, 4).map((item) => (
               <div key={item.id} className="relative group">
                 {item.type === 'image' ? (
                   <div className="rounded-xl overflow-hidden aspect-[4/5] shadow-sm border border-stone-100 bg-white">
                      <img src={item.content} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                   </div>
                 ) : (
                   <div className="bg-[#FAF9F6] p-4 rounded-xl shadow-sm border border-stone-100 aspect-[4/5] flex items-center justify-center text-center font-serif text-sm text-stone-600">
                     {item.content}
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}
      </section>
    </div>
  );
};

export const GoalsView = ({ goals, userId, onAdd, onReorder }: { goals: Goal[]; userId: string; onAdd: () => void, onReorder: (newOrder: Goal[]) => void }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex((g) => g.id === active.id);
      const newIndex = goals.findIndex((g) => g.id === over.id);
      onReorder(arrayMove(goals, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-serif font-medium text-stone-800">Your Goals</h1></div>
        <Button onClick={onAdd}><Plus size={18} /> New Goal</Button>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={goals.map(g => g.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <SortableGoalCard key={goal.id} goal={goal} userId={userId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export const VisionView = ({ items, userId, onAdd }: { items: VisionItem[]; userId: string; onAdd: () => void }) => {
  
  const handleDelete = async (id: string) => {
    if (confirm('Remove this item?')) await deleteDoc(doc(db, 'users', userId, 'visionBoard', id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-serif font-medium text-stone-800">Vision Board</h1></div>
        <Button onClick={onAdd}><Plus size={18} /> Add Item</Button>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-4 gap-6 pb-20">
        {items.map(item => (
          <div key={item.id} className="group relative break-inside-avoid mb-6 inline-block w-full">
            {item.type === 'image' ? (
              <div 
                className="rounded-xl overflow-hidden shadow-sm bg-white relative hover:shadow-md transition-shadow duration-300"
                style={{ transform: 'translateZ(0)' }}
              >
                <img 
                  src={item.content} 
                  className="w-full h-auto block hover:scale-105 transition-transform duration-700 ease-out will-change-transform" 
                  loading="lazy"
                  alt={item.caption || "Vision"}
                />
                 {item.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                    <p className="text-white text-sm font-medium leading-tight">{item.caption}</p>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="bg-[#FAF9F6] p-6 rounded-xl shadow-sm border border-stone-100 text-center font-serif text-stone-700 hover:shadow-md transition-shadow duration-300"
                style={{ transform: 'translateZ(0)' }}
              >
                {item.content}
              </div>
            )}
            
            <button 
              onClick={() => handleDelete(item.id)} 
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-white shadow-sm z-10"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};