"use client";
import { useState } from "react";
import DropZone from "./Inputs/DropZone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function UploadPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [pdfName, setPdfName] = useState<string>("");

    const handleFileChange = (file: File) => {
        setFile(file);
    };

    const handleUpload = async () => {
        if (!pdfName) {
            alert("Please enter a PDF name.");
            return;
        }
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        if (file) {
            formData.append("file", file);
            formData.append("pdfName", pdfName);
        } else {
            alert("Please select a file first.");
            return;
        }

        try {
            await fetch(`${process.env.SERVER_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });
            alert("File uploaded successfully.");
        } catch (error) {
            alert("Error uploading file.");
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div className="w-full py-4 flex flex-col gap-1">
            <input
                type="text"
                placeholder="Write PDF name..."
                className="flex flex-col items-center justify-center h-8 p-4  w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPdfName(e.target.value);
                }}
            />

            <DropZone onFileChange={handleFileChange} />
            <div className="flex items-center justify-center w-full p-2">
                <FontAwesomeIcon icon={faPlusCircle} className="w-8 h-8 text-green-500 hover:text-green-200" onClick={handleUpload} />
            </div>
        </div>
    );
}
