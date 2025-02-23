import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import puppeteer from "puppeteer";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_ENDPOINT, DB_APP_TOKEN, OPEN_AI_API_key } = process.env;

const openapi = new OpenAI({ apiKey: OPEN_AI_API_key });

// const f1Data = [
//     "https://en.wikipedia.org/wiki/Formula One",
//     "https://www.formula1.com/en/drivers",
//     "https://www.formula1.com/en/latest/all",
//     "https://www.formula1.com/en/results/2024/drivers",
//     // "https://en.wikipedia.org/wiki/2023 Formula One World Championship",
//     // "https://en.wikipedia.org/wiki/2022 Formula One World Championship",
//     "https://en.wikipedia.org/wiki/List_of_Formula One World Drivers%27 Champions",
//     // "https://en.wikipedia.org/wiki/2024 Formula_One_World Championship",
//     "https://www.formula1.com/en/results.html/2024/races.html",
//     "https://www.formula1.com/en/racing/2024.html",
// ];

const f1Data = ["https://www.formula1.com/en/latest/all"];
const client = new DataAPIClient(DB_APP_TOKEN);
const db = client.db(ASTRA_DB_ENDPOINT as string, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});

type SimilarityMatrix = "dot_product" | "cosine" | "euclidean";

const createCollection = async (similarityMatrix: SimilarityMatrix = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION as string, {
            vector: {
                dimension: 1536,
                metric: similarityMatrix,
            },
        });
        console.log(res);
    } catch (e) {
        console.error(e);
    }
};

const loadSampledata = async () => {
    // const collection = await db.collection(ASTRA_DB_COLLECTION);
    // for await (const url of f1Data) {
    //     const content = await scrapePage(url);
    //     const chunks = await splitter.splitText(content);

    //     for await (const chunk of chunks) {
    //         const embeddings = await openapi.embeddings.create({
    //             model: "text-embedding-3-small",
    //             input: chunk,
    //             encoding_format: "float",
    //         });
    //         console.log(url);
    //         console.log(content);
    //         // console.log(embeddings);
    //         // const vector = embeddings.data[0].embedding;
    //         // const res = await collection.insertOne({
    //         //     $vector: vector,
    //         //     text: chunk,
    //         // });
    //     }
    // }

    const collection = await db.collection(ASTRA_DB_COLLECTION as string);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let currentPage = 1;

    while (true) {
        let url = `https://www.formula1.com/en/latest/all?page=${currentPage}`;
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: "load", timeout: 60000 });

        // first part of articles llist
        // Extract article links
        const articleLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("#article-list a")).map((el: any) => el.href);
        });

        if (articleLinks.length === 0) {
            console.log("No more articles found, stopping.");
            break;
        }

        for (const link of articleLinks) {
            console.log(`Scraping article: ${link}`);
            const articlePage = await browser.newPage();
            await articlePage.goto(link, { waitUntil: "load", timeout: 60000 });

            let articleData = await articlePage.evaluate(() => {
                return {
                    title: document.querySelector("h1")?.innerText || "No Title",
                    content: Array.from(document.querySelectorAll(".f1-article--content"))
                        .map((p: any) => p.innerText)
                        .join("\n"),
                    date: document.querySelector(".f1-meta--date")?.innerHTML || "No Date",
                };
            });

            let cleanedArticleData = cleanArticle(articleData);

            console.log(url);
            console.log(cleanedArticleData);
            const chunks = await splitter.splitText(cleanedArticleData);
            for await (const chunk of chunks) {
                const embeddings = await openapi.embeddings.create({
                    model: "text-embedding-3-small",
                    input: chunk,
                    encoding_format: "float",
                });

                console.log(embeddings);
                const vector = embeddings.data[0].embedding;
                await collection.insertOne({
                    $vector: vector,
                    text: chunk,
                });
            }

            await articlePage.close();
        }

        currentPage++;
    }

    await browser.close();
};

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true,
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
        },
        evaluate: async (page, browser) => {
            const res = await page.evaluate(() => {
                return document.body.innerHTML;
            });
            await browser.close();
            return res;
        },
    });

    // remove html tages -> keeps just text
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

createCollection().then(() => {
    loadSampledata();
});

function cleanArticle(article: any) {
    const unwantedPhrases = [
        "F1 UNLOCKED",
        "To read on, sign up to F1 Unlocked for free",
        "You'll unlock this article and get access to:",
        "Live leaderboard data",
        "Epic experiences and rewards",
        "Money-can’t-buy competitions",
        "JOIN F1 UNLOCKED FREE",
        "EXPLORE F1 UNLOCKED",
        "Already have an account?",
        "Sign In",
        "Vieo",
        "**VIDEO**",
        "VIDEO",
        "*No Date*",
        "**By Rob Burnett**",
        "**By Rob Burnett**",
        "*No Date*",
        "RACE TICKETS - AUSTRALIA",
        "Don't miss your chance to be at the first Grand Prix of 2025 and experience the season-opener in Melbourne...",
        "BOOK NOW",
        "DISCOVER MORE...",
        "F1 75 LIVE: All you need to know about the spectacular launch event at The O2",
        "F1 75 LIVE: How to watch the season launch event from The O2",
        "MUST-SEE: Watch the thrilling new teaser for Apple Original Films’ movie ‘F1’ as it debuts in Super Bowl LIX Pregame",
    ];

    // Convert content to an array of lines and filter out empty lines and unwanted phrases
    let cleanedContent = article.content
        .split("\n") // Split by new lines
        .map((line: any) => line.trim()) // Trim spaces
        .filter((line: any) => line.length > 0 && !unwantedPhrases.includes(line)) // Remove empty and unwanted lines
        .join("\n"); // Join back into a string

    return `**FEATURE**\n**${article.title}**\n\n**By Rob Burnett**\n*${article.date}*\n\n${cleanedContent}`;
}
