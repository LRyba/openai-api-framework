import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const task = "search"
const config = {
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Chrome'
    }
};
const aiDevsApiKey = process.env.AI_DEVS_API_KEY;

const tokenResponse = await axios.post(`https://tasks.aidevs.pl/token/${task}`, { apikey: aiDevsApiKey }, config);
const token = tokenResponse.data.token;


const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, config);
console.log('Task:', taskResponse.data);

const MEMORY_PATH = "src/memory.md";
const COLLECTION_NAME = "ai_devs";

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });
const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5 });
const query = taskResponse.data.question;
const queryEmbedding = await embeddings.embedQuery(query);
const result = await qdrant.getCollections();
const indexed = result.collections.find((collection) => collection.name === COLLECTION_NAME);
console.log(result);
// Create collection if not exists
if (!indexed) {
    await qdrant.createCollection(COLLECTION_NAME, { vectors: { size: 1536, distance: 'Cosine', on_disk: true } });
}

const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
// Index documents if not indexed
if (!collectionInfo.points_count) {

    // Read File
    const loader = new TextLoader(MEMORY_PATH);
    let [memory] = await loader.load();
    let documents = memory.pageContent.split(";").map((content) => (new Document({ pageContent: content })));

    // Add metadata
    documents = documents.map((document) => {
        document.metadata.source = COLLECTION_NAME;
        document.metadata.content = document.pageContent;
        document.metadata.uuid = uuidv4();
        return document;
    });
    console.log("embedding started")

    // Generate embeddings
    const points = [];
    for (const document of documents) {
        const [embedding] = await embeddings.embedDocuments([document.pageContent]);
        points.push({
            id: document.metadata.uuid,
            payload: document.metadata,
            vector: embedding,
        });
    }
    console.log("embedding done")

    // Index
    await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        batch: {
            ids: points.map((point) => (point.id)),
            vectors: points.map((point) => (point.vector)),
            payloads: points.map((point) => (point.payload)),
        },
    })
}


const search = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 1,
    filter: {
        must: [
            {
                key: 'source',
                match: {
                    value: COLLECTION_NAME
                }
            }
        ]
    }
});
const searchResult = search[0]?.payload?.content ?? "";

const searchResultJson = JSON.parse(String(searchResult));

console.log(searchResultJson);

const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: searchResultJson.url }, config);
console.log('Answers:', answersResponse.data);