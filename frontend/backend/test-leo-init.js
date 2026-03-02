const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testInitImageToGen() {
    const apiKey = 'a38135ee-4489-4186-a1bb-237f6e8aa592';

    try {
        console.log("1. Requesting init image upload URL...");
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
        const uploadUrl = uploadData.url;
        const fields = JSON.parse(uploadData.fields);
        const initImageId = uploadData.id;

        console.log(`2. Uploading simple file to S3 (${initImageId})...`);

        // Grab a simple fallback image or generate white noise
        const testImage = Buffer.alloc(10 * 1024, 0); // 10kb dummy file for test purpose, wait, actually let's use a real small image from unplash or something, or even just white noise but S3 doesn't care. Let's create a legit 1x1 JPEG.

        const pixelJpgBytes = Buffer.from("/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAaEAACAQUAAAAAAAAAAAAAAAAAAQIDBAUG/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAj/xAAaEQADAQACAAAAAAAAAAAAAAAAAQIDERIS/9oADAMBAAIAAwAAABD/AP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/xAAVEQEBAAAAAAAAAAAAAAAAAAAAEf/aAAwDAQACEQMRAD8AQv8A/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwB//8QAFQACAwAAAAAAAAAAAAAAAAAAAAERIUFhcYGRsf/aAAgBAQABPwAj/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgIGPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwIGPwB//8QAGRABAQADAAAAAAAAAAAAAAAAAAERQWFxkf/aAAgBAQAGPwBE/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA//9k=", 'base64');

        const formData = new FormData();
        for (const key in fields) {
            formData.append(key, fields[key]);
        }
        formData.append('file', pixelJpgBytes, 'test.jpg');

        await axios.post(uploadUrl, formData, {
            headers: formData.getHeaders()
        });

        console.log("3. Firing generation off with init_image_id...");

        const generateResponse = await axios.post('https://cloud.leonardo.ai/api/rest/v1/generations', {
            prompt: 'make it red',
            num_images: 1,
            init_image_id: initImageId,
            init_strength: 0.5,
            width: 768,
            height: 768
        }, {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Bearer ${apiKey}`
            }
        });

        console.log("Generation started:", generateResponse.data);

    } catch (e) {
        console.error("❌ Failed:", e.response?.data || e.message);
    }
}

testInitImageToGen();
