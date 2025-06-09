import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { TextContent } from 'pdfjs-dist/types/src/display/api';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  onTextExtracted: (text: string) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, onTextExtracted }) => {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const extractedTextRef = React.useRef<string[]>([]);

  const onDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    extractedTextRef.current = [];
  };

  const onPageLoadSuccess = async ({ pageNumber, textContent }: { pageNumber: number; textContent: TextContent }) => {
    if (textContent) {
      const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
      const newText = extractedTextRef.current;
      newText[pageNumber - 1] = pageText;
      if (newText.filter(Boolean).length === numPages) {
        const fullText = newText.join('\n');
        onTextExtracted(fullText);
      }
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-white rounded-lg shadow-sm p-4">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
      >
        <Page
          pageNumber={pageNumber}
          className="mb-4 shadow-lg"
          renderTextLayer={true}
          renderAnnotationLayer={true}
          onLoadSuccess={onPageLoadSuccess}
        />
      </Document>
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
          >
            Next
          </button>
      </div>
    </div>
  );
};