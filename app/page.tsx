"use client";
import Chat from "./components/Chat";
import UploadPdf from "./components/UploadPdf";
import CollectionList from "./components/CollectionList";

export default function Home() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <div className="fixed top-0 left-0 z-50 flex items-center justify-between px-12 h-full p-4 bg-white shadow-md dark:bg-gray-800">
                <CollectionList />
            </div>
            <Chat />
        </div>
    );
}
