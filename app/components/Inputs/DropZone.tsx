import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

interface DropZoneProps {
    onFileChange: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileChange }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            onFileChange(file);
        }
    };

    // // Function to determine which icon to show based on file type
    // const getFileIcon = (fileType: any) => {
    //     if (fileType.includes("pdf")) return <div className="w-6 h-6 text-red-500" />;
    //     if (fileType.includes("image")) return <div className="w-6 h-6 text-blue-500" />;
    //     return <div className="w-6 h-6 text-gray-500" />;
    // };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <label
                htmlFor="dropzone-file"
                className="w-full flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF</p>
                </div>
                <input id="dropzone-file" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
            </label>

            {/* Display selected file info */}
            {selectedFile && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-full justify-between">
                    <span className="flex items-center">
                        {/* {getFileIcon(selectedFile.type)} */}
                        <span className="text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
                    </span>

                    <FontAwesomeIcon icon={faTrash} className="text-red-500 cursor-pointer" onClick={() => setSelectedFile(null)} />
                </div>
            )}
        </div>
    );
};

export default DropZone;
