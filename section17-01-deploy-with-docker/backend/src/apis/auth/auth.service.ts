import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import {
  AuthServiceLogin,
  IAuthServiceGetAccessToken,
  IAuthServiceRestoreToken,
  IAuthServiceSetRefreshToken,
} from './interfaces/auth-service.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password, context }: AuthServiceLogin): Promise<string> {
    // 이메일 존재 검증
    const user = await this.usersService.findOneByEmail({ email });
    if (!user) {
      throw new UnprocessableEntityException('이메일이 없습니다.');
    }

    // 비밀번호 일치 검증
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      throw new UnprocessableEntityException('비밀번호가 일치하지 않습니다.');
    }

    // refresh token 쿠키 생성 및 전달
    this.setRefreshToken({ user, context });

    // access token(JWT) 생성
    return this.getAccessToken({ user });
  }

  getAccessToken({ user }: IAuthServiceGetAccessToken): string {
    //const token = await this.jwtService.signAsync(payload);
    const token = this.jwtService.sign(
      { sub: user.id },
      { secret: '나의비밀번호', expiresIn: '1h' },
    );

    return token;
  }

  //////////////////
  restoreAccessToken({ user }: IAuthServiceRestoreToken): string {
    return this.getAccessToken({ user });
  }

  getRefreshToken({ user }: IAuthServiceGetAccessToken): string {
    const token = this.jwtService.sign(
      { sub: user.id },
      { secret: '나의리프레시비밀번호', expiresIn: '2w' },
    );

    return token;
  }

  setRefreshToken({ user, context }: IAuthServiceSetRefreshToken) {
    // refresh token 생성
    const refreshToken = this.getRefreshToken({ user });

    // 개발환경
    context.res.setHeader(
      'set-Cookie',
      `refreshToken=${refreshToken}; path=/;`,
    );
    // 운영환경
    // context.res.setHeader(
    //   'set-Cookie',
    //   `refreshToken=${refreshToken}; path=/; domain=127.0.0.1; SameSite=None; Secure; httpOnly;`,
    // );
    //context.res.setHeader('Access-Control-Allow-Origin', 'http://localhost'); // 접근 가능한 Origin 주소
  }
}
