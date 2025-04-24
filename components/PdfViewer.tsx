import * as React from 'react';
import { useState, useEffect } from 'react';

const PdfViewer: React.FC<{ pdfUrl: string, fileBlob: Blob }> = ({ pdfUrl, fileBlob }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if(fileBlob) {
        const downloadAndDisplayFile = async () => {
          const fileName = pdfUrl.split("/").pop(); 
            const namedFile = new File([fileBlob], fileName, { type: fileBlob.type });
            // console.log(namedFile)
            const fileObjectUrl = URL.createObjectURL(namedFile);
            // console.log(fileObjectUrl)
            setFileUrl(fileObjectUrl);
            return () => {
              URL.revokeObjectURL(fileObjectUrl);
            };
        };
        downloadAndDisplayFile();
    }
  }, [fileBlob]);

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
