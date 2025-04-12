import { useEffect, useState } from "react";
import {
	Box,
	VStack,
	Avatar,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Switch,
	Text,
	IconButton,
} from "@chakra-ui/react";
import {
	FaWikipediaW,
	FaComments,
	FaYoutube,
	FaClipboardList,
	FaUserCircle,
	FaWalking,
	FaCog,
	FaHome,
} from "react-icons/fa";
import { MdQuiz } from "react-icons/md";

import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [darkMode, setDarkMode] = useState(false);
	const [collapsed, setCollapsed] = useState(true);

	const [showcontent, setshowcontent] = useState(false);
	const userData = useSelector(state=> state.authSlice.userData)
	useEffect(() => {
		if (!collapsed) {
			setTimeout(() => {
				setshowcontent(true);
			}, 300);
		} else {
			setshowcontent(false);
		}
	}, [collapsed]);


	return (
		<>
			<Box
				left={collapsed ? "10px" : "0px"}
				h={collapsed ? "20%" : "60%"}
				w={collapsed ? "20px" : "60px"}
				bg="gray.300"
				color="white"
				borderTopRightRadius={"10px"}
				borderBottomRightRadius={"10px"}
				transition="all 0.6s ease-in-out"
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				cursor="pointer"
				boxShadow={'3px 3px 15px teal'}
				// border={'2px  solid white'}
				p={4}
				onClick={() => setCollapsed(!collapsed)}
			>
				{/* User Avatar at the Top (Visible in all states) */}
				{!collapsed && showcontent && (
					<NavLink to={'/userSettings'}>

						<Avatar
							name={userData?.name}
							size={collapsed ? "sm" : "md"}
							src={userData?.avatar}
							onClick={(e)=>{e.stopPropagation();}}
						/>
					</NavLink>
				)}

				{/* Sidebar Icons in the Middle (Hidden when collapsed) */}
				{!collapsed && showcontent && (
					<VStack
						spacing={6}
						flex={1}
						justifyContent="center"
					>
						<NavLink
							to="/"
							onClick={(e) => e.stopPropagation()}
						>
							<FaHome
								size={28}
								color="black"
								style={{ cursor: "pointer" }}
							/>
						</NavLink>
						<NavLink
							to="/chat"
							onClick={(e) => e.stopPropagation()}
						>
							<FaComments
								size={28}
								color="#FFFF00"
								style={{ cursor: "pointer" }}
							/>
						</NavLink>
						<NavLink
							to="/youtube-recommendation"
							onClick={(e) => e.stopPropagation()}
						>
							<FaYoutube
								size={28}
								color="#ff0000"
								style={{ cursor: "pointer" }}
							/>
						</NavLink>
						<NavLink
							to="/wikipedia-search"
							onClick={(e) => e.stopPropagation()}
						>
							<FaWikipediaW
								size={26}
								color="black"
								style={{ cursor: "pointer" }}
							/>
						</NavLink>
						<NavLink
							to="/quiz"
							onClick={(e) => e.stopPropagation()}
						>
							<FaClipboardList
								size={28}
								color="black"
								style={{ cursor: "pointer" }}
							/>
						</NavLink>
					</VStack>
				)}

				{/* Settings Icon at the Bottom (Hidden when collapsed) */}
				{!collapsed && showcontent && (
					<Box
						mt="auto"
						mb={4}
					>
						<FaCog
							size={24}
							onClick={onOpen}
							cursor="pointer"
							color="black"
						/>
					</Box>
				)}
			</Box>

			{/* Settings Modal */}
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				isCentered
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Settings</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
						>
							<Text>Dark Mode</Text>
							<Switch
								isChecked={darkMode}
								onChange={() => setDarkMode(!darkMode)}
							/>
						</Box>
					</ModalBody>
					<ModalFooter>
						<Button
							colorScheme="blue"
							onClick={onClose}
						>
							Save
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default Sidebar;
