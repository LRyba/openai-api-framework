import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const task = "ownapipro"
const config = {
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Chrome'
    }
};
const aiDevsApiKey = process.env.AI_DEVS_API_KEY;

const tokenResponse = await axios.post(`https://tasks.aidevs.pl/token/${task}`, { apikey: aiDevsApiKey }, config);
const token = tokenResponse.data.token;
console.log(token);


const taskResponse = await axios.get(`https://tasks.aidevs.pl/task/${token}`, config);
// console.log('Task:', taskResponse.data);


const answersResponse = await axios.post(`https://tasks.aidevs.pl/answer/${token}`, { answer: "https://9767-88-156-143-75.ngrok-free.app" }, config);
console.log('Answers:', answersResponse.data);