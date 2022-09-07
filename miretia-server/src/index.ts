import "reflect-metadata";
import { __prod__ } from "./constants";
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "apollo-server";
import { context } from "./context";
import * as tq from "type-graphql";
import { GraphQLScalarType } from "graphql";
import { DateTimeResolver } from "graphql-scalars";
import { UserResolver } from "./resolvers/user";

const prisma = new PrismaClient();

const main = async () => {
	const schema = await tq.buildSchema({
		resolvers: [UserResolver],
		scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
	});

	new ApolloServer({ schema, context: context }).listen({ port: 4000 }, () =>
		console.log(`
            🚀 Server ready at: http://localhost:4000
            ⭐️  See sample queries: http://pris.ly/e/ts/graphql-typegraphql#using-the-graphql-api`)
	);
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
