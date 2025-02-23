"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();
    useEffect(() => {
        router.push("/chat/LDO");
    }, []);

    return (
        <h1 className="text-4xl text-center">
            Welcome to the Home Page!
            <Link href="/chat/LDO"> loading... </Link>
        </h1>
    );
}
