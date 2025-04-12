import React, { useState, useEffect } from "react";
import {
	Flex,
	Box,
	useColorModeValue,
	VStack,
	Text,
	Icon,
} from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { useSelector } from "react-redux";
import { FaClock } from "react-icons/fa";

function Chat() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setTimeout(() => setIsLoading(false), 1500);
	}, []);

	const topic = useSelector((state) => state.chatTopic.topics);

	return (
		<Flex h="100vh" width="100%" flexDirection="column">
			<Flex height="100%" p={4} px={0}>
				<Flex
					flexDirection="column"
					px="0"
					alignItems="center"
					justifyContent="center"
				>
					<Sidebar />
				</Flex>

				<ChatBox />

				{/* Beautified History Box */}
				<Flex
					flexDirection="column"
					alignItems="center"
					gap={4}
					p={4}
				>
					<Box
						w="300px"
						// bgGradient="linear(to-br, teal.100, teal.300)"
						bg={'gray.100'}
						p={4}
						// h="fit-content"
						borderRadius="xl"
						// boxShadow="lg"
						// overflow="hidden"
					>
						<Box
							bg="white"
							p={3}
							borderRadius="md"
							textAlign="center"
							mb={3}
							boxShadow="sm"
						>
							<Text fontSize="lg" fontWeight="bold" color="teal.700">
								🕓 Topic History
							</Text>
						</Box>

						<Box
							maxH="100%"
							overflowY="auto%"
							pr={2}
						>
							{topic && topic.length > 0 ? (
								<VStack spacing={2} align="stretch">
									{topic.map((item, i) => (
										<Flex
											key={i}
											bg="white"
											p={2}
											borderRadius="md"
											align="center"
											_hover={{ bg: "teal.50", cursor: "pointer" }}
											boxShadow="sm"
										>
											<Icon as={FaClock} mr={2} color="teal.500" />
											<Text
												fontSize="sm"
												color="gray.700"
												// isTruncated
											>
												{item}
											</Text>
										</Flex>
									))}
								</VStack>
							) : (
								<Text color="gray.700" fontStyle="italic">
									No topics yet.
								</Text>
							)}
						</Box>
					</Box>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default Chat;
