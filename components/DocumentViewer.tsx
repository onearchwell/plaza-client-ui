import * as React from 'react';
import { Stack, Text } from '@fluentui/react';
import PdfViewer from './PdfViewer'; // The PDF Viewer component
import DocxViewer from './DocxViewer'; // The DOCX Viewer component
import { useEffect, useState } from 'react';

const DocumentViewer: React.FC<{ fileUrl: string|undefined}> = ({ fileUrl }) => {
  const [fileType, setfileType] = useState<string>('pdf');

  // Fetch the DOCX file and convert it to HTML
  useEffect(() => {
    const findDocType = async () => {
      //@ts-ignore
      const extension = fileUrl.split('.').pop()?.toLowerCase();

      if (extension == 'pdf')
        setfileType("pdf")
      else if(extension == 'docx' || extension == 'doc')
        setfileType("doc")
      else if (extension === 'xlsx' || extension === 'xls' || extension === 'xlsm' || extension === 'xlsb') 
        setfileType('excel');
    };
    findDocType();
  }, [fileUrl]);
  return (
    <Stack tokens={{ childrenGap: 20 }}>
      {fileType === 'pdf' ? (
        <DocxViewer docxUrl={fileUrl} />
      ) : fileType === 'doc' ? (
        <DocxViewer docxUrl={fileUrl} />
      ) : fileType === 'excel' ? (
        // <ExcelViewer excelUrl={fileUrl} />
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
