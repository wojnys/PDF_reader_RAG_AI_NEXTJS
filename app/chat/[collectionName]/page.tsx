"use client";

import { useState, useEffect } from "react";
import Chat from "@/app/components/Chat";
import CollectionList from "@/app/components/CollectionList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const ChatPage = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const [isCollectionListVisible, setIsCollectionListVisible] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1000);
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Check initial screen size

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const handleArrowClick = () => {
        setIsRotating(true);
        setIsCollectionListVisible(!isCollectionListVisible);
        setTimeout(() => {
            setIsRotating(false);
        }, 500); // Duration of the rotation animation
    };

    return (
        <div className="flex h-screen">
            {!isMobileView && (
                <>
                    <div className="flex-shrink-0 w-1/3 h-[100vh] px-12 bg-white shadow-md dark:bg-gray-800">
                        <CollectionList />
                    </div>

                    <div className={`flex-grow ${isMobileView ? "w-full" : "w-2/3"}`}>
                        <Chat />
                    </div>
                </>
            )}

            {isMobileView && (
                <>
                    <div className="cursor-pointer px-3 flex items-center h-full  bg-white shadow-md dark:bg-gray-800" onClick={handleArrowClick}>
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className={`w-[40px] h-8 text-gray-500 dark:text-gray-400 transition-transform duration-500 ease-in ${
                                isCollectionListVisible ? "rotate-180" : "rotate-0"
                            }`}
                            onClick={handleArrowClick}
                        />
                    </div>

                    {isCollectionListVisible ? (
                        <div
                            className={`w-[calc(100%-40px)] pr-4 h-screen bg-white shadow-md dark:bg-gray-800 ease-out duration-700 ${
                                isCollectionListVisible ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <CollectionList />
                        </div>
                    ) : (
                        <div
                            className={`transition-opacity duration-1000 ease-in-out ${isCollectionListVisible ? "opacity-0" : "opacity-100"} w-full`}
                        >
                            <Chat />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ChatPage;
