import React, { useState, useEffect } from "react";
import {
	Flex,
	Box,
	Text,
	Link,
	Select,
	Spinner,
	Center,
} from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";

function Wikipedia() {
	const topics = useSelector((state) => state.chatTopic.topics);
	const [selectedTopic, setSelectedTopic] = useState("");
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false); // 👈 Loading state

	// Set default topic to latest
	useEffect(() => {
		if (topics.length > 0) {
			setSelectedTopic(topics[topics.length - 1]);
		}
	}, [topics]);

	// Fetch Wikipedia results
	useEffect(() => {
		if (!selectedTopic) return;

		const fetchWikipediaResults = async () => {
			setLoading(true); // Start loading
			try {
				const response = await fetch(
					`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${selectedTopic}`
				);
				const data = await response.json();

				if (data.query && data.query.search) {
					setResults(data.query.search);
				} else {
					setResults([]);
				}
			} catch (error) {
				console.error("Error fetching Wikipedia data:", error);
				setResults([]);
			}
			setLoading(false); // Done loading
		};

		fetchWikipediaResults();
	}, [selectedTopic]);

	return (
		<Flex
			h="100vh"
			width="100%"
			flexDirection="column"
		>
			<Flex
				height="100%"
				p={4}
				px={0}
			>
				<Flex
					flexDirection="column"
					px="0"
					alignItems="center"
					justifyContent="center"
				>
					<Sidebar />
				</Flex>

				<Box
					flex={1}
					p={4}
					h="95vh"
					bg="gray.200"
					borderRadius="20px"
					mx={4}
					display="flex"
					flexDirection="column"
				>
					<Text
						fontSize="2xl"
						fontWeight="bold"
					>
						📖 Wikipedia Search
					</Text>

					{topics.length > 0 && (
						<Select
							mt={4}
							value={selectedTopic}
							onChange={(e) => setSelectedTopic(e.target.value)}
							w="full"
							bg="white"
							borderColor="gray.400"
							boxShadow="sm"
						>
							{topics.map((topic, index) => (
								<option
									key={index}
									value={topic}
								>
									{topic}
								</option>
							))}
						</Select>
					)}

					{selectedTopic && (
						<Text my={2}>
							Showing results for:{" "}
							<strong>{selectedTopic}</strong>
						</Text>
					)}

					{/* Scrollable content */}
					<Box
						mt={4}
						flex={1}
						overflowY="auto"
						pr={2}
					>
						{loading ? (
							<Center py={10}>
								<Spinner
									size="xl"
									thickness="4px"
									speed="0.65s"
									color="blue.500"
								/>
							</Center>
						) : results.length > 0 ? (
							results.map((article) => (
								<Box
									key={article.pageid}
									p={4}
									my={2}
									borderWidth="1px"
									borderRadius="md"
									bg="white"
								>
									<Text
										fontSize="lg"
										fontWeight="bold"
									>
										{article.title}
									</Text>
									<Text
										dangerouslySetInnerHTML={{
											__html: article.snippet,
										}}
									></Text>
									<Link
										href={`https://en.wikipedia.org/?curid=${article.pageid}`}
										isExternal
										color="blue.500"
										mt={2}
										display="inline-block"
									>
										Read More
									</Link>
								</Box>
							))
						) : (
							<Text>
								No Wikipedia articles found. Try another topic.
							</Text>
						)}
					</Box>
				</Box>
			</Flex>
		</Flex>
	);
}

export default Wikipedia;
