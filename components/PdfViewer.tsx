import * as React from 'react';
import { useState, useEffect } from 'react';
import { fileName } from './chatbot/Api';

const PdfViewer: React.FC<{ pdfUrl: string}> = ({ pdfUrl }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    const encodedPath = encodeURIComponent(pdfUrl);
    const fileName = pdfUrl.split("/").pop(); 
    setFileUrl('/api/sharepoint/fileurl/'+ encodedPath + '/' + fileName)
  }, [pdfUrl]);

  return (
    <div>
        {fileUrl ? (
            <iframe
            src={`${fileUrl}#view=FitH`} height="700px" width="100%"/>      
        ) : (
            <p>Loading file...</p>
        )}     
    </div>
  );
};

export default PdfViewer;
