import {
  Ctx,
  Mutation,
  Query,
  Resolver,
  Arg,
  Subscription,
  Publisher,
  PubSub,
  Root
} from "type-graphql";
import { MyContext } from "../../types/Context";
import { Matches } from "../../entity/Matches";
import { User } from "../../entity/User";
import { In, Not } from "typeorm";
import * as typeorm from "typeorm";
@Resolver(User)
export class UserResolver {
  @Query(() => String)
  async hello() {
    return "Hello World!";
  }
  @Mutation(() => Boolean)
  async logout(
    @Ctx()
    ctx: MyContext
  ): Promise<{}> {
    return new Promise(res => {
      ctx.req.session
        ? ctx.req.session.destroy((err: any) => {
            res(!!err);
          })
        : res(true);
    });
  }

  @Query(() => User, { nullable: true })
  async me(
    @Ctx()
    ctx: MyContext
  ): Promise<User | null | undefined> {
    const { userId = "" } = ctx.req.session || {};
    return userId ? User.findOne(userId) : null;
  }
  @Mutation(() => User, { nullable: true })
  async register(
    @Arg("email") email: string,
    @Arg("name") name: string
  ): Promise<User | null> {
    let user1 = await typeorm.getRepository(User).findOne({ where: { email } });
    if (!user1 && user1 === undefined) {
      const user = await User.create({
        email,
        name
      }).save();
      return user;
    } else {
      return null;
    }
  }
  @Query(() => User, { nullable: true })
  async matcheuser(
    @Arg("matcheid") matcheid: string
  ): Promise<User | undefined> {
    return User.findOne({ where: { id: matcheid } });
  }

  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    ctx.req.session!.userId = user.id;
    return user;
  }

  @Mutation(() => Boolean)
  async like(
    @Ctx() ctx: MyContext,
    @Arg("matcheid") matcheid: string,
    @PubSub("User")
    notifyAboutlike: Publisher<likePayloader>
  ): Promise<Boolean> {
    const userid = ctx.req.session!.userId;
    const OneofUsersGiveDeslike = await User.find({
      where: {
        deslike: In([userid, matcheid])
      }
    });

    if (!OneofUsersGiveDeslike[0] === undefined) {
      return false;
    } else {
      let user = await User.findOne({
        where: {
          id: userid
        }
      });
      let matche = await User.findOne({
        where: {
          id: matcheid
        }
      });

      if (matche && user) {
        if (!user.like.includes(matcheid)) {
          user!.like.push(matcheid);
          await User.save(user);
        }
        const test = user.like.concat(userid).concat(user.deslike);
        const likenotifyuser = await User.findOne({
          where: {
            id: Not(In(test))
          }
        });
        if (likenotifyuser) {
          await notifyAboutlike({
            user: likenotifyuser
          });
        } else {
          await notifyAboutlike({
            user: null
          });
        }

        if (matche.like.includes(userid)) {
          const TheyGiveMatche = await Matches.find({
            join: {
              alias: "matches"
            },
            where: {
              first_like_userid: In([userid, matcheid]),
              last_like_userid: In([userid, matcheid])
            }
          });
          if (!TheyGiveMatche[0]) {
            await Matches.create({
              first_like_userid: userid,
              last_like_userid: matcheid
            }).save();
            return true;
          } else {
            return true;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  @Mutation(() => Boolean)
  async deslike(
    @Arg("matcheid") matcheid: string,
    @Ctx() ctx: MyContext,
    @PubSub("User")
    notifyAboutlike: Publisher<likePayloader>
  ): Promise<Boolean> {
    const userid = ctx.req.session!.userId;
    let user = await User.findOne({
      where: {
        id: userid
      }
    });
    let matche = await User.findOne({
      where: {
        id: matcheid
      }
    });
    if (matche && user) {
      if (
        !matche.deslike.includes(userid) &&
        !user.deslike.includes(matche.id)
      ) {
        matche!.deslike.push(userid);
        user.deslike.push(matcheid);
        await User.save(matche);
        await User.save(user);
      }
      const test = user.like.concat(userid).concat(user.deslike);
      const likenotifyuser = await User.findOne({
        where: {
          id: Not(In(test))
        }
      });
      if (likenotifyuser) {
        await notifyAboutlike({
          user: likenotifyuser
        });
      } else {
        await notifyAboutlike({
          user: null
        });
      }
      return true;
    } else return false;
  }
  @Mutation(() => Boolean)
  async pickuser(
    @Ctx() ctx: MyContext,
    @PubSub("User")
    notifyAboutlike: Publisher<likePayloader>
  ): Promise<Boolean> {
    const userid = ctx.req.session!.userId;
    const user = await User.findOne({
      where: {
        id: userid
      }
    });
    if (user) {
      const test = user.like.concat(userid).concat(user.deslike);
      const likenotifyuser = await User.findOne({
        where: {
          id: Not(In(test))
        }
      });
      if (likenotifyuser) {
        await notifyAboutlike({
          user: likenotifyuser
        });
      } else {
        await notifyAboutlike({
          user: null
        });
      }

      return true;
    }
    return false;
  }

  @Subscription(() => User, {
    topics: "User",
    nullable: true
  })
  async finduser(@Root() newMessage: likePayloader): Promise<User | null> {
    return newMessage.user;
  }
}

interface likePayloader {
  user: User | null;
}
