import { useState, useEffect, useRef } from "react";
import {
	Box,
	Button,
	Input,
	Text,
	Flex,
	Heading,
	Spinner
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as authLogin } from "../store/authSlice.js";

export default function OtpVerification() {
	const { email } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [timer, setTimer] = useState(10 * 60); // 10 minutes
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const firstInputRef = useRef(null);

	useEffect(() => {
		firstInputRef.current?.focus();
	}, []);

	const handleChange = (index, value) => {
		setError("");
		if (isNaN(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value.slice(-1); // Only keep last digit
		setOtp(newOtp);

		if (value && index < 5) {
			document.getElementById(`otp-input-${index + 1}`)?.focus();
		}
	};

	const handleNext = async () => {
		if (timer === 0) {
			setError("Time expired. Please request a new OTP.");
			return;
		}

		setLoading(true);
		const completeOtp = otp.join("");

		try {
			const response = await fetch("http://localhost:8000/api/v1/users/verifyOTP", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ otp: completeOtp, email }),
				credentials: "include"
			});

			if (!response.ok) {
				setError("Verification failed. Please try again.");
				return;
			}

			const data = await response.json();
			if (data.message === "Verified Success") {
				dispatch(authLogin(data.data));
				navigate("/");
			} else {
				setError("Incorrect OTP. Please check and try again.");
			}
		} catch (err) {
			console.error(err);
			setError("Server error. Try again later.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
			return () => clearInterval(interval);
		}
	}, [timer]);

	return (
		<Flex
			direction="column"
			align="center"
			justify="center"
			height="100vh"
			bgGradient="linear(to-b, teal.300, teal.600)"
		>
			<Heading color="white" mb={4}>OTP Verification</Heading>
			<Text color="white" mb={2}>Enter the OTP sent to your email</Text>

			{error && <Text color="red.300" mb={2}>{error}</Text>}

			<Flex gap={2} mb={4}>
				{otp.map((value, index) => (
					<Input
						key={index}
						id={`otp-input-${index}`}
						ref={index === 0 ? firstInputRef : null}
						type="text"
						maxLength="1"
						textAlign="center"
						fontSize="2xl"
						width="50px"
						height="50px"
						borderRadius="md"
						bg="white"
						onChange={(e) => handleChange(index, e.target.value)}
						value={value}
					/>
				))}
			</Flex>

			<Text color="white" mb={4}>
				{`${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`}
			</Text>

			<motion.div whileTap={{ scale: 0.95 }}>
				<Button
					colorScheme="teal"
					size="lg"
					borderRadius="full"
					isDisabled={otp.includes("") || loading}
					onClick={handleNext}
					isLoading={loading}
					loadingText="Verifying..."
				>
					Next →
				</Button>
			</motion.div>
		</Flex>
	);
}
