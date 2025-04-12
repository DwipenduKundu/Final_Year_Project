import React, { useEffect, useState } from "react";
import {
	Flex,
	Box,
	Text,
	Select,
	Spinner
} from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";

const API_KEY = "AIzaSyB1HER_RkL-8-zBKyt93BaR5IlcQtSDGvk";
const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

const YouTube = () => {
	const [topic, setTopic] = useState("");
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(false);

	const savedTopics = useSelector(state => state.chatTopic.topics || []);
	
	useEffect(() => {
		if (savedTopics.length > 0) {
			setTopic(savedTopics[savedTopics.length - 1]);
		}
	}, [savedTopics]);

	useEffect(() => {
		if (!topic) return;

		const fetchVideos = async () => {
			setLoading(true);
			try {
				const response = await fetch(
					`${BASE_URL}?part=snippet&q=${encodeURIComponent(topic + " education")}&type=video&maxResults=6&key=${API_KEY}`
				);
				const data = await response.json();
				if (data.items) {
					setVideos(data.items);
				}
			} catch (error) {
				console.error("Error fetching YouTube videos:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchVideos();
	}, [topic]);

	return (
		<Flex h="100vh" width="100%" flexDirection="column">
			<Flex height="100%" p={4} px={0}>
				<Flex flexDirection="column" px="0" alignItems="center" justifyContent="center">
					<Sidebar />
				</Flex>

				<Box flex={1} p={4} mx={4} overflowY="auto" bg={'gray.200'} borderRadius={'20px'}>
					<Text fontSize="2xl" fontWeight="bold" mb={2}>
						🎥 Educational YouTube Videos
					</Text>

					<Select
						placeholder="Select a Topic"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
						mb={4}
						bg={'white'}
					>
						{savedTopics.length > 0 ? (
							savedTopics.map((t, index) => (
								<option key={index} value={t}>
									{t}
								</option>
							))
						) : (
							<option disabled>No topics found</option>
						)}
					</Select>

					{loading ? (
						<Flex justify="center" align="center" h="60%">
							<Spinner size="xl" color="purple.500" />
						</Flex>
					) : (
						<Flex flexWrap="wrap" gap={4} justifyContent="center" py={4}>
							{videos.length > 0 ? (
								videos.map((video) => (
									<Box
										key={video.id.videoId}
										width={["100%", "45%", "30%"]}
										bg="purple.100"
										borderRadius="md"
										p={3}
										boxShadow="md"
									>
										<iframe
											width="100%"
											height="180"
											src={`https://www.youtube.com/embed/${video.id.videoId}`}
											title={video.snippet.title}
											frameBorder="0"
											allowFullScreen
										></iframe>
										<Text fontSize="sm" mt={2} textAlign="center">
											{video.snippet.title}
										</Text>
									</Box>
								))
							) : (
								<Text mt={4}>No videos found for this topic.</Text>
							)}
						</Flex>
					)}
				</Box>
			</Flex>
		</Flex>
	);
};

export default YouTube;
