const axios = require('axios');

async function testLeonardo() {
    const apiKey = 'a38135ee-4489-4186-a1bb-237f6e8aa592';

    try {
        console.log("Starting Leonardo Generation...");
        // 1. Initiate Generation
        const response = await axios.post('https://cloud.leonardo.ai/api/rest/v1/generations', {
            prompt: 'A highly detailed, professional product photography close-up of a luxurious gold ring featuring a diamond.',
            num_images: 1,
            width: 1024,
            height: 1024,
            alchemy: false
        }, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Bearer ${apiKey}`
            }
        });

        console.log("Generation started:", response.data);
        const generationId = response.data.sdGenerationJob.generationId;

        // 2. Poll for results
        console.log(`Polling for generationId: ${generationId}`);
        let completed = false;
        let imageUrl = null;

        for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s

            const fetchRes = await axios.get(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${apiKey}`
                }
            });

            const status = fetchRes.data.generations_by_pk.status;
            console.log(`Status: ${status}`);

            if (status === 'COMPLETE') {
                imageUrl = fetchRes.data.generations_by_pk.generated_images[0].url;
                completed = true;
                break;
            } else if (status === 'FAILED') {
                throw new Error('Generation failed');
            }
        }

        if (completed && imageUrl) {
            console.log(`✅ Success! Image URL: ${imageUrl}`);
        } else {
            console.log("❌ Timeout waiting for generation");
        }

    } catch (e) {
        console.error("❌ Failed:", e.response?.data || e.message);
    }
}

testLeonardo();
