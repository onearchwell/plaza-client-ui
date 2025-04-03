import * as React from 'react';
import {Stack } from '@fluentui/react';

const PdfViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  
  return (
    <Stack 
    tabIndex={0}
    styles={{
        root: {
            width: "100%",
            height: "auto",
            overflow: "auto",
            border: "1px solid #ddd",
            padding: "10px",
            background: "#fff",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }
        }}
      >
      <iframe src={`${pdfUrl}#view=FitH`} height="500" width="1200"/>
    </Stack>
  );
};

export default PdfViewer;
