import * as React from "react";
import { useEffect, useRef, useState } from "react";
import * as docx from "docx-preview"; // Import as a module
import { PrimaryButton, Stack } from "@fluentui/react";

const DocxViewer: React.FC<{ docxUrl: string, mimeType: string }> = ({ docxUrl, mimeType }) => {

  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const downloadAndDisplayFile = async () => {
        try {
            console.log("Fetching DocX :",docxUrl, mimeType)
            const response = await fetch('/api/sharepoint/file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': mimeType,
                },
                body: JSON.stringify({ url: docxUrl, accept: mimeType})
            });

            if (response.ok) {
                // Create a blob from the file content and set the URL
                const fileBlob = await response.blob();
                setFileBlob(fileBlob);
                const arrayBuffer = await fileBlob.arrayBuffer();

                if (containerRef.current) {
                  containerRef.current.innerHTML = ""; // Clear old content
                  await docx.renderAsync(arrayBuffer, containerRef.current); // No need for third argument
                }
            } else {
                console.error('Error downloading file:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    downloadAndDisplayFile();
  }, [docxUrl]);

  const handleDownload = () => {
    if (fileBlob) {
      console.log("Downloading")
      const fileName = docxUrl.split("/").pop(); // Extract file name from URL
      const link = document.createElement('a');
      link.href = URL.createObjectURL(fileBlob);
      link.download = fileName || "downloaded-file.docx"; // Default name if not available
      link.click();
    }
  };

  return (
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
     <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "10px",
        }}
      >
              <PrimaryButton onClick={handleDownload}
                    iconProps={{ iconName: 'Download' }} 
                    styles={{
                      root: {
                        backgroundColor: 'white',
                        borderColor: '#970067',
                        color: '#970067',
                        borderRadius: '5px',
                        minHeight: '30px',
                        minWidth: '30px',
                        padding: '1px 1px'
                      },
                      rootHovered: {
                        backgroundColor: '#7a0053',
                        borderColor: '#7a0053'
                      },
                      rootPressed: {
                        borderColor: '#5e003f'
                      }
                    }}
                  >
                  </PrimaryButton>
          </div>
      <div ref={containerRef} />
    </Stack>
  );
};

export default DocxViewer;