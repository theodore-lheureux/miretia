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

@ObjectType()
class BooleanResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { nullable: true })
  boolean?: boolean;
}

@Resolver(UserResponse)
export class UserResolver {
  @Query(() => [User])
  async allUsers(@Ctx() ctx: Context) {
    return ctx.prisma.user.findMany();
  }

  @Query(() => UserResponse)
  async user(
    @Arg("id") id: number,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
    var user: User | null = await ctx.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (user)
      return {
        user,
      };
    else
      return {
        errors: [
          {
            field: "id",
            message: "No user with corresponding ID.",
          },
        ],
      };
  }

  @Query(() => UserResponse)
  async userByEmail(
    @Arg("email") email: string,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
    var user = await ctx.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user)
      return {
        user,
      };
    return {
      errors: [
        {
          field: "email",
          message: "No user with corresponding email.",
        },
      ],
    };
  }

  @Query(() => UserResponse)
  async userByName(
    @Arg("username") username: string,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
    var user = await ctx.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) {
      return {
        user,
      };
    }

    return {
      errors: [
        {
          field: "username",
          message: "No user with corresponding username.",
        },
      ],
    };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
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

  @Mutation(() => BooleanResponse)
  async deleteUser(
    @Arg("id") id: number,
    @Ctx() ctx: Context
  ): Promise<BooleanResponse> {
    var user = await ctx.prisma.user.delete({
      where: {
        id,
      },
    });
    if (user)
      return {
        boolean: true,
      };
    return {
      errors: [
        {
          field: "id",
          message: "No user with corresponding ID.",
        },
      ],
    };
  }
}
