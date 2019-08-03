import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany
} from "typeorm";
import { ObjectType, Field, ID, Ctx } from "type-graphql";
import { Matches } from "./Matches";
import { MyContext } from "../types/Context";
import { matchesLoaderType } from "../loaders/matchesLoaderType";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @Column({ type: "text", unique: true })
  email: string;

  @Field(() => String)
  @Column({ type: "text" })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  pictureUrl: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  bio: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true })
  lastMessage: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: "simple-array", nullable: true })
  like: string[] = [];

  @Field(() => [String], { nullable: true })
  @Column({ type: "simple-array", nullable: true })
  deslike: string[] = [];

  @OneToMany(() => Matches, m => m.first_like_user)
  first_like_user_Connection: Promise<Matches[]>;

  @OneToMany(() => Matches, m => m.last_like_user)
  last_like_user_Connection: Promise<Matches[]>;

  @Field(() => [matchesLoaderType], { nullable: true })
  async matches(@Ctx() { matchesLoader }: MyContext): Promise<
    matchesLoaderType[]
  > {
    return matchesLoader.load(this.id);
  }
}