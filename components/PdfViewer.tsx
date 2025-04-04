import * as React from 'react';
import {PrimaryButton, Stack } from '@fluentui/react';
import { useState, useEffect } from 'react';

const PdfViewer: React.FC<{ pdfUrl: string, mimeType: string }> = ({ pdfUrl, mimeType }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
      const downloadAndDisplayFile = async () => {
          try {
              console.log("Fetching PDF :",pdfUrl, mimeType)
              const response = await fetch('/api/sharepoint/file', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Accept': mimeType,
                  },
                  body: JSON.stringify({ url: pdfUrl, accept: mimeType})
              });

              if (response.ok) {
                  // Create a blob from the file content and set the URL
                  const fileBlob = await response.blob();
                  const fileObjectUrl = URL.createObjectURL(fileBlob);
                  setFileUrl(fileObjectUrl);
              } else {
                  console.error('Error downloading file:', response.statusText);
              }
          } catch (error) {
              console.error('Error:', error);
          }
      };

      downloadAndDisplayFile();
  }, [pdfUrl]);
  
    function openInNewTab(): void {
        throw new Error('Function not implemented.');
    }

  return (
      <div>
            {fileUrl ? (
                <iframe
                src={`${fileUrl}#view=FitH`} height="700px" width="100%"/>
                
            ) : (
                <p>Loading file...</p> // Show loading message while file is being fetched
            )}
            
        </div>
  );
};

export default PdfViewer;
