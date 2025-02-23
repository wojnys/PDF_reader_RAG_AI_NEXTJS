// Import necessary modules
import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

const getFilename = (file: File) => {
    const timestamp = Date.now(); // Get current timestamp
    // Replace spaces in the file name with underscores
    const filename: string = (file as File).name.replaceAll(" ", "_");
    const extension = filename.split(".").pop(); // Extract file extension
    return `file_${timestamp}.${extension}`;
};

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_ENDPOINT, DB_APP_TOKEN, OPEN_AI_API_key } = process.env;

const openapi = new OpenAI({ apiKey: OPEN_AI_API_key });

const client = new DataAPIClient(DB_APP_TOKEN);
const db = client.db(ASTRA_DB_ENDPOINT as string, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});

// Define the POST handler for the file upload
export const POST = async (req: Request) => {
    console.log("File Upload Request Received", req);

    // Parse the incoming form data
    const formData = await req.formData();

    // Get file
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No files received." }, { status: 400 });

    // Get PDF name
    const pdfName: FormDataEntryValue | null = formData.get("pdfName");
    if (!pdfName) return NextResponse.json({ error: "No PDF name received." }, { status: 400 });

    // Convert the file data to a Buffer
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());

    // generate filename by timestamp
    const filename = getFilename(file as File);

    // Replace spaces in the file name with underscores
    const collectionName: string = pdfName.toString().replace(/\s/g, "_");
    console.log("Collection Name: ", collectionName);

    try {
        // Write the file to the specified directory (public/assets) with the modified filename
        await writeFile(path.join(process.cwd(), "public/assets/" + filename), buffer);

        // load saved PDF from assets
        const loader = new PDFLoader(path.join(process.cwd(), "public/assets/" + filename));

        // get content
        const docs = await loader.load();
        console.log(docs[0].pageContent);

        // create collection
        const collection = await db.createCollection(collectionName, {
            vector: {
                dimension: 1536,
                metric: "dot_product",
            },
        });
        // creaet embeddings
        for (const doc of docs) {
            const chunks = await splitter.splitText(doc.pageContent);
            for await (const chunk of chunks) {
                const embeddings = await openapi.embeddings.create({
                    model: "text-embedding-3-small",
                    input: chunk,
                    encoding_format: "float",
                });
                console.log(embeddings);
                const vector = embeddings.data[0].embedding;
                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk,
                });
            }
        }

        // save embeddings = insert into collection

        // Return a JSON response with a success message and a 201 status code
        return NextResponse.json({ Message: "Success", status: 201 });
    } catch (error) {
        // If an error occurs during file writing, log the error and return a JSON response with a failure message and a 500 status code
        console.log("Error occurred ", error);
        return NextResponse.json({ Message: "Failed", status: 500 });
    }
};
