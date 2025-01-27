import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


const openAiApiKey = process.env.OPENAI_API_KEY;
// const endpoint = 'https://api.openai.com/v1/chat/completions';
const endpoint = 'https://api.openai.com/v1/embeddings';
const model = 'text-embedding-ada-002';


// const data = {
//     input: [{ role: "user", content: "Say this is a test!" }],
//     // max_tokens: 60,
//     model: model,
//     // temperature: 0.7,
// };

const data = {
    input: ["Hawaiian pizza"],
    model: model,
};

const config = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
    }
};

axios.post(endpoint, data, config)
    .then(response => {
        console.log('Success:', response.data);
        console.log('Embedding:', response.data.data[0].embedding);
    })
    .catch(error => {
        console.error('An error occurred:', error);
    });
