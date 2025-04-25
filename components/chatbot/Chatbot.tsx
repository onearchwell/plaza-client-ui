"use client"

import { useState, useEffect, useRef } from "react"
import { FaCommentDots, FaMicrophone } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { RiCloseLargeLine } from "react-icons/ri"
import { BsSendFill } from "react-icons/bs"
import ReactMarkdown from "react-markdown"
import { callApi, docIDPath, fileName } from "./Api"
import { v4 as uuid } from "uuid"
// import './Chat.css';
import { LoadingIcon } from "./utils/LoadingIcon"
// import plazaHeaderGreen from '../assets/plaza-header-green.png';

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }
  interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {
    item(index: number): SpeechRecognitionResult
  }
  interface SpeechRecognitionResult extends EventTarget {
    readonly transcript: string
    readonly confidence: number
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string
  }
}

type Citation = {
  content: string
  title: string
  url: string
  filepath: string
  chunk_id: string
  DocumentID: string
}

type Usage = {
  completion_tokens: number
  prompt_tokens: number
  total_tokens: number
  completion_tokens_details: null
  prompt_tokens_details: null
}

type Message = {
  user: string
  text: string
}

const Chatbot = ({ permission }) => {
  const [messages, setMessages] = useState<Message[]>([
    { user: "bot", text: JSON.stringify({ choices: [{ message: { content: "How can I assist you today?" } }] }) },
  ])
  const [input, setInput] = useState("")
  const [toggle, setToggle] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [isSpeechIconDisabled, setIsSpeechIconDisabled] = useState(false)
  const [sessionId, setSessionId] = useState<string>(uuid())
  const [chatSize, setChatSize] = useState({ width: 400, height: 500 })

  const chatBoxRef = useRef(null)
  //@ts-ignore
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Simplified resize approach - no separate refs for handles
  useEffect(() => {
    if (!toggle) return

    const container = chatContainerRef.current
    if (!container) return

    // Function to create and append a resize handle
    const createResizeHandle = (position: string) => {
      const handle = document.createElement("div")
      handle.className = `resize-handle ${position}-handle`

      // Set appropriate styles based on position
      switch (position) {
        case "top":
          handle.style.cssText = "cursor: ns-resize; position: absolute; top: 0; left: 0; right: 0; height: 6px;"
          break
        case "left":
          handle.style.cssText = "cursor: ew-resize; position: absolute; top: 0; left: 0; bottom: 0; width: 6px;"
          break
        case "corner":
          handle.style.cssText = "cursor: nwse-resize; position: absolute; top: 0; left: 0; width: 12px; height: 12px;"
          break
      }

      container.appendChild(handle)
      return handle
    }

    // Create handles
    const topHandle = createResizeHandle("top")
    const leftHandle = createResizeHandle("left")
    const cornerHandle = createResizeHandle("corner")

    // Function to handle resize
    const handleResize = (e: MouseEvent, resizeFunc: (e: MouseEvent) => void) => {
      e.preventDefault()
      e.stopPropagation()

      // Add a transparent overlay to prevent mouse events from being captured by other elements
      const overlay = document.createElement("div")
      overlay.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; cursor: inherit;"
      document.body.appendChild(overlay)

      // Store original cursor
      const originalCursor = document.body.style.cursor

      // Set cursor based on the handle being used
      if (e.target === topHandle) document.body.style.cursor = "ns-resize"
      else if (e.target === leftHandle) document.body.style.cursor = "ew-resize"
      else if (e.target === cornerHandle) document.body.style.cursor = "nwse-resize"

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        resizeFunc(e)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = originalCursor
        document.body.removeChild(overlay)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    // Attach event listeners
    topHandle.addEventListener("mousedown", (e) => {
      const startY = e.clientY
      const startHeight = container.offsetHeight

      handleResize(e, (e) => {
        const newHeight = Math.max(400, startHeight + (startY - e.clientY))
        container.style.height = `${newHeight}px`
        setChatSize((prev) => ({ ...prev, height: newHeight }))
      })
    })

    leftHandle.addEventListener("mousedown", (e) => {
      const startX = e.clientX
      const startWidth = container.offsetWidth

      handleResize(e, (e) => {
        const newWidth = Math.max(300, startWidth + (startX - e.clientX))
        container.style.width = `${newWidth}px`
        setChatSize((prev) => ({ ...prev, width: newWidth }))
      })
    })

    cornerHandle.addEventListener("mousedown", (e) => {
      const startX = e.clientX
      const startY = e.clientY
      const startWidth = container.offsetWidth
      const startHeight = container.offsetHeight

      handleResize(e, (e) => {
        const newWidth = Math.max(300, startWidth + (startX - e.clientX))
        const newHeight = Math.max(400, startHeight + (startY - e.clientY))
        container.style.width = `${newWidth}px`
        container.style.height = `${newHeight}px`
        setChatSize({ width: newWidth, height: newHeight })
      })
    })

    // Set initial size
    container.style.width = `${chatSize.width}px`
    container.style.height = `${chatSize.height}px`

    // Cleanup function
    return () => {
      if (container.contains(topHandle)) container.removeChild(topHandle)
      if (container.contains(leftHandle)) container.removeChild(leftHandle)
      if (container.contains(cornerHandle)) container.removeChild(cornerHandle)
    }
  }, [toggle, chatSize])

  useEffect(() => {
    if (chatBoxRef.current) {
      //@ts-ignore
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages, toggle])

  useEffect(() => {
    //@ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = SpeechRecognition ? new SpeechRecognition() : null

    if (recognitionRef.current) {
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => {
        console.log("Voice recognition activated. Try speaking into the microphone.")
        setIsListening(true)
      }
      //@ts-ignore
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        console.log("transcript ", transcript)
      }

      recognitionRef.current.onend = () => {
        console.log("Voice recognition turned off.")
        setIsListening(false)
      }
      //@ts-ignore
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }
    }
  }, [])

  const handleSendMessages = async () => {
    setIsSpeechIconDisabled(true)
    recognitionRef.current?.stop()
    setInput("")
    setIsListening(false)

    if (input.trim()) {
      setIsBotTyping(true)
      console.log(input)
      setMessages((messages) => [...messages, { user: "user", text: input }])
      console.log("permission", permission)
      const apiResponse = await callApi(input.trim(), permission, sessionId)
      console.log("apiResponse", apiResponse)
      if (apiResponse) {
        setMessages((prevMessages) => [...prevMessages, { user: "bot", text: JSON.stringify(apiResponse) }])
      }
      setIsBotTyping(false)
      console.log("payload", messages)
    }
    setIsSpeechIconDisabled(false)
  }

  const clearConversation = () => {
    setMessages([
      { user: "bot", text: JSON.stringify({ choices: [{ message: { content: "How can I assist you today?" } }] }) },
    ])
  }

  const handleSpeech = async () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser")
      return
    }

    if (isListening) {
      await handleSendMessages()
    } else {
      setInput("") // clear previous input
      setTimeout(() => {
        recognitionRef.current?.start()
      }, 200)
      setIsListening(true)
    }
  }

  const headerChatbot = () => {
    return (
      <div className="headerChatbot">
        {/* <img src={plazaImage || "/placeholder.svg"} alt="Plaza Home Mortgage" className='logo' /> */}
        <img src="/images/plaza-header-green.png" alt="plaza header" className="plazaHeaderLogo" />

        {/* <Image src="/images/plaza-logo.png" alt="" width={150} height={60} className="h-auto" /> */}

        <div>
          <button className="deleteIcon">
            <MdDelete onClick={clearConversation} />
          </button>
          <button className="closeIcon">
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
          Disclaimer: This content was generated using AI. While we strive for accuracy, we encourage users to verify
          important information. We use AI-generated content to increase efficiencies and provide certain insights, but
          it may not reflect human expertise or opinion.
        </small>
      </div>
    )
  }

  const footerChatbot = () => {
    return (
      <div className="footerChatbot">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessages()}
          placeholder={isListening ? "Listening..." : "Type your message..."}
        />
        <button onClick={handleSendMessages} className="sendButton">
          <BsSendFill />
        </button>
        <div
          className="tooltip-container"
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

          {<div className="tooltip">{isListening ? "Click again to stop" : "Click to start"}</div>}
        </div>
      </div>
    )
  }

  const botMsg = (message: Message) => {
    return (
      <div>
        <ReactMarkdown>{JSON.parse(message.text).choices[0]?.message?.content}</ReactMarkdown>
        {JSON.parse(message.text).choices[0]?.message?.context?.citations &&
          JSON.parse(message.text).choices[0]?.message?.context?.citations.length > 0 && (
            <details>
              <summary>References</summary>
              <ol className="list-decimal ml-6 space-y-2">
                {JSON.parse(message.text).choices[0]?.message?.context?.citations.map(
                  (citation: Citation, i: number) => (
                    <li key={i}>
                      <div>
                        <strong>{fileName(citation.filepath)}</strong>
                      </div>
                      <div>
                        -{" "}
                        <a href={docIDPath(citation.DocumentID)} target="_blank" rel="noopener noreferrer">
                          File
                        </a>
                      </div>
                    </li>
                  ),
                )}
              </ol>
            </details>
          )}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div
        onClick={() => setToggle(!toggle)}
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#970067",
          color: "white",
          padding: "10px 12px",
          borderRadius: "8px",
          gap: "20px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        <span>Got Questions?</span>
        <FaCommentDots size={22} />
      </div>

      {toggle && (
        <div
          className="chatContainer"
          ref={chatContainerRef}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: `${chatSize.width}px`,
            height: `${chatSize.height}px`,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {headerChatbot()}
          <div className="chatBox" ref={chatBoxRef}>
            {messages.map((message, index) => (
              <div className={message.user === "bot" ? "botMessage" : "userMessage"} key={index}>
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
  )
}

export default Chatbot
