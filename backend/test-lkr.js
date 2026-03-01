const axios = require('axios');

async function testFetch() {
    try {
        const { data } = await axios.get('https://data-asg.goldprice.org/dbXRates/LKR', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) width/1',
            }
        });

        console.log(data);

        // Items are in exactly 1 troy ounce = 31.1034768 grams.
        const goldOunce = data.items[0].xauPrice;
        const silverOunce = data.items[0].xagPrice;

        const goldGram = goldOunce / 31.1034768;
        const silverGram = silverOunce / 31.1034768;

        console.log(`Gold 1g: LKR ${goldGram.toFixed(2)}`);
        console.log(`Silver 1g: LKR ${silverGram.toFixed(2)}`);

    } catch (e) {
        console.error("Error scraping", e.message);
    }
}
testFetch();
