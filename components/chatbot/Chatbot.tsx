import React, { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaMicrophone } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import { RiCloseLargeLine } from "react-icons/ri";
import { BsSendFill } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import { callApi, docIDPath, fileName } from './Api';
import { v4 as uuid } from 'uuid';
// import './Chat.css';
import { LoadingIcon } from './utils/LoadingIcon';
// import plazaHeaderGreen from '../assets/plaza-header-green.png';

type Citation = {
  content: string;
  title: string;
  url: string;
  filepath: string;
  chunk_id: string;
  DocumentID: string;
};

type Usage = {
  completion_tokens: number,
  prompt_tokens: number,
  total_tokens: number,
  completion_tokens_details: null,
  prompt_tokens_details: null
};

type Message = {
  user: string,
  text: string
};

const Chatbot = ({permission}) => {
  const [messages, setMessages] = useState<Message[]>([{ user: 'bot', text: JSON.stringify({"choices": [{"message": {"content": 'How can I assist you today?'}}]})}]);
  const [input, setInput] = useState('');
  const [toggle, setToggle] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isSpeechIconDisabled, setIsSpeechIconDisabled] = useState(false);
  const [sessionId, setSessionId] = useState<string>(uuid());

  const chatBoxRef = useRef(null);
  //@ts-ignore
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Add these refs at the top of your component
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const topLeftCornerResizeHandleRef = useRef<HTMLDivElement>(null);

  const topResizeHandleRef = useRef<HTMLDivElement>(null);
  const leftResizeHandleRef = useRef<HTMLDivElement>(null);

  // Add this useEffect hook
  // Update the resize useEffect hook
useEffect(() => {
  if (!toggle) return;

  const container = chatContainerRef.current;
  const handle = topLeftCornerResizeHandleRef.current;
  if (!container || !handle) return;

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = container.offsetWidth;
    const initialHeight = container.offsetHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX; // Negative when dragging left
      const deltaY = startY - e.clientY; // Negative when dragging up

      const newWidth = Math.max(300, initialWidth + deltaX);
      const newHeight = Math.max(400, initialHeight + deltaY);

      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  handle.addEventListener('mousedown', handleMouseDown);

  return () => {
    handle.removeEventListener('mousedown', handleMouseDown);
  };
}, [toggle]);

useEffect(() => {
  if (!toggle) return;

  const container = chatContainerRef.current;
  const topHandle = topResizeHandleRef.current;
  if (!container || !topHandle) return;

  const handleTopMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const initialHeight = container.offsetHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY;
      const newHeight = Math.max(400, initialHeight + deltaY);

      container.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  topHandle.addEventListener('mousedown', handleTopMouseDown);

  return () => {
    topHandle.removeEventListener('mousedown', handleTopMouseDown);
  };
}, [toggle]);

useEffect(() => {
  if (!toggle) return;

  const container = chatContainerRef.current;
  const leftHandle = leftResizeHandleRef.current;
  if (!container || !leftHandle) return;

  const handleLeftMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const initialWidth = container.offsetWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX;
      const newWidth = Math.max(300, initialWidth + deltaX);

      container.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  leftHandle.addEventListener('mousedown', handleLeftMouseDown);

  return () => {
    leftHandle.removeEventListener('mousedown', handleLeftMouseDown);
  };
}, [toggle]);


  useEffect(() => {
    if (chatBoxRef.current) {
      //@ts-ignore
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, toggle]);

  useEffect(() => {
    //@ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognitionRef.current) {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition activated. Try speaking into the microphone.');
        setIsListening(true);
      };
      //@ts-ignore
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        console.log("transcript ", transcript);
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition turned off.');
        setIsListening(false);
      };
      //@ts-ignore
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const handleSendMessages = async () => {
    
    setIsSpeechIconDisabled(true);
    recognitionRef.current?.stop();
    setInput('');
    setIsListening(false);

    if (input.trim()) {
      setIsBotTyping(true);
      console.log(input);
      setMessages(messages => [...messages, { user: 'user', text: input }]);
      console.log("permission", permission); 
      const apiResponse = await callApi(input.trim(), permission, sessionId);
      console.log("apiResponse", apiResponse);
      if (apiResponse) {
        setMessages(prevMessages => [
          ...prevMessages,
          { user: 'bot', text: JSON.stringify(apiResponse) }
        ]);
      }
      setIsBotTyping(false);
      console.log("payload", messages);
    }
    setIsSpeechIconDisabled(false);
  };

  const clearConversation = () => {
    setMessages([{ user: 'bot', text: JSON.stringify({"choices": [{"message": {"content": 'How can I assist you today?'}}]})}]);
  };

  const handleSpeech = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      await handleSendMessages();
    } else {
      setInput(""); // clear previous input
      setTimeout(() => {
        recognitionRef.current?.start();
      }, 200);
      setIsListening(true);
    }
  };

  const headerChatbot = () => {
    return (
      <div className='headerChatbot'> 
              {/* <img src={plazaImage} alt="Plaza Home Mortgage" className='logo' /> */}
              <img src='/images/plaza-header-green.png' alt="plaza header" className="plazaHeaderLogo"/>

              {/* <Image src="/images/plaza-logo.png" alt="" width={150} height={60} className="h-auto" /> */}

            <div>
              <button className = "deleteIcon" >
                    <MdDelete onClick={clearConversation} />
              </button>
              <button className= "closeIcon">
                <RiCloseLargeLine onClick={() => setToggle(!toggle)} />
              </button>
            </div>

      </div>
    )
  }

  const DisclaimerChatbot = () => {
    return (
      <div className="disclaimer">
      <small>
      Disclaimer: This content was generated using AI. While we strive for accuracy, we encourage users to verify important information. We use AI-generated content to increase efficiencies and provide certain insights, but it may not reflect human expertise or opinion.
      </small>
      </div>
    )
  }

  const footerChatbot = () => {
    return (
      <div className='footerChatbot'>
            <input
              className='input'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessages()}
              placeholder={isListening ? "Listening..." : "Type your message..."}
            />
            <button onClick={handleSendMessages} className="sendButton">
              <BsSendFill/>
            </button>
            <div className="tooltip-container"
              // onMouseEnter={() => setIsHovered(true)}
              // onMouseLeave={() => setIsHovered(false)}
            >
              <button 
                onClick={handleSpeech} 
                disabled={isSpeechIconDisabled} 
                className={`micButton ${isListening ? "listening" : "notListening"}`} 
              >
                <FaMicrophone />
              </button>
              
              {(<div className="tooltip">
                {isListening ? "Click again to stop" : "Click to start"}
              </div>)}
              
            </div>
      </div>
    )
  }

  const botMsg = (message: Message) => {
    return (
      <div>
      <ReactMarkdown>{JSON.parse(message.text).choices[0]?.message?.content}</ReactMarkdown>
      {JSON.parse(message.text).choices[0]?.message?.context?.citations && JSON.parse(message.text).choices[0]?.message?.context?.citations.length > 0 && (
        <details>
          <summary>References</summary>
          <ol className="list-decimal ml-6 space-y-2">
            {JSON.parse(message.text).choices[0]?.message?.context?.citations.map((citation: Citation, i: number) => (
              <li key={i}>
                <div><strong>{fileName(citation.filepath)}</strong></div>
                <div>
                - <a 
                  href={docIDPath(citation.DocumentID)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  File
                </a>
                </div>
              </li>
            ))}
          </ol>
        </details>
      )
      }
    </div>
    )
  }
  
  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        onClick={() => setToggle(!toggle)}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#970067',
          color: 'white',
          padding: '10px 12px',
          borderRadius: '8px',
          gap: '20px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        <span>Got Questions?</span>
        <FaCommentDots size={22} />
      </div>
 
      {toggle && (
        <div className="chatContainer" ref={chatContainerRef}>
          <div className="resize-handle corner-handle" ref={topLeftCornerResizeHandleRef}></div>
          <div className="resize-handle top-handle" ref={topResizeHandleRef}></div>
          <div className="resize-handle left-handle" ref={leftResizeHandleRef}></div>
          {headerChatbot()}
            <div className="chatBox" ref={chatBoxRef}>
              {messages.map((message, index) => (
                <div
                  className={message.user === "bot" ? "botMessage" : "userMessage"}
                  key={index}
                >
                  {message.user === "bot" ? (
                    botMsg(message)
                  ) : (
                    <>
                        <div>
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                        
                    </>
                  )}
                </div>
              ))}
              {isBotTyping && <LoadingIcon />}
            </div>

          {footerChatbot()}
          {DisclaimerChatbot()}
        </div>
      )}
    </div>
  );
};
 
export default Chatbot;
