const axios = require('axios');
require('dotenv').config();


// AI Devs API

const aiDevsApiKey = process.env.AI_DEVS_API_KEY;
const openAiApiKey = process.env.OPENAI_API_KEY;
const task = "moderation";

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
        const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, {}, config);
        const inputs = taskResponse.data.input;

        const answers = await Promise.all(inputs.map(async (input) => {
            const response = await axios.post(`https://api.openai.com/v1/moderations`, { input: input }, configOpenAi);
            return response.data.results[0].flagged ? 1 : 0;
        }));
        console.log(inputs);
        console.log(answers);

        const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: answers }, config);
        console.log(answersResponse.data);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the async function to perform operations
handleApiCalls();