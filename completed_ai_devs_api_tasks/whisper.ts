import axios from 'axios';
import dotenv from 'dotenv';
import fs from "fs";
import OpenAI from "openai";


dotenv.config();

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "whisper";

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


        const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, config);
        console.log('Task:', taskResponse.data);

        const openai = new OpenAI({ apiKey: openAiApiKey });
        const transcription = await openai.audio.transcriptions.create({

            file: fs.createReadStream("./audio/mateusz.mp3"),
            model: "whisper-1",
        });

        console.log(transcription.text);

        // console.log(transcription.text);

        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: transcription.text }, config);
        console.log('Answers:', answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the async function to perform operations
handleApiCalls();