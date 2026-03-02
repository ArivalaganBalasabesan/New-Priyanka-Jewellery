const aiService = require('./aiService');
const CustomDesign = require('./models/CustomDesign');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

class AIController {
    /**
     * @desc    Generate Jewelry Design
     * @route   POST /api/ai/generate
     * @access  Private
     */
    generate = asyncHandler(async (req, res) => {
        const { jewelryType, metalType, stoneType, styleDescription, base64Image, aiInfluence } = req.body;

        // Get AI image URL + reliable fallback
        const { aiUrl, fallbackUrl } = await aiService.generateDesignUrls(
            jewelryType, metalType, stoneType, styleDescription, base64Image, aiInfluence
        );

        const design = await CustomDesign.create({
            userId: req.user._id,
            jewelryType, metalType, stoneType,
            prompt: `${styleDescription || 'elegant'} ${jewelryType} ${metalType} ${stoneType}`,
            generatedImageURL: aiUrl
        });

        ApiResponse.created(res, {
            ...design.toObject(),
            fallbackImageURL: fallbackUrl,
            isAiGenerated: true
        }, 'Design generated successfully');
    });

    /**
     * @desc    Get My Designs
     * @route   GET /api/ai/my-designs
     * @access  Private
     */
    getMyDesigns = asyncHandler(async (req, res) => {
        const designs = await CustomDesign.find({ userId: req.user._id }).sort('-createdAt');
        ApiResponse.success(res, designs);
    });
}

module.exports = new AIController();
