const consoleLog = true;

console.log("LOADED:- projectFinnhub_Server.mjs is loaded",new Date().toLocaleString());
export function projectFinnhub_ServerMJSisLoaded(){
    return true;
}

// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️
//  SERVER SIDE IMPORTS ONLY
	import axios from 'axios';
// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️

// Load API key from environment variable
const finnhubApiKey = process.env.FINNHUB_API_KEY;

if (!finnhubApiKey) {
	// throw new Error('Missing FINNHUB_API_KEY in environment variables.');
	console.log(trace(),'❌🔴🔑❌🔴🔑Missing finnhubApiKey in environment variables.❌🔴🔑❌🔴🔑');
}

// // Create a pre-configured axios instance
// const finnhub = axios.create({
//   baseURL: 'https://finnhub.io/api/v1',
//   timeout: 5000, // 5 seconds
//   params: {
//     token: finnhubApiKey,
//   },
// });

// Example: Get stock quote
	export async function getQuote(symbol) {
		try {
			const response = await finnhub.get('/quote', {
				params: { symbol }, // merged with default params
			});
			return response.data;
		} catch (error) {
			handleAxiosError(error, 'getQuote');
		}
	}

// You can add more wrapper functions like getCompanyProfile, etc.
	export async function getCompanyProfile(symbol) {
		try {
			const response = await finnhub.get('/stock/profile2', {
			params: { symbol },
			});
			return response.data;
		} catch (error) {
			handleAxiosError(error, 'getCompanyProfile');
		}
	}

// Centralized error handler
	function handleAxiosError(error, context) {
		if (error.code === 'ECONNABORTED') {
			console.error(`[${context}] Request timed out.`);
		} else if (error.response) {
			console.error(`[${context}] HTTP ${error.response.status}:`, error.response.data);
		} else {
			console.error(`[${context}] Unknown error:`, error.message);
		}
		throw error; // Re-throw for calling code to handle if needed
	}
