"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"; // Import the specific icon
import { useEffect, useRef, useState } from "react";
import { currentTimeCzechia } from "../utils/helper";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import "./style.css";
enum SenderEnum {
    Assistent = "assistant",
    User = "user",
}

type SenderType = SenderEnum.Assistent | SenderEnum.User;

interface ChatProps {
    type: SenderType;
    message: string;
    date: string | number;
}

const Chat = () => {
    const params = useParams<{ collectionName: string }>();

    const [isTyping, setIsTyping] = useState(false);

    const [messages, setMessages] = useState<ChatProps[]>([]);
    const [input, setInput] = useState<string>("");

    useEffect(() => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
        };

        const currentDate = new Date();
        console.log(currentDate.toLocaleDateString("cs-CS", options));
        //Freitag, 2. Juli 2021
        if (messages.length === 0) {
            setMessages([
                {
                    type: SenderEnum.Assistent,
                    message: `Hello, I am an AI assistant. How can I help you in document collection?`,
                    date: currentTimeCzechia(),
                },
            ]);
        }
    }, [params.collectionName]);

    const lastMessageRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
            console.log(lastMessageRef.current);
        }
    }, [messages]); // Runs when messages update

    const handleChat = async () => {
        setIsTyping(true);
        const msgs = [...messages, { type: SenderEnum.User, message: input, date: currentTimeCzechia() }];
        setMessages(msgs);
        setInput("");

        const apiMessages = msgs.map((msg) => {
            if (msg.type === SenderEnum.User) {
                return {
                    role: SenderEnum.User,
                    content: msg.message,
                };
            } else {
                return {
                    role: SenderEnum.Assistent,
                    content: msg.message,
                };
            }
        });

        try {
            const response = await fetch(`${process.env.SERVER_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    role: "user",
                    collectionName: params.collectionName,
                    message: [...apiMessages],
                }),
            });

            const data = await response.json();

            setMessages((prev) => [...prev, { type: SenderEnum.Assistent, message: data.message, date: new Date().toLocaleTimeString() }]);
        } catch (error) {
            console.log(error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="bg-gray-700 h-[100vh]">
            <div className={`flex justify-start gap-2.5 rounded bg-blue-gray-400  flex-col h-[92vh] overflow-y-auto `}>
                <div className="fixed top-0 w-full  bg-gray-800 p-4 ">
                    <h3 className="text-white">{params.collectionName}</h3>
                </div>

                <div className="w-4/5 mx-auto">
                    {messages.map((msg, index) => (
                        <div className={`p-4 flex flex-col w-full ${msg.type == SenderEnum.Assistent ? "items-start" : "items-end"}`} key={index}>
                            <img
                                className="w-8 h-8 rounded-full m-2"
                                src={`${
                                    msg.type === SenderEnum.Assistent
                                        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXjdFdSaE2EGhsiJ-efscXpSV1mUgBR-shCA&s"
                                        : "https://www.dominikwojnar.cz/favicon.png"
                                }`}
                                alt="image"
                            />
                            <div
                                className={`flex flex-col w-full ${
                                    msg.type == SenderEnum.Assistent ? "items-start" : "items-end"
                                }  max-w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-500`}
                            >
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.type}</span>
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{msg.date}</span>
                                </div>

                                <div
                                    className="markdown-content text-sm font-normal py-2.5 text-gray-900 dark:text-white"
                                    ref={index === messages.length - 1 ? lastMessageRef : null} // Attach ref to last message
                                >
                                    <ReactMarkdown>{msg.message}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="sticky bottom-2 px-4 left-0">
                            <img
                                src="https://assets-v2.lottiefiles.com/a/88006af4-1185-11ee-a2bd-9f5d516c6482/nwsyoDcISP.gif"
                                className="w-12"
                                alt="imga-2"
                            />
                        </div>
                    )}

                    <div className="fixed bottom-3 flex justify-between items-center w-1/2 gap-2 mt-auto h-[8vh] p-4">
                        <input
                            type="text"
                            placeholder="Type a message"
                            className=" p-4 border-gray-200 bg-gray-100 rounded-e-xl w-full rounded-es-xl dark:bg-gray-500"
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            value={input}
                        />
                        <button onClick={handleChat} className="flex items-center">
                            <FontAwesomeIcon icon={faPaperPlane} size="sm" className="bg-white w-4 h-4 p-3 rounded-full text-black" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
