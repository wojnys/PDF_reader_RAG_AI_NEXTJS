"use client";
import Link from "next/link";

export default function Home() {
    return (
        <h1 className="text-4xl text-center">
            Welcome to the Home Page!
            <Link href="/chat/LDO"> FOR chatting and loading PDF click here </Link>
        </h1>
    );
}
