import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
	if (options.username.length <= 2) {
		return [
			{
				field: "username",
				message: "Username must be at least 3 characters.",
			},
		];
	} else if (options.username.includes("@")) {
		return [
			{
				field: "username",
				message: 'Username cannot include "@".',
			},
		];
	}

	if (!options.email.includes("@")) {
		return [
			{
				field: "email",
				message: "Incorrect Email format.",
			},
		];
	}

	if (options.password.length <= 2) {
		return [
			{
				field: "password",
				message: "Password must contain more than two characters.",
			},
		];
	}

	return null;
};
