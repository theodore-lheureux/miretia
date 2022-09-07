import "reflect-metadata";
import { ObjectType, Field, Int } from "type-graphql";
import { IsEmail } from "class-validator";

@ObjectType()
export class User {
	@Field(() => Int)
	id!: number;

	@Field(() => String)
	updatedAt? = new Date();

	@Field(() => String)
	createdAt? = new Date();

	@Field()
	@IsEmail()
	email!: string;

	@Field(() => String)
	username!: string;

	password!: string;
}
