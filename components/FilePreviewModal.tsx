import React, { useEffect, useState } from 'react';
import Modal from './ui/Modal';
import { downloadBlob } from '../utils/helpers';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: { name: string; type: string; blob: Blob } | null;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, file }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      const url = URL.createObjectURL(file.blob);
      setFileUrl(url);

      if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTextContent(e.target?.result as string);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setTextContent('Could not read file content.');
          setIsLoading(false);
        };
        reader.readAsText(file.blob);
      } else {
        setIsLoading(false);
      }

      return () => {
        URL.revokeObjectURL(url);
        setFileUrl(null);
        setTextContent(null);
      };
    }
  }, [file]);

  if (!isOpen || !file) {
    return null;
  }

  const handleDownload = () => {
    downloadBlob(file.blob, file.name);
  };

  const renderPreview = () => {
    if (isLoading) return <p>Loading preview...</p>;
    if (!fileUrl) return <p>Could not load file.</p>;

    const mimeType = file.type;

    if (mimeType.startsWith('image/')) {
      return <img src={fileUrl} alt={file.name} className="max-w-full max-h-[70vh] object-contain mx-auto" />;
    }
    if (mimeType === 'application/pdf') {
      return <iframe src={fileUrl} title={file.name} className="w-full h-[75vh]" />;
    }
    if (mimeType.startsWith('audio/')) {
      return <audio controls src={fileUrl} className="w-full">Your browser does not support the audio element.</audio>;
    }
    if (mimeType.startsWith('video/')) {
      return <video controls src={fileUrl} className="max-w-full max-h-[70vh]">Your browser does not support the video element.</video>;
    }
    if (mimeType.startsWith('text/')) {
      return <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm max-h-[70vh] overflow-auto">{textContent}</pre>;
    }

    return (
      <div className="text-center p-8">
        <p>Preview is not available for this file type ({mimeType}).</p>
        <button onClick={handleDownload} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
          Download File
        </button>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${file.name}`} className="max-w-4xl">
      <div className="min-h-[50vh] flex items-center justify-center">
        {renderPreview()}
      </div>
        <footer className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-200 dark:border-gray-800">
            <button type="button" onClick={handleDownload} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Download
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
            Close
            </button>
        </footer>
    </Modal>
  );
};

export default FilePreviewModal;
