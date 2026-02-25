class AIService {
    /**
     * Generate jewelry image URLs using Pollinations.ai
     * Free, no API key. Returns both AI URL and a fallback.
     */
    generateDesignUrls(jewelryType, metalType, stoneType, styleDescription) {
        // Keep prompt SHORT for URL reliability
        const prompt = `${jewelryType} ${metalType} ${stoneType} jewelry, ${styleDescription || 'elegant'}, product photo, white background`;
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 99999);

        const aiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true&seed=${seed}`;

        // Curated fallback images per jewelry type (always works)
        const fallbacks = {
            Ring: [
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
                'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
            ],
            Necklace: [
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
                'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80',
            ],
            Earrings: [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
                'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
            ],
            Bracelet: [
                'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
            ],
            Pendant: [
                'https://images.unsplash.com/photo-1599459183200-59c3ae3bae10?w=800&q=80',
                'https://images.unsplash.com/photo-1602752250015-52934bc45613?w=800&q=80',
            ],
        };

        const typeImages = fallbacks[jewelryType] || fallbacks.Ring;
        const fallbackUrl = typeImages[Math.floor(Math.random() * typeImages.length)];

        console.log('🎨 Generated design URLs (AI + fallback)');

        return { aiUrl, fallbackUrl };
    }
}

module.exports = new AIService();
