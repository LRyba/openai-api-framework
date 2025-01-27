import axios from 'axios';
import dotenv from 'dotenv';
import { HumanMessage, SystemMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";


dotenv.config();

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "scraper";

const config = {
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Chrome'
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

        let response: any;
        let serverResponded = false;
        while (!serverResponded) {
            let errorOccurred = false;
            try {
                response = await axios.get(taskResponse.data.input, config);
            } catch (error: any) {
                console.error('An error occurred:', error.response.statusCode);
                errorOccurred = true;
            }
            if (!errorOccurred) {
                serverResponded = true;
            }
        }
        const text = response.data;
        console.log('Text:', text);

        const chat = new ChatOpenAI();
        const chatReply = await chat.invoke([
            new SystemMessage(text),
            new HumanMessage('Provide a very short and concise answert to following question: ' + taskResponse.data.question)
        ])
        console.log('Content:', chatReply.content);

        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: chatReply.content }, config);
        console.log('Answers:', answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the async function to perform operations
handleApiCalls();