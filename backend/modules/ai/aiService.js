const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FormData = require('form-data');

class AIService {
    /**
     * Generate jewelry image URLs
     * Attempts to use paid Google Gemini API if permitted.
     * Silently falls back to high-quality Pollinations AI if Gemini fails or is blocked.
     */
    async generateDesignUrls(jewelryType, metalType, stoneType, styleDescription, base64Image, aiInfluence) {

        let aiUrl = null;
        let finalFallbackUrl = null;

        // --- Pollinations.ai Backup Generator Details ---
        const generatePollinationsUrl = () => {
            const prompt = `Highly detailed professional product photography of a ${jewelryType} made of ${metalType} featuring ${stoneType}. Style: ${styleDescription || 'elegant and beautiful'}. Studio lighting, white background, 8k resolution, macro photography.`;
            const encodedPrompt = encodeURIComponent(prompt);
            const seed = Math.floor(Math.random() * 999999);
            return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true&seed=${seed}&model=flux`;
        };

        // Static fallback images in case everything somehow fails
        const fallbacks = {
            Ring: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'],
            Necklace: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
            Earrings: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'],
            Bracelet: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'],
            Pendant: ['https://images.unsplash.com/photo-1599459183200-59c3ae3bae10?w=800&q=80'],
        };

        const typeImages = fallbacks[jewelryType] || fallbacks.Ring;
        finalFallbackUrl = typeImages[0];

        // --- Phase 1: Try Leonardo AI (Paid Key) ---
        try {
            const apiKey = process.env.LEONARDO_API_KEY;
            if (apiKey) {
                console.log(`🎨 Requesting Leonardo AI design for: ${jewelryType}...`);
                const leonardoPrompt = `A highly detailed, professional product photography close-up of a luxurious ${jewelryType} made of ${metalType} featuring ${stoneType}. Style: ${styleDescription || 'elegant and beautiful'}. Shot on a pure white studio background, brilliant studio lighting, macro photography, 8k resolution, highly detailed reflections, premium jewelry catalog shot.`;

                let initImageId = null;

                // If user provided a reference sketch/image
                if (base64Image) {
                    console.log(`📸 Processing reference image for Image-to-Image generation...`);
                    // 1. Get S3 Upload URL
                    const initRes = await axios.post('https://cloud.leonardo.ai/api/rest/v1/init-image', {
                        extension: "jpg"
                    }, {
                        headers: {
                            'accept': 'application/json',
                            'content-type': 'application/json',
                            'authorization': `Bearer ${apiKey}`
                        }
                    });

                    const uploadData = initRes.data.uploadInitImage;
                    initImageId = uploadData.id;
                    const fields = JSON.parse(uploadData.fields);

                    // 2. Upload to S3
                    // Extract base64 data cleanly (handling data:image/jpeg;base64, prefixes)
                    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
                    const imageBuffer = Buffer.from(base64Data, 'base64');

                    const formData = new FormData();
                    for (const key in fields) {
                        formData.append(key, fields[key]);
                    }
                    formData.append('file', imageBuffer, { filename: 'reference.jpg', contentType: 'image/jpeg' });

                    await axios.post(uploadData.url, formData, {
                        headers: formData.getHeaders()
                    });
                    console.log(`✅ Uploaded reference image to Leonardo Cloud (${initImageId})`);
                }

                // 3. Initiate Generation
                const payload = {
                    prompt: leonardoPrompt,
                    num_images: 1,
                    width: 768,
                    height: 768,
                    alchemy: false,
                    presetStyle: 'PHOTOGRAPHY'
                };

                // Inject Image2Image params if available
                if (initImageId) {
                    payload.init_image_id = initImageId;
                    // Note: lower init_strength logically means *less* noise added to init image (more similar)
                    // We'll map "aiInfluence" (0 to 100) -> init_strength (0.1 to 0.9)
                    // Typically aiInfluence=100 means high AI hallucination (high noise -> 0.8)
                    // aiInfluence=0 means stick to original sketch strictly (low noise -> 0.3)
                    const strengthValue = aiInfluence ? parseFloat(aiInfluence) / 100 : 0.5;
                    // Bound to acceptable SD values
                    payload.init_strength = Math.max(0.2, Math.min(0.85, strengthValue));
                }

                const generateResponse = await axios.post('https://cloud.leonardo.ai/api/rest/v1/generations', payload, {
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'authorization': `Bearer ${apiKey}`
                    }
                });

                const generationId = generateResponse.data.sdGenerationJob.generationId;

                // 2. Poll for the image URL (up to 20 times, 3 seconds apart)
                let completed = false;
                let finalAiImageUrl = null;

                for (let i = 0; i < 20; i++) {
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    const fetchRes = await axios.get(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                        headers: {
                            'accept': 'application/json',
                            'authorization': `Bearer ${apiKey}`
                        }
                    });

                    const status = fetchRes.data.generations_by_pk.status;

                    if (status === 'COMPLETE') {
                        finalAiImageUrl = fetchRes.data.generations_by_pk.generated_images[0].url;
                        completed = true;
                        break;
                    } else if (status === 'FAILED') {
                        throw new Error('Leonardo Generation failed internally');
                    }
                }

                if (completed && finalAiImageUrl) {
                    // Download the image arraybuffer to save it locally
                    const imageDownload = await axios.get(finalAiImageUrl, { responseType: 'arraybuffer' });

                    const aiDir = path.join(process.cwd(), 'public', 'uploads', 'ai');
                    if (!fs.existsSync(aiDir)) {
                        fs.mkdirSync(aiDir, { recursive: true });
                    }

                    const fileName = `design_${crypto.randomBytes(8).toString('hex')}.jpeg`;
                    const filePath = path.join(aiDir, fileName);

                    fs.writeFileSync(filePath, imageDownload.data);
                    aiUrl = `/uploads/ai/${fileName}`;
                    console.log(`✅ Successfully created Leonardo AI design: ${aiUrl}`);

                    return { aiUrl, fallbackUrl: finalFallbackUrl };
                } else {
                    throw new Error('Leonardo Generation timed out');
                }
            }
        } catch (error) {
            console.error('⚠️ Leonardo AI failed:', error?.response?.data || error?.message || error);
            console.log('🔄 Routing traffic to Pollinations.ai fallback...');
        }

        // --- Phase 2: Fallback to Pollinations ---
        if (!aiUrl) {
            console.log(`✅ Falling back to Pollinations.ai design for: ${jewelryType}...`);
            aiUrl = generatePollinationsUrl();
        }

        return { aiUrl, fallbackUrl: finalFallbackUrl };
    }
}

// Ensure nodemon restart loads the .env correctly.
module.exports = new AIService();
