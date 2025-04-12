import React, { useEffect } from "react";
import { Box, Text, VStack, HStack, Icon } from "@chakra-ui/react";
import {
	FaWikipediaW,
	FaComments,
	FaYoutube,
	FaClipboardList,
	FaUserCircle,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Home() {
	const navigate = useNavigate()
	const userData = useSelector(state => state.authSlice.userData);
	
	useEffect(()=>{
		if(!userData){
			navigate('/authentication/login')
		}
		// console.log(userData)
	},userData)

	return (
		<Box
			w="100vw"
			h="100vh"
			bg="gray.100"
			display="flex"
			flexDirection="column"
			alignItems="center"
		>
			{/* Header */}
			<Box
				w="full"
				bgGradient="linear(to-r, teal.200, teal.400)"
				py={4}
				h={'30%'}
				// textAlign="center"
				display={'flex'}
				alignItems={'center'}
				justifyContent={'center'}
			>
				<Text
					fontSize="3xl"
					fontWeight="bold"
					fontFamily="cursive"
				>
					Dashboard
				</Text>
			</Box>

			{/* Welcome Message */}
			<VStack
				mt={6}
				spacing={2}
			>
				<Text fontSize="2xl">Hello , {userData?.name}</Text>
				<Text
					fontSize="xl"
					textAlign="center"
				>
					Welcome to PAT, your personal AI assistant for
					learning......
				</Text>
			</VStack>

			{/* Action Icons */}
			<Text
				mt={8}
				fontSize="xl"
				fontWeight="bold"
			>
				Let’s get started...
			</Text>
			<HStack
				mt={10}
				spacing={10}
			>
				<Icon
					as={FaWikipediaW}
					boxSize={10}
					onClick={()=>{navigate('/wikipedia-search')}}
				/>
				<Icon
					as={FaComments}
					boxSize={10}
					color="yellow.500"
					onClick={()=>{navigate('/chat')}}
				/>
				<Icon
					as={FaYoutube}
					boxSize={10}
					color="red.500"
					onClick={()=>{navigate('/youtube-recommendation')}}
				/>
				<Icon
					as={FaClipboardList}
					boxSize={10}
					onClick={()=>{navigate('/quiz')}}
				/>
			</HStack>

			{/* User Profile Icon */}
			<Box
				position="absolute"
				bottom={4}
				right={4}
			>
				<Icon
					as={FaUserCircle}
					boxSize={8}
					color="gray.600"
					onClick={()=>navigate('/userSettings')}
				/>
			</Box>
		</Box>
	);
}

export default Home;
