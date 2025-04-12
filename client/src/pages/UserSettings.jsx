import React, { useState } from "react";
import {
	Flex,
	Box,
	Avatar,
	Text,
	Button,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	VStack,
	Spinner,
	useToast,
} from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice.js";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function UserSettings() {
	const user = useSelector((state) => state.authSlice.userData);
	const history = useSelector((state) => state.chatTopic.topics);
	const dispatch = useDispatch();
	const toast = useToast();

	const navigate = useNavigate()

	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			const res = await fetch(
				"http://localhost:8000/api/v1/users/logout",
				{
					method: "POST",
					credentials: "include",
				}
			);
			if (!res.ok) {
				throw new Error("Getting problem while logging out");
			}
			dispatch(logout());
			toast({
				title: "Logged out successfully.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			toast({
				title: "Logout failed.",
				description: error.message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoggingOut(false);
		}
	};

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

				<Flex
					flex="1"
					justify="center"
				>
					<Box
						flex="1"
						p={6}
						mx={4}
						bg="white"
						borderRadius="lg"
						boxShadow="md"
						W="100%"
						overflowY="auto"
					>
						<VStack
							spacing={6}
							align="start"
						>
							<Flex
								alignItems="center"
								gap={4}
							>
								<Avatar
									size="xl"
									name={user?.name}
									src={user?.avatar}
								/>
								<Box>
									<Text
										fontSize="2xl"
										fontWeight="bold"
									>
										{user?.name || "Anonymous"}
									</Text>
									<Text
										color="gray.500"
										fontSize="md"
									>
										{user?.email || "No email available"}
									</Text>
								</Box>
							</Flex>

							<Tabs
								variant="enclosed-colored"
								colorScheme="teal"
								width="100%"
							>
								<TabList>
									<Tab fontWeight="600">About Me</Tab>
									<Tab fontWeight="600">History</Tab>
									<Tab fontWeight="600">Suggestions</Tab>
									<Tab fontWeight="600">My Results</Tab>
								</TabList>

								<TabPanels mt={4}>
									<TabPanel>
										<Text fontSize="md">
											{user?.bio || "No bio available."}
										</Text>
									</TabPanel>

									<TabPanel>
										{history && history.length > 0 ? (
											<VStack
												spacing={2}
												align="stretch"
												maxH="300px"
												overflowY="auto"
											>
												{history.map((item, i) => (
													<Flex
														key={i}
														p={3}
														bg="gray.100"
														borderRadius="md"
														align="center"
														gap={2}
														boxShadow="sm"
													>
														<FaHistory color="teal" />
														<Text fontSize="sm">
															{item}
														</Text>
													</Flex>
												))}
											</VStack>
										) : (
											<Text
												color="gray.400"
												fontStyle="italic"
											>
												No history available.
											</Text>
										)}
									</TabPanel>

									<TabPanel>
										<Text color="gray.600">
											AI-generated suggestions will appear
											here.
										</Text>
									</TabPanel>

									<TabPanel>
										<Text color="gray.600">
											User test results will be listed
											here.
										</Text>
									</TabPanel>
								</TabPanels>
							</Tabs>

							{user ? (
								<Button
									colorScheme="red"
									mt={4}
									onClick={handleLogout}
									isLoading={isLoggingOut}
									loadingText="Logging out..."
								>
									Logout
								</Button>
							) : (
								<Button
									colorScheme="green"
									mt={4}
									onClick={()=>{navigate('/authentication/login')}}
								>
									Login
								</Button>
							)}
						</VStack>
					</Box>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default UserSettings;
