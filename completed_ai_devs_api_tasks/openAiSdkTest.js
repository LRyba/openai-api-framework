
const openAiApiKey = process.env.OPENAI_API_KEY;
const endpoint = 'https://api.openai.com/v1/chat/completions';
const model = 'text-embedding-ada-002';


const data = {
    messages: [{ role: "user", content: "Say this is a test!" }],
    // max_tokens: 60,
    model: model,
    // temperature: 0.7,
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
        console.log('Bot response:', response.data.choices[0].message)
    })
    .catch(error => {
        console.error('An error occurred:', error);
    });
