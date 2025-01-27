import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "langchain/schema";
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "inprompt";

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

async function handleApiCalls() {
    try {
        // Get token
        const tokenResponse = await axios.post(`https://tasks.aidevs.pl/token/${task}`, { apikey: aiDevsApiKey }, config);
        const token = tokenResponse.data.token;
        console.log('Token:', token);

        // Send the question
        const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, config);
        // console.log('Task:', taskResponse.data);

        const chat = new ChatOpenAI();
        const chatReply = await chat.invoke([
            new SystemMessage(`
                Zwróć tylko imie zawarte w poniższym zdaniu:

                ### zdanie
                ${taskResponse.data.question}
            `)
        ])
        console.log('Content:', chatReply.content);

        const input: string[] = taskResponse.data.input
        const sentenceToCheck = input.find((sentence: string) => sentence.includes(chatReply.content.toString()));
        console.log('Sentence to check:', sentenceToCheck);

        const chatReply2 = await chat.invoke([
            new SystemMessage(`
                Na podstawie danych, podaj odpowiedź na pytanie:

                ### Pytanie
                ${taskResponse.data.question}

                ### Dane
                ${sentenceToCheck}
            `)
        ])

        console.log('Content:', chatReply2.content);
        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: chatReply2.content.toString() }, config);
        console.log('Answers:', answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the async function to perform operations
handleApiCalls();