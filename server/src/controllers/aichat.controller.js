import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import axios from "axios";

import dotenv from "dotenv";
import { json } from "express";

dotenv.config({
	path: "./.env",
});

const API_URL = process.env.AI_API_URL;

const getResponse = asyncHandler(async (req, res) => {
	const { question } = req.body;
	if (!question) {
		throw new ApiError(400, "Question is required");
	}

	const prompt = `
If the prompt is asking about educational material, give a proper response. If not, return this message:
**ask only generous and study related questions**

Always respond in the following strict **JSON format**:

{
  "ai_response": "The study material should be here.",
  "topic": "The related topic for the study material should be here.",
}

**Rules:**
- ONLY send valid JSON. No markdown or text outside the JSON object.
- Use double quotes for all JSON keys and string values.
- If the topic is study-related, generate a helpful educational answer.
- NEVER include links.
- Do not send anything outside the JSON object.

This is the question: "${question}"
`;

	const requestData = {
		contents: [
			{
				role: "user",
				parts: [
					{
						text: prompt,
					},
				],
			},
		],
	};

	let ai_response;

	try {
		const response = await axios.post(API_URL, requestData, {
			headers: { "Content-Type": "application/json" },
		});

		const aiGeneratedText =
			response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
		// console.log(`🔹 AI Response for "${topic}":`, aiGeneratedText);
		if (!aiGeneratedText)
			throw new ApiError(500, `Invalid AI response for "${question}"`);
		
		try {
			// console.log(aiGeneratedText)
			console.log("Ai generated test",aiGeneratedText,"\n\n")
			const jsonMatch = aiGeneratedText.match(/\{[\s\S]*\}/);
			// console.log(jsonMatch, "json match");
			if (!jsonMatch) throw new Error("No JSON found in response.");
			ai_response = JSON.parse(jsonMatch[0]);
			// console.log("AI Response",ai_response);
		} catch (err) {
			throw new ApiError(
				300,
				"Something went wrong while parsing the JSON: " + err.message
			);
		}
	} catch (error) {
		// console.log(aiGeneratedText)
		throw new ApiError(500, "Cannot convert to json");
	}

	// console.log(question,aiResponse)
	return res
		.status(200)
		.json(new ApiResponse(200, ai_response, "Got Response"));
});

const generateQuestion = asyncHandler(async (req, res) => {
	const { topics } = req.body;
	if (!topics || !Array.isArray(topics) || topics.length === 0) {
		throw new ApiError(404, "Missing or empty details");
	}

	const questionPromises = topics.map(async (topic) => {
		const prompt = `
		Generate a set of **exactly 5 to 10 multiple-choice questions** (MCQs) on the topic "${topic}".  
		Ensure each question follows this **strict JSON format**:

		[
			{
				"question": "What is AI?",
				"options": {
				"A": "Artificial Intelligence",
				"B": "Automated Input",
				"C": "Advanced Interaction",
				"D": "Analytical Insight"
				},
			"correct": "A
			},
			...
		]

		**Rules:**
		- Each question must have exactly 4 options labeled "A", "B", "C", and "D".
		- Provide only valid JSON. Do not include any explanations or extra text.
		`;

		const requestData = {
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		};

		try {
			const response = await axios.post(API_URL, requestData, {
				headers: { "Content-Type": "application/json" },
			});

			const aiGeneratedText =
				response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
			// console.log(`🔹 AI Response for "${topic}":`, aiGeneratedText);

			if (!aiGeneratedText)
				throw new Error(`Invalid AI response for "${topic}"`);

			// ✅ Extract and parse JSON safely
			const jsonMatch = aiGeneratedText.match(/\[[\s\S]*\]/);
			if (!jsonMatch)
				throw new Error(`Invalid JSON format received for "${topic}"`);

			let questions;
			try {
				questions = JSON.parse(jsonMatch[0]);
				if (!Array.isArray(questions))
					throw new Error("AI did not return an array.");
			} catch (parseError) {
				throw new Error(
					`Failed to parse JSON for "${topic}": ${parseError.message}`
				);
			}

			// ✅ Ensure AI returns between 5 and 10 questions
			if (questions.length < 5) {
				throw new Error(
					`AI returned only ${questions.length} questions, expected at least 5.`
				);
			}

			return { topic, questions: questions.slice(0, 10) };
		} catch (error) {
			console.error(
				`❌ Error generating questions for "${topic}":`,
				error.message
			);
			return { topic, error: error.message };
		}
	});

	const results = await Promise.all(questionPromises);
	const successfulTopics = results.filter((r) => !r.error);
	const failedTopics = results.filter((r) => r.error);

	if (successfulTopics.length === 0) {
		throw new ApiError(500, "Failed to generate Question for all topics");
	}

	return res.status(200).json({ topics: successfulTopics, failedTopics });
});

export default {
	getResponse,
	generateQuestion,
};
