import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { Note } from '../types';

interface NotesProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onDeleteNote: (id: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ notes, onAddNote, onDeleteNote }) => {
  const [newNote, setNewNote] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
      </div>
      
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Add a new note..."
              rows={3}
            />
            <button
              type="submit"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors h-fit"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>
        </form>

        <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-gray-50 rounded-lg flex justify-between items-start group"
            >
              <div className="flex-1">
                <p className="text-gray-700 whitespace-pre-wrap break-words">{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onDeleteNote(note.id)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};