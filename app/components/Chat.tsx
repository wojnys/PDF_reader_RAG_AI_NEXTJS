"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faClose, faMessage, faPaperPlane } from "@fortawesome/free-solid-svg-icons"; // Import the specific icon
import { useEffect, useRef, useState } from "react";
import { type } from "os";
import { currentTimeCzechia } from "../utils/helper";

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
    const [isOpen, setIsOpen] = useState(true);
    const [isTyping, setIsTyping] = useState(false);

    const [messages, setMessages] = useState<ChatProps[]>([]);
    const [input, setInput] = useState<string>("");

    useEffect(() => {
        const options: any = { weekday: "long", year: "numeric", month: "short", day: "numeric" };

        const currentDate = new Date();
        console.log(currentDate.toLocaleDateString("cs-CS", options));
        //Freitag, 2. Juli 2021
        if (messages.length === 0) {
            setMessages([{ type: SenderEnum.Assistent, message: "Hello, I am an AI assistant. How can I help you?", date: currentTimeCzechia() }]);
        }
    }, []);

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

        let apiMessages = msgs.map((msg) => {
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
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    role: "user",
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
        <>
            {isOpen && (
                <div
                    className={`fixed bottom-4 right-4 flex justify-start gap-2.5 rounded bg-blue-gray-400 w-[500px] flex-col h-[50vh] overflow-y-auto bg-neutral-200 `}
                >
                    <div className="sticky top-2 right-0 px-3 w-full flex justify-end">
                        <FontAwesomeIcon
                            icon={faClose}
                            size="sm"
                            className="bg-red-400 w-[15px] h-[15px] p-2  rounded-full cursor-pointer"
                            onClick={() => setIsOpen(!isOpen)}
                        />
                    </div>

                    {messages.map((msg, index) => (
                        <div className={`p-4 flex flex-col w-full ${msg.type == SenderEnum.Assistent ? "items-start" : "items-end"}`} key={index}>
                            <img
                                className="w-8 h-8 rounded-full m-2"
                                src={`${
                                    msg.type === SenderEnum.Assistent
                                        ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXjdFdSaE2EGhsiJ-efscXpSV1mUgBR-shCA&s"
                                        : "https://www.dominikwojnar.cz/favicon.png"
                                }`}
                                alt="Jese image"
                            />
                            <div
                                className={`flex flex-col w-full ${
                                    msg.type == SenderEnum.Assistent ? "items-start" : "items-end"
                                }  max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-500`}
                            >
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{msg.type}</span>
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{msg.date}</span>
                                </div>

                                <p
                                    className="text-sm font-normal py-2.5 text-gray-900 dark:text-white"
                                    ref={index === messages.length - 1 ? lastMessageRef : null} // Attach ref to last message
                                >
                                    {msg.message}
                                </p>
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="sticky bottom-20 px-4 left-0">
                            <img src="https://assets-v2.lottiefiles.com/a/88006af4-1185-11ee-a2bd-9f5d516c6482/nwsyoDcISP.gif" className="w-12" />
                        </div>
                    )}

                    <div className="sticky bottom-0 flex justify-center items-center w-full gap-2 mt-auto bg-blue-gray-700 p-4">
                        <input
                            type="text"
                            placeholder="Type a message"
                            className=" p-4 border-gray-200 bg-gray-100 rounded-e-xl w-4/5 rounded-es-xl dark:bg-gray-500"
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            value={input}
                        />
                        <button onClick={handleChat} className="flex items-center">
                            <FontAwesomeIcon icon={faPaperPlane} size="sm" className="bg-blue-400 w-8 h-8 p-3 rounded-full" />
                        </button>
                    </div>
                </div>
            )}

            {!isOpen && (
                <div className="fixed bottom-4 right-4 cursor-pointer">
                    <FontAwesomeIcon
                        icon={faComment}
                        size="2xl"
                        className="bg-blue-400 w-12 h-12 p-4 rounded-full"
                        onClick={() => {
                            setIsOpen(!isOpen);
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default Chat;
