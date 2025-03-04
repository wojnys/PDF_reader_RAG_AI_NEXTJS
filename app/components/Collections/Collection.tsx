"use client";

import { faFileAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useRouter } from "next/navigation";

interface CollectionProps {
    name: string;
    onDelete: (name: string) => void;
}

const Collection: React.FC<CollectionProps> = ({ name, onDelete }) => {
    const router = useRouter();

    const handleDelete = (name: string) => {
        console.log("deleting collection", name);
        onDelete(name);

        return name;
    };

    return (
        <li className="p-3 sm:pb-4 cursor-pointer hover:bg-slate-700 hover:opacity-80 hover:scale-110 transition delay-150 duration-300 ease-in-out rounded-lg">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="shrink-0">
                    <FontAwesomeIcon icon={faFileAlt} className="w-8 h-8 rounded-full" />
                </div>
                <div className="flex-1 min-w-0 group">
                    <p
                        className="text-sm font-medium text-gray-900 truncate dark:text-white hover:underline"
                        onClick={() => {
                            router.push(`/chat/${name}`);
                            // window.history.pushState("/chat", "undefined", `${name}`);
                        }}
                    >
                        {name}
                    </p>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">email@flowbite.com</p>
                </div>
                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    <FontAwesomeIcon
                        icon={faTrashAlt}
                        className="text-red-400"
                        onClick={() => {
                            handleDelete(name);
                        }}
                    />
                </div>
            </div>
        </li>
    );
};

export default Collection;
