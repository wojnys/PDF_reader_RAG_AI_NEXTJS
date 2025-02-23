import { NextResponse } from "next/server";
import { DataAPIClient } from "@datastax/astra-db-ts";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_ENDPOINT, DB_APP_TOKEN } = process.env;
const client = new DataAPIClient(DB_APP_TOKEN);
const db = client.db(ASTRA_DB_ENDPOINT as string, { namespace: ASTRA_DB_NAMESPACE });

export async function GET() {
    try {
        const collections = await db.listCollections({ nameOnly: true });
        return NextResponse.json({ collections }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
