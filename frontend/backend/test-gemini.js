require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

async function test() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const models = response.data.models;
        const imageModels = models.filter(m => m.name.toLowerCase().includes('imagen') || m.supportedGenerationMethods.includes('generateMessages') || true);

        console.log("Available models:");
        models.forEach(m => {
            if (m.name.includes('imagen') || m.name.includes('vision') || m.name.includes('gemini')) {
                console.log(m.name, m.supportedGenerationMethods);
            }
        });
    } catch (e) {
        console.error("Error payload:");
        console.error(e.response?.data || e.message);
    }
}

test();
