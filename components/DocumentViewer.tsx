import * as React from 'react';
import { IStackStyles, Stack, Text } from '@fluentui/react';
import PdfViewer from './PdfViewer'; // The PDF Viewer component
import DocxViewer from './DocxViewer'; // The DOCX Viewer component
import { useEffect, useState } from 'react';

const stackfontStyles: IStackStyles = {
  root: {
    width: "90%",
    height: "90%",
  },
};

const DocumentViewer: React.FC<{ fileUrl: string}> = ({ fileUrl }) => {
  const [fileType, setfileType] = useState<string>('unknown');
  const [mimeType, setMimeType] = useState<string>('application/octet-stream');

  // Fetch the DOCX file and convert it to HTML
  useEffect(() => {
    const findDocType = async () => {
      const extension = fileUrl.split('.').pop()?.toLowerCase().toLowerCase();
      console.log("In DocumentViewer :", extension, fileUrl)

      switch (extension) {
          case 'pdf':
            setfileType("pdf")
            setMimeType('application/pdf')
            break;
          case 'doc':
              setfileType("doc")
              setMimeType('application/msword')
              break;
          case 'docx':
              setfileType("doc")
              setMimeType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
              break;
          case 'xls':
              setfileType("excel")
              setMimeType('application/vnd.ms-excel')
              break;
          case 'xlsx':
              setfileType("excel")
              setMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
              break;
          default:
              setfileType("unknown")
              setMimeType('application/octet-stream')
              break;
      }
    };
    findDocType();
  }, [fileUrl]);
  return (
    <Stack tokens={{ childrenGap: 20 }} styles={stackfontStyles}>
      {fileType === 'pdf' ? (
        <PdfViewer pdfUrl={fileUrl} mimeType={mimeType}/>
      ) : fileType === 'doc' ? (
        <DocxViewer docxUrl={fileUrl} mimeType={mimeType}/>
      ) : (
        <Stack
          tabIndex={0}
          className="docx-container"
          styles={{
          root: {
            width: "100%",
            height: "500px",
            overflow: "auto",
            border: "1px solid #ddd",
            padding: "1px",
            background: "#fff",
          },
        }}
        >
          <Text variant="medium">To access this document, please click the download button at the top right.</Text>
        </Stack>
      )}
    </Stack>
  );
};

export default DocumentViewer;
