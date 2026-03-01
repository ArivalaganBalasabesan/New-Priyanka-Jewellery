require('dotenv').config();
const { OpenAI } = require('openai');

async function testOpenAI() {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        const openai = new OpenAI({ apiKey: apiKey });

        console.log(`Testing OpenAI DALL-E 3...`);
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: 'A highly detailed, professional product photography close-up of a luxurious Ring.',
            n: 1,
            size: "1024x1024",
            response_format: "url"
        });

        console.log(`✅ Success for OpenAI!`);
        console.log(response.data[0].url);
        return true;
    } catch (e) {
        console.error(`❌ Failed for OpenAI:`, e.message || e);
        return false;
    }
}

testOpenAI();
