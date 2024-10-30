import React from 'react';
import { Wand2 } from 'lucide-react';
import type { PDFDocument } from '../types';
import { generateSummary } from '../lib/openai';
import { APIKeyModal } from './APIKeyModal';

interface SummaryProps {
  document: PDFDocument;
  onSummaryChange: (summary: string) => void;
  pdfText: string;
  onSetAPIKey: (apiKey: string) => void;
  hasAPIKey: boolean;
}

export const Summary: React.FC<SummaryProps> = ({ 
  document, 
  onSummaryChange,
  pdfText,
  onSetAPIKey,
  hasAPIKey
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = React.useState(false);

  const handleGenerateSummary = async () => {
    if (!pdfText) return;
    
    if (!hasAPIKey) {
      setShowAPIKeyModal(true);
      return;
    }
    
    setIsGenerating(true);
    try {
      const summary = await generateSummary(pdfText);
      onSummaryChange(summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAPIKeySubmit = (apiKey: string) => {
    onSetAPIKey(apiKey);
    setShowAPIKeyModal(false);
    handleGenerateSummary();
  };

  return (
    <>
      <div className="h-full bg-white rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating || !pdfText}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'AI Summary'}
          </button>
        </div>
        <div className="flex-1 p-4 min-h-0">
          <textarea
            value={document.summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            className="w-full h-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add a summary for this document..."
          />
        </div>
      </div>
      <APIKeyModal
        isOpen={showAPIKeyModal}
        onSubmit={handleAPIKeySubmit}
      />
    </>
  );
};