import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	Box,
	Button,
	Input,
	VStack,
	Text,
	HStack,
	Icon,
} from "@chakra-ui/react";
import { FaPhone, FaEnvelope, FaFacebook } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { login as authLogin } from "../store/authSlice";

function LoginSignup() {
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const userdata = useSelector((state) => state.authSlice.userData);
	const { type } = useParams();
	const [isSignUp, setIsSignUp] = useState(type === "signup");
	const [otpVerification, setOtpVerification] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (userdata) {
			navigate("/");
		}
	}, [userdata]);

	useEffect(() => {
		setIsSignUp(type === "signup");
	}, [type]);

	const validateForm = () => {
		let newErrors = {};
		if (isSignUp && !formData.name.trim()) {
			newErrors.name = "Full Name is required";
		}
		if (!formData.email.includes("@") || !formData.email.includes(".")) {
			newErrors.email = "Invalid email format";
		}
		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(formData.password)) {
			newErrors.password =
				"Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};


	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;
		// console.log('hi')
		setIsLoading(true);
		const endpoint = isSignUp
			? "http://localhost:8000/api/v1/users/register"
			: "http://localhost:8000/api/v1/users/login";
		const body = isSignUp
			? {
					name: formData.name,
					email: formData.email,
					password: formData.password,
			  }
			: { email: formData.email, password: formData.password };

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				credentials: "include",
			});

			const data = await response.json();
			if (data.message === "User Login Success") {
				dispatch(authLogin(data.data));
				navigate("/");
			}
			if (data.message === "User creation Success") {
				navigate(`/otpVerification/${data.data.email}`)
			}

			// if (data.message === "Otp Sent") {
			// }
		} catch (error) {
			console.error("Error submitting form:", error);
		}finally{
			setIsLoading(false);
		}
	};

	return (
		<HStack
			w="100vw"
			h="100vh"
			spacing={0}
			overflow="hidden"
		>
			<Box
				w="50%"
				h="100%"
				bgGradient="linear(to-b, teal.300, teal.500)"
				display="flex"
				alignItems="center"
				justifyContent="center"
				flexDirection="column"
				color="white"
			>
				<Text
					fontSize="2xl"
					fontWeight="bold"
				>
					{isSignUp ? "Welcome Back!" : "Hello, Friend!"}
				</Text>
				<Text
					textAlign="center"
					px={6}
				>
					{isSignUp
						? "Sign in to continue"
						: "Enter your personal details and start your journey"}
				</Text>
				<Button
					colorScheme="whiteAlpha"
					onClick={() => setIsSignUp(!isSignUp)}
				>
					{isSignUp ? "Sign In" : "Sign Up"}
				</Button>
			</Box>
			<Box
				w="50%"
				h="100%"
				bg="white"
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<VStack
					spacing={4}
					w="80%"
				>
					<Text
						fontSize="2xl"
						fontWeight="bold"
					>
						{isSignUp ? "Sign Up" : "Sign in to PAT"}
					</Text>
					{isSignUp && (
						<Input
							name="name"
							placeholder="Full Name"
							onChange={handleChange}
							isInvalid={errors.name}
						/>
					)}
					<Input
						name="email"
						placeholder="Email"
						onChange={handleChange}
						isInvalid={errors.email}
					/>
					<Input
						name="password"
						placeholder="Password"
						type="password"
						onChange={handleChange}
						isInvalid={errors.password}
					/>
					{errors.name && <Text color="red.500">{errors.name}</Text>}
					{errors.email && (
						<Text color="red.500">{errors.email}</Text>
					)}
					{errors.password && (
						<Text color="red.500">{errors.password}</Text>
					)}
					<Button
						colorScheme="teal"
						onClick={handleSubmit}
						isLoading={isLoading}
						loadingText={isSignUp?"Registering..." : "Logging in..."}
					>
						{isSignUp ? "Register" : "Login"}
					</Button>
				</VStack>
			</Box>
		</HStack>
	) ;
}

export default LoginSignup;

