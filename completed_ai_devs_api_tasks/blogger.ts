import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "blogger";

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

        // Get task
        const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, config);
        console.log('Task:', taskResponse.data);

        const systemTemplate = `
        As a polish food blogger, you will recieve requests to write chapters on specific topic.
        The requests will consist of a topic name and a list of chapters to write.

        Your respone must be single JSON object with a key "chapters" that stores content for each chapter, like so:
        {{
            "chapters": ["chapter 1 content", "chapter 2 content", "chapter 3 content"]
        }}
        `;

        const humanTemplate = "{text}";

        // Utworzenie promptu z dwóch wiadomości według podanych szablonów:
        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", systemTemplate],
            ["human", humanTemplate],
        ]);

        let chaptersString = '';
        taskResponse.data.blog.forEach((chapter: string, index: number) => {
            chaptersString += `${index + 1}. ${chapter}\n`;
        });
        console.log(chaptersString)

        // Faktyczne uzupełnienie szablonów wartościami
        const formattedChatPrompt = await chatPrompt.formatMessages({
            text: `Temat: Jak zrobić pizze margharitę?\n Rodziały:\n ${chaptersString}`,
        });

        const chat = new ChatOpenAI();
        const { content } = await chat.invoke(formattedChatPrompt);

        console.log(content);
        const responseJSON = JSON.parse(content as string);
        console.log(responseJSON);

        // // Send response
        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: responseJSON.chapters }, config);
        console.log('Answers:', answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the async function to perform operations
handleApiCalls();
