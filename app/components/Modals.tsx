"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from './UI';

const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800; 
        const scale = maxWidth / img.width;
        
        if (scale < 1) {
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64String = canvas.toDataURL('image/jpeg', 0.6);
        resolve(base64String);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const AddGoalModal = ({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !userId) return;

    try {
      await addDoc(collection(db, 'users', userId, 'goals'), {
        title,
        category,
        deadline,
        progress: 0,
        completed: false,
        order: Date.now(),
        createdAt: serverTimestamp()
      });
      setTitle('');
      setCategory('Personal');
      setDeadline('');
      onClose();
    } catch (err) {
      console.error("Error adding goal:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-stone-800">New Goal</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Goal Title</label>
            <input 
              type="text" 
              placeholder="e.g. Run a Marathon"
              className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-400 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Category</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-400 bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Personal">Personal</option>
                <option value="Career">Career</option>
                <option value="Study">Study</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Target Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800/10 focus:border-stone-400"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1">Create Goal</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddVisionModal = ({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string }) => {

  const [type, setType] = useState<'image' | 'text'>('image');
  const [inputType, setInputType] = useState<'url' | 'file'>('file');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (type === 'text' && !content) return;
    if (type === 'image' && inputType === 'url' && !content) return;
    if (type === 'image' && inputType === 'file' && !file) return;

    setUploading(true);

    try {
      let finalContent = content;

      if (type === 'image' && inputType === 'file' && file) {
        finalContent = await compressAndConvertToBase64(file);
      }

      await addDoc(collection(db, 'users', userId, 'visionBoard'), {
        type, 
        content: finalContent,
        caption: type === 'image' ? caption : '', 
        order: Date.now(),
        createdAt: serverTimestamp()
      });

      setContent('');
      setFile(null);
      setCaption('');
      setUploading(false);
      onClose();
    } catch (err) {
      console.error("Error adding vision item:", err);
      setUploading(false);
      alert("Error saving item.");
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-stone-800">Add to Vision Board</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20}/></button>
        </div>
        
        <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-lg">
          <button type="button" onClick={() => setType('image')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'image' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Image</button>
          
          <button type="button" onClick={() => setType('text')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'text' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Text</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {type === 'image' ? (
            <div>
              <div className="flex items-center gap-4 mb-2">
                <label className="text-xs font-semibold text-stone-500 uppercase">Image Source</label>
                <div className="flex gap-2 text-xs">
                    <button type="button" onClick={() => setInputType('file')} className={`${inputType === 'file' ? 'text-stone-800 font-bold underline' : 'text-stone-400'}`}>Upload</button>
                    <span className="text-stone-300">|</span>
                    <button type="button" onClick={() => setInputType('url')} className={`${inputType === 'url' ? 'text-stone-800 font-bold underline' : 'text-stone-400'}`}>URL</button>
                </div>
              </div>

              {inputType === 'file' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-all group"
                >
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileSelect} 
                     accept="image/*" 
                     className="hidden" 
                   />
                   {file ? (
                     <div className="text-center">
                        <span className="text-sm font-medium text-stone-800">{file.name}</span>
                        <p className="text-xs text-stone-400 mt-1">Click to change</p>
                     </div>
                   ) : (
                     <>
                        <Upload className="text-stone-300 mb-2 group-hover:text-stone-500" size={24} />
                        <span className="text-sm text-stone-500">Click to upload image</span>
                     </>
                   )}
                </div>
              ) : (
                <input 
                  type="url" 
                  placeholder="https://..." 
                  className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800/10" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required 
                />
              )}
            </div>
          ) : (
            <div>
               <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Text Content</label>
               
               <textarea placeholder="Type your vision or affirmation..." className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800/10 min-h-[100px]" value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
          )}

          {type === 'image' && (
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Caption</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-800/10" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={uploading}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16}/> Processing...
                </span>
              ) : 'Add to Board'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};