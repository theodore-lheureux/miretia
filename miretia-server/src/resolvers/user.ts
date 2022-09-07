import "reflect-metadata";
import {
	Resolver,
	Query,
	Mutation,
	Arg,
	Ctx,
	ObjectType,
	Field,
} from "type-graphql";
import { User } from "../entities/User";
import { Context } from "../context";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import argon2 from "argon2";

@ObjectType()
class FieldError {
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

// @ObjectType()
// class BooleanResponse {
// 	@Field(() => [FieldError], { nullable: true })
// 	errors?: FieldError[];

// 	@Field(() => Boolean, { nullable: true })
// 	boolean?: boolean;
// }

@Resolver(UserResponse)
export class UserResolver {
	@Mutation(() => UserResponse)
	async register(
		@Arg("data") options: UsernamePasswordInput,
		@Ctx() ctx: Context
	): Promise<UserResponse> {
		const errors = validateRegister(options);

		if (errors) {
			return { errors };
		}

		const hashedPassword = await argon2.hash(options.password);
		let user: User;

		try {
			user = await ctx.prisma.user.create({
				data: {
					username: options.username,
					email: options.email,
					password: hashedPassword,
				},
			});
		} catch (error) {
			return {
				errors: [
					{
						field: "username",
						message: "Username/email already exists.",
					},
				],
			};
		}

		return {
			user: user,
		};
	}

	@Query(() => [User])
	async allUsers(@Ctx() ctx: Context) {
		return ctx.prisma.user.findMany();
	}
}
