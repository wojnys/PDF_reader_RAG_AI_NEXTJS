import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";
import "dotenv/config";
import { NextResponse } from "next/server";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_ENDPOINT, DB_APP_TOKEN, OPEN_AI_API_key } = process.env;

const openapi = new OpenAI({ apiKey: OPEN_AI_API_key });

const client = new DataAPIClient(DB_APP_TOKEN);
const db = client.db(ASTRA_DB_ENDPOINT as string, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        console.log(message);

        const latestMessage = message[message?.length - 1]?.content;
        console.log(latestMessage);
        const embedding = await openapi.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float",
        });

        try {
            const collection = await db.collection(ASTRA_DB_COLLECTION as string);
            const cursor = collection.find(
                {},
                {
                    sort: {
                        $vector: embedding.data[0].embedding,
                    },
                    limit: 10,
                }
            );

            const documents = await cursor.toArray();
            const docsMap = documents.map((doc) => doc.text);
            let docContext = JSON.stringify(docsMap);

            const template = {
                role: "system",
                content: `You are an AI assistant who knows everything about Formula One. Use the below context to augment what you know about Formula One racing. 
                    The context will provide you with the most recent page data from wikipedia, the official F1 website and others. I
                    If the context doesn't include the information you need answer based on your existing knowledge and don't mention the source of your information or
                    what the context does or doesn't include.
                    Format responses using markdown where applicable and don't return images.
                    ---------
                    START CONTEXT 
                    ${docContext}
                    END CONTEXT
                    ----------
                    QUESTION: ${latestMessage}
                    `,
            };

            const chatResponse = await openapi.chat.completions.create({
                model: "gpt-3.5-turbo",
                stream: false,
                messages: [template, ...message],
            });

            console.log(chatResponse.choices[0].message.content);
            return NextResponse.json({ message: chatResponse.choices[0].message.content });
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
}
