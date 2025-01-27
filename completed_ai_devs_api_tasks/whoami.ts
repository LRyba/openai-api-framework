import axios from 'axios';
import dotenv from 'dotenv';
import { HumanMessage, SystemMessage } from "langchain/schema";
import { ChatOpenAI } from "langchain/chat_models/openai";


dotenv.config();

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "whoami";

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

const hints: string[] = [];
let personIdentified = false;

async function handleApiCalls() {
    try {
        // Get token
        const tokenResponse = await axios.post(`https://tasks.aidevs.pl/token/${task}`, { apikey: aiDevsApiKey }, config);
        const token = tokenResponse.data.token;


        const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, config);
        // console.log('Task:', taskResponse.data);
        hints.push(taskResponse.data.hint);
        console.log(hints);

        const chat = new ChatOpenAI();
        const chatReply = await chat.invoke([
            new SystemMessage(`My task is to identify the person based on the provided information. I can only answer truthfully if I'm sure who the person is.\n
            If i'm not sure I have to reply with "More info please".\n`),
            new HumanMessage('Hints:' + hints.join(', ') + '\n')
        ])

        console.log('Content:', chatReply.content);
        if (chatReply.content === 'More info please') {
            console.log('More info please');
            personIdentified = false;
            return
        }
        personIdentified = true;
        console.log('Person identified:', chatReply.content);

        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: chatReply.content }, config);
        console.log('Answers:', answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}


// Call the async function to perform operations
while (!personIdentified) {
    console.log('Person not identified yet');
    await handleApiCalls();
    setTimeout(() => {
        console.log('Checking again');
    }, 2000);

}