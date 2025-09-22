import React, { useCallback, useState } from 'react';
import { Attachment } from '../types';
import { formatFileSize, downloadBlob } from '../utils/helpers';
import { dbGetBlob } from '../services/db';
import { DB_CONFIG } from '../constants';
import FilePreviewModal from './FilePreviewModal';
import { useToast } from '../hooks/useToast';


interface FileListProps {
  currentAttachments: Attachment[];
  newAttachments: {file: File, id: string}[];
  onNewAttachmentsChange: (files: {file: File, id: string}[]) => void;
  onCurrentAttachmentsChange: (attachments: Attachment[]) => void;
  onAttachmentsToRemoveChange: (attachments: Attachment[]) => void;
}

const FileList: React.FC<FileListProps> = ({ currentAttachments, newAttachments, onNewAttachmentsChange, onCurrentAttachmentsChange, onAttachmentsToRemoveChange }) => {
  const { showToast } = useToast();
  const [previewFile, setPreviewFile] = useState<{ name: string; type: string; blob: Blob } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({file, id: crypto.randomUUID()}));
      onNewAttachmentsChange([...newAttachments, ...files]);
    }
  };

  const removeNewAttachment = (index: number) => {
    onNewAttachmentsChange(newAttachments.filter((_, i) => i !== index));
  };
  
  const removeCurrentAttachment = (attachment: Attachment) => {
    onCurrentAttachmentsChange(currentAttachments.filter(a => a.id !== attachment.id));
    onAttachmentsToRemoveChange(prev => [...prev, attachment]);
  };

  const handleDownload = async (attachment: Attachment) => {
    const blob = await dbGetBlob(DB_CONFIG.STORES.ATTACHMENTS, attachment.blobKey);
    if(blob) {
        downloadBlob(blob, attachment.fileName);
    }
  }

  const handlePreviewCurrent = async (attachment: Attachment) => {
    const blob = await dbGetBlob(DB_CONFIG.STORES.ATTACHMENTS, attachment.blobKey);
    if (blob) {
      setPreviewFile({ name: attachment.fileName, type: attachment.mimeType, blob });
    } else {
      showToast('Could not load attachment for preview.', 'error');
    }
  };

  const handlePreviewNew = (file: File) => {
    setPreviewFile({ name: file.name, type: file.type, blob: file });
  };


  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-600 dark:text-gray-400">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>Upload files</span>
              <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
        </div>
      </div>
      {(currentAttachments.length > 0 || newAttachments.length > 0) && (
        <ul className="mt-4 space-y-2">
          {currentAttachments.map(att => (
            <li key={att.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <button type="button" onClick={() => handlePreviewCurrent(att)} className="truncate text-sky-600 dark:text-sky-400 hover:underline text-left" title={`Preview ${att.fileName}`}>
                {att.fileName} <span className="text-gray-500 dark:text-gray-400 text-xs">({formatFileSize(att.sizeBytes)})</span>
              </button>
              <div>
                <button type="button" onClick={() => handleDownload(att)} className="text-blue-500 hover:text-blue-700 mr-2">Download</button>
                <button type="button" onClick={() => removeCurrentAttachment(att)} className="text-red-500 hover:text-red-700">Remove</button>
              </div>
            </li>
          ))}
          {newAttachments.map((att, index) => (
            <li key={att.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/50 rounded">
               <button type="button" onClick={() => handlePreviewNew(att.file)} className="truncate text-sky-600 dark:text-sky-400 hover:underline text-left" title={`Preview ${att.file.name}`}>
                  {att.file.name} <span className="text-gray-500 dark:text-gray-400 text-xs">({formatFileSize(att.file.size)})</span>
               </button>
              <button type="button" onClick={() => removeNewAttachment(index)} className="text-red-500 hover:text-red-700">Remove</button>
            </li>
          ))}
        </ul>
      )}
       <FilePreviewModal 
            isOpen={!!previewFile} 
            onClose={() => setPreviewFile(null)}
            file={previewFile}
        />
    </div>
  );
};

export default FileList;