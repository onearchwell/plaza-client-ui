import * as React from 'react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {Stack } from '@fluentui/react';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import "react-pdf/dist/esm/Page/AnnotationLayer.css";


const PdfViewer: React.FC<{ pdfUrl: string|undefined }> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number>(0);

  // Callback function for when the PDF is loaded
  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    console.log(numPages)
  }
  
  return (
    <Stack 
    tabIndex={0}
    styles={{
        root: {
            width: "100%",
            height: "500px",
            overflow: "auto",
            border: "1px solid #ddd",
            padding: "10px",
            background: "#fff",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }
        }}
      >
      <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} onLoadError={(error) => console.error('Error loading PDF:', error)}>
        <Page pageNumber={1} renderAnnotationLayer={true} />
      </Document>
    </Stack>
  );
};

export default PdfViewer;
