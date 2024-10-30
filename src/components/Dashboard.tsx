import React from 'react';
import { PDFList } from './PDFList';
import { PDFViewer } from './PDFViewer';
import { Summary } from './Summary';
import { Notes } from './Notes';
import { useAuth } from '../context/AuthContext';
import type { PDFDocument } from '../types';

export const Dashboard: React.FC = () => {
  const { user, driveService } = useAuth();
  const [documents, setDocuments] = React.useState<PDFDocument[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [pdfText, setPdfText] = React.useState<string>('');
  const [hasAPIKey, setHasAPIKey] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const selectedDocument = documents.find((doc) => doc.id === selectedId);

  const syncWithDrive = React.useCallback(async () => {
    if (!driveService) return;

    try {
      setIsSyncing(true);
      const files = await driveService.listPDFs();
      const newDocs: PDFDocument[] = files.map((file: any) => ({
        id: file.id,
        name: file.name,
        url: file.webViewLink,
        summary: '',
        notes: [],
        userId: user?.uid || '',
        isLocal: false
      }));
      setDocuments(prev => [...prev.filter(doc => doc.isLocal), ...newDocs]);
    } catch (error) {
      console.error('Failed to sync with Drive:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [driveService, user]);

  React.useEffect(() => {
    if (user && driveService) {
      syncWithDrive();
    }
  }, [syncWithDrive, user, driveService]);

  const handleFileUpload = async (file: File) => {
    if (driveService) {
      try {
        setIsSyncing(true);
        const uploadedFile = await driveService.uploadPDF(file);
        const newDoc: PDFDocument = {
          id: uploadedFile.id,
          name: uploadedFile.name,
          url: uploadedFile.webViewLink,
          summary: '',
          notes: [],
          userId: user?.uid || '',
          isLocal: false
        };
        setDocuments(prev => [...prev, newDoc]);
        setSelectedId(newDoc.id);
        setPdfText('');
      } catch (error) {
        console.error('Failed to upload file to Drive:', error);
      } finally {
        setIsSyncing(false);
      }
    } else {
      const fileUrl = URL.createObjectURL(file);
      const newDoc: PDFDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        url: fileUrl,
        summary: '',
        notes: [],
        userId: '',
        isLocal: true
      };
      setDocuments(prev => [...prev, newDoc]);
      setSelectedId(newDoc.id);
      setPdfText('');
    }
  };

  const handleSummaryChange = (summary: string) => {
    if (!selectedId) return;
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedId ? { ...doc, summary } : doc
      )
    );
  };

  const handleAddNote = (content: string) => {
    if (!selectedId) return;
    const newNote = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedId
          ? { ...doc, notes: [...doc.notes, newNote] }
          : doc
      )
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedId) return;
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedId
          ? { ...doc, notes: doc.notes.filter((note) => note.id !== noteId) }
          : doc
      )
    );
  };

  const handleTextExtracted = (text: string) => {
    setPdfText(text);
  };

  const handleSetAPIKey = (apiKey: string) => {
    localStorage.setItem('openai_api_key', apiKey);
    setHasAPIKey(true);
  };

  return (
    <div className="h-full flex bg-gray-100">
      <PDFList
        documents={documents}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onUpload={handleFileUpload}
        isSyncing={isSyncing}
        onRefresh={syncWithDrive}
        isLoggedIn={!!user}
      />
      
      {selectedDocument ? (
        <div className="flex-1 p-6 overflow-hidden grid grid-cols-[1fr,1fr] gap-6">
          <div className="flex flex-col gap-6 min-h-0">
            <div className="flex-1 min-h-0">
              <Summary
                document={selectedDocument}
                onSummaryChange={handleSummaryChange}
                pdfText={pdfText}
                onSetAPIKey={handleSetAPIKey}
                hasAPIKey={hasAPIKey}
              />
            </div>
            <div className="flex-1 min-h-0">
              <Notes
                notes={selectedDocument.notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            </div>
          </div>
          <div className="min-h-0">
            <PDFViewer 
              url={selectedDocument.url}
              onTextExtracted={handleTextExtracted}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>PDFファイルを選択またはアップロードしてください</p>
        </div>
      )}
    </div>
  );
};