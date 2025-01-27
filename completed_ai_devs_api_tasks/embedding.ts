import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "embedding";

const config = {
    headers: {
        'Content-Type': 'application/json',
    }
};

const configOpenAi = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
    }
};

const endpoint = 'https://api.openai.com/v1/embeddings';
const model = 'text-embedding-ada-002';

async function handleApiCalls() {
    try {
        // Get token
        const tokenResponse = await axios.post(`https://tasks.aidevs.pl/token/${task}`, { apikey: aiDevsApiKey }, config);
        const token = tokenResponse.data.token;

        const embeddingResponse = await axios.post(endpoint, { model: model, input: ["Hawaiian pizza"] }, configOpenAi);
        const embedding = embeddingResponse.data.data[0].embedding;

        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: embedding }, config);
        console.log('Answers:', answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the async function to perform operations
handleApiCalls();