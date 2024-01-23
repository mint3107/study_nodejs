import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IContext } from 'src/commons/interfaces/context';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  login(
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context: IContext,
  ): Promise<string> {
    return this.authService.login({ email, password, context });
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard('refresh'))
  restoreAccessToken(@Context() context: IContext): string {
    // 여기까지 왔으면 리프레시 토큰 검증 완료 된 것!
    return this.authService.restoreAccessToken({ user: context.req.user });
  }
}
