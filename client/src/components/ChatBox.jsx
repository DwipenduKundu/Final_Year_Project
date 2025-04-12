import React, { useEffect, useRef, useState } from "react";
import {
	Box,
	VStack,
	HStack,
	IconButton,
	Input,
	Flex,
	useColorModeValue,
	Heading,
	Text,
	ListItem,
	UnorderedList,
} from "@chakra-ui/react";
import { FaMicrophone, FaPaperPlane, FaTrash } from "react-icons/fa";
import { addTopic, deleteTopic } from "../store/chatTopicSlice";
import { useDispatch, useSelector } from "react-redux";
import { deleteChat, setChat } from "../store/prevChatSlice";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

const markdownComponents = {
	h1: (props) => (
		<Heading
			as="h1"
			size="xl"
			my={2}
			{...props}
		/>
	),
	h2: (props) => (
		<Heading
			as="h2"
			size="lg"
			my={2}
			{...props}
		/>
	),
	h3: (props) => (
		<Heading
			as="h3"
			size="md"
			my={2}
			{...props}
		/>
	),
	p: (props) => (
		<Text
			fontSize="md"
			my={2}
			{...props}
		/>
	),
	ul: ({ children, ...props }) => (
		<UnorderedList
			pl={5}
			my={2}
			{...props}
		>
			{children}
		</UnorderedList>
	),
	li: ({ children, ...props }) => (
		<Box
			as="li"
			mb={1}
			ml={4}
			{...props}
		>
			{children}
		</Box>
	),
	
	code: (props) => (
		<Box
			as="code"
			bg="gray.100"
			color="purple.600"
			px={2}
			py={1}
			borderRadius="md"
			fontFamily="mono"
			fontSize="sm"
			whiteSpace="pre-wrap"
			fontWeight="semibold"
			{...props}
		/>
	),
	pre: (props) => (
		<Box
			as="pre"
			bg="gray.900"
			color="white"
			p={4}
			borderRadius="md"
			overflowX="auto"
			fontSize="sm"
			fontFamily="mono"
			mb={4}
			border="1px solid"
			borderColor="gray.700"
			boxShadow="md"
			{...props}
		/>
	),
};

function ChatBox() {
	const [messages, setMessages] = useState([]);
	const [botTyping, setBotTyping] = useState(false);

	const [input, setInput] = useState("");
	const chatEndRef = useRef(null);
	const prevChats = useSelector((state) => state.chatHistory.chats);

	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setChat(messages));
		chatEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end",
		});
	}, [messages]);

	useEffect(() => {
		if (prevChats) {
			setMessages(prevChats);
		}
	}, []);

	const handleSendMessage = async () => {
		if (input.trim() === "") return;

		const newMessage = { text: input.toUpperCase(), sender: "user" };
		setMessages((prevMessages) => [...prevMessages, newMessage]);
		setInput("");
		setBotTyping(true);

		try {
			const response = await fetch(
				"http://localhost:8000/api/v1/chat/getResponse",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						question: "Describe and teach about " + input,
					}),
					credentials: "include",
				}
			);

			const data = await response.json();

			if (response.ok) {
				const botMessage = {
					text: data.data.ai_response,
					sender: "bot",
				};
				setMessages((prevMessages) => [...prevMessages, botMessage]);

				if (data.data.topic) dispatch(addTopic(data.data.topic));
			} else {
				throw new Error(data.error || "AI response failed");
			}
		} catch (error) {
			console.error("Error fetching response:", error);
			setMessages((prevMessages) => [
				...prevMessages,
				{
					text: "⚠️ AI is not responding. Try again later.",
					sender: "bot",
				},
			]);
		}
		setBotTyping(false);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleClearChat = () => {
		setMessages([]);
		dispatch(deleteChat());
		dispatch(deleteTopic());
	};

	const handleVoiceInput = () => {
		if (!("webkitSpeechRecognition" in window)) {
			alert("Voice recognition not supported. Try Chrome.");
			return;
		}
		const recognition = new window.webkitSpeechRecognition();
		recognition.lang = "en-US";
		recognition.continuous = false;
		recognition.interimResults = false;

		recognition.onresult = (event) => {
			const transcript = event.results[0][0].transcript;
			setInput(transcript);
		};
		recognition.onerror = (event) =>
			console.error("Voice recognition error:", event.error);

		recognition.start();
	};

	const botBg = useColorModeValue("gray.200", "gray.700");
	const userBg = useColorModeValue("blue.400", "blue.600");
	const textColor = useColorModeValue("black", "white");

	return (
		<Flex
			direction="column"
			h="100%"
			w="full"
			p={4}
		>
			<Box
				flex={1}
				overflowY="auto"
				p={4}
				bg={useColorModeValue("gray.50", "gray.800")}
				borderRadius="lg"
				maxH="100%"
			>
				<VStack
					spacing={3}
					align="stretch"
				>
					{messages.map((msg, index) => (
						<HStack key={index}>
							<Box
								bg={msg.sender === "user" ? userBg : botBg}
								color={textColor}
								px={4}
								py={2}
								borderRadius="lg"
								w={"100%"}
							>
								<ReactMarkdown
									components={markdownComponents}
									rehypePlugins={[rehypeRaw, rehypeHighlight]}
								>
									{msg.text}
								</ReactMarkdown>
							</Box>
						</HStack>
					))}
					{botTyping && (
						<HStack>
							<Box
								bg={botBg}
								color={textColor}
								px={4}
								py={2}
								borderRadius="lg"
								fontStyle="italic"
								fontSize="sm"
								boxShadow="sm"
							>
								<Text
									as="span"
									className="typing-dots"
								>
									💬 &nbsp;Thinking<span className="dot">.</span>
									<span className="dot">.</span>
									<span className="dot">.</span>
								</Text>
							</Box>
						</HStack>
					)}
					<div ref={chatEndRef}></div>
				</VStack>
			</Box>

			<Box
				bg={useColorModeValue("white", "gray.900")}
				p={3}
				borderRadius="full"
				boxShadow="md"
				mt={2}
			>
				<HStack w="full">
					<IconButton
						icon={<FaMicrophone />}
						aria-label="Voice Input"
						colorScheme="teal"
						variant="ghost"
						onClick={handleVoiceInput}
					/>
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Search a Topic to learn..."
						flex={1}
					/>
					<IconButton
						icon={<FaPaperPlane />}
						onClick={handleSendMessage}
						aria-label="Send"
						colorScheme="green"
					/>
					<IconButton
						icon={<FaTrash />}
						onClick={handleClearChat}
						aria-label="Clear Chat"
						colorScheme="red"
						variant="ghost"
					/>
				</HStack>
			</Box>
		</Flex>
	);
}

export default ChatBox;
