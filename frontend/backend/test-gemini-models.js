require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test(modelName) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey: apiKey });

        console.log(`Testing [${modelName}]...`);
        const response = await ai.models.generateImages({
            model: modelName,
            prompt: 'A highly detailed, professional product photography close-up of a luxurious ring.',
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1'
            },
        });
        console.log(`✅ Success for ${modelName}!`);
        return true;
    } catch (e) {
        console.error(`❌ Failed for ${modelName}:`, e.message || e);
        return false;
    }
}

async function runAll() {
    await test('imagen-3.0-generate-002');
    await test('imagen-4.0-generate-001');
    await test('imagen-3.0-generate-001');
}

runAll();
