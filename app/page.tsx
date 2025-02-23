"use client";
import Chat from "./components/Chat";
import UploadPdf from "./components/UploadPdf";
import CollectionList from "./components/CollectionList";
import Link from "next/link";

export default function Home() {
    return (
        <h1 className="text-4xl text-center">
            Welcome to the Home Page!
            <Link href="/chat/LDO"> FOR chatting and loading PDF click here </Link>
        </h1>
    );
}
