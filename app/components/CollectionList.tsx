import { useEffect, useState } from "react";
import Collection from "./Collections/Collection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { set } from "zod";
import UploadPdf from "./UploadPdf";

const CollectionList = () => {
    const [collections, setCollections] = useState<string[]>([]);

    useEffect(() => {
        const fetchAllCollections = async () => {
            const res = await fetch("/api/collection");
            const data = await res.json();
            console.log(data);
            setCollections(data.collections);
        };
        fetchAllCollections();
    }, []);

    const handleDelete = (name: string) => {
        console.log("deleting collection", name);
        setCollections(collections.filter((collection) => collection !== name));
    };

    console.log(collections);
    return (
        <div>
            <h1 className="px-4 py-4 font-bold">My PDFS</h1>
            <hr className="" />
            <ul className="py-4 max-w-md divide-y divide-gray-200 dark:divide-gray-700 flex-col w-full items-center">
                {collections.map((collection) => (
                    <Collection key={collection} name={collection} onDelete={handleDelete} />
                ))}
                <div
                    className="flex items-center justify-center cursor-pointer  hover:opacity-80 rounded"
                    // onClick={() => setCollections([...collections, "New Collection"])}
                >
                    <div className="flex-col items-center w-full i">
                        <UploadPdf />
                    </div>
                </div>
            </ul>
        </div>
    );
};

export default CollectionList;
