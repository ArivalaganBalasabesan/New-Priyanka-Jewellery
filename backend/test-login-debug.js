const axios = require('axios');

async function testLogin() {
    try {
        console.log("Attempting login...");
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@priyankajewellery.com',
            password: 'Admin@123456'
        });
        console.log("Login Success!");
        console.log(res.data);
    } catch (error) {
        console.log("Login Failed!");
        if (error.response) {
            console.log(error.response.status, error.response.data);
        } else {
            console.log(error.message);
        }
    }
}
testLogin();
