import React, { useState, useEffect } from "react";
import {
	Flex,
	Box,
	Select,
	Button,
	Text,
	RadioGroup,
	Stack,
	Radio,
} from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";

function Quiz() {
	const [topic, setTopic] = useState("");
	const [topics, setTopics] = useState([]);
	const [questions, setQuestions] = useState([]);
	const [answers, setAnswers] = useState({});
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [score, setScore] = useState(0);
	const [savedScores, setSavedScores] = useState([]);

	const savedTopics = useSelector(state => state.chatTopic.topics);
	useEffect(() => {
		setTopics(savedTopics);
	}, [savedTopics]);

	const fetchAIQuestions = async () => {
		if (!topic) return alert("Please select a topic first!");

		setLoading(true);
		setQuestions([]);
		setAnswers({});
		setSubmitted(false);
		setScore(0);

		try {
			const response = await fetch(
				"http://localhost:8000/api/v1/chat/generateQuestions",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ topics: [topic] }),
					credentials: 'include'
				}
			);

			if (!response.ok)
				throw new Error(`HTTP error! Status: ${response.status}`);

			const data = await response.json();
			if (
				data.topics?.length > 0 &&
				Array.isArray(data.topics[0].questions)
			) {
				setQuestions(data.topics[0].questions);
			} else {
				alert("No questions generated. Try another topic.");
			}
		} catch (error) {
			console.error("Error fetching AI questions:", error);
			alert("Failed to fetch questions. Please check the console for details.");
		} finally {
			setLoading(false);
		}
	};

	const handleAnswerSelect = (questionIndex, selectedOption) => {
		setAnswers((prev) => ({ ...prev, [questionIndex]: selectedOption }));
	};

	const handleSubmit = () => {
		let newScore = 0;
		questions.forEach((q, index) => {
			if (answers[index] === q.correct) newScore++;
		});
		setScore(newScore);
		setSubmitted(true);
		setSavedScores([...savedScores, { topic, score: newScore, total: questions.length }]);
	};

	const startNewTest = () => {
		setTopic("");
		setQuestions([]);
		setAnswers({});
		setSubmitted(false);
		setScore(0);
	};

	return (
		<Flex h={"100vh"} width={"100%"} flexDirection={"column"}>
			<Flex height={"100%"} p={4} px={0}>
				<Flex flexDirection={"column"} px="0" alignItems={"center"} justifyContent={"center"}>
					<Sidebar />
				</Flex>
				<Box flex={1} p={4} mx={4} overflowY="auto">
					<Text fontSize="2xl" fontWeight="bold">📝 AI-Generated Quiz</Text>
					{!submitted && (
						<>
							<Select placeholder="Select a Topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
								{topics.length > 0 ? (
									topics.map((t, index) => (
										<option key={index} value={t}>{t}</option>
									))
								) : (
									<option disabled>No topics found</option>
								)}
							</Select>
							<Button mt={2} onClick={fetchAIQuestions} isLoading={loading} isDisabled={!topic} colorScheme="blue">
								{loading ? "Generating..." : "Generate Questions"}
							</Button>
							{questions.length > 0 && (
								<Box mt={4}>
									<Text fontSize="lg" fontWeight="bold">🧐 Questions</Text>
									{questions.map((q, index) => (
										<Box key={index} p={4} my={2} borderWidth={"1px"} borderRadius={"md"}>
											<Text fontWeight="bold">{index + 1}. {q.question}</Text>
											<RadioGroup value={answers[index] || ""} onChange={(val) => handleAnswerSelect(index, val)}>
												<Stack>
													{Object.entries(q.options).map(([key, option]) => (
														<Radio key={key} value={key} colorScheme={answers[index] ? (key === q.correct ? "green" : "red") : "gray"}>
															{option} {answers[index] && (key === q.correct ? "✅" : (answers[index] === key ? "❌" : ""))}
														</Radio>
													))}
												</Stack>
											</RadioGroup>
										</Box>
									))}
									<Button mt={2} onClick={handleSubmit} colorScheme="green">Submit Answers</Button>
							</Box>
						)}
					</>
				)}
				{submitted && (
					<Box mt={4} p={4} borderWidth={"1px"} borderRadius={"md"}>
						<Text fontSize="xl" fontWeight="bold">🎯 Scorecard</Text>
						<Text>Your Score: {score} / {questions.length}</Text>
						<Button mt={2} onClick={startNewTest} colorScheme="blue">Start New Test</Button>
					</Box>
				)}
			</Box>
		</Flex>
	</Flex>
	);
}

export default Quiz;
