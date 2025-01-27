import axios from 'axios';
import dotenv from 'dotenv';
import fs from "fs";
import OpenAI from "openai";


dotenv.config();

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "functions";

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


        // const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, config);
        // console.log('Task:', taskResponse.data);

        const functionJson = {
            "name": "addUser",
            "description": "adds user duh",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "provide user name"
                    },
                    "surname": {
                        "type": "string",
                        "description": "provide user surname"
                    },
                    "year": {
                        "type": "integer",
                        "description": "provide user birth year"
                    }
                }
            }
        }

        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: functionJson }, config);
        console.log('Answers:', answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the async function to perform operations
handleApiCalls();