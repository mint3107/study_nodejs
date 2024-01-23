import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    // 토큰이 시크릿키를 통해 암호화된것이 맞는지, 만료시간이 지났는지
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const token = cookie.replace('refreshToken=', '');
        return token;
      },
      secretOrKey: '나의리프레시비밀번호',
    });
  }

  // 토큰 성공 시 검증
  validate(payload) {
    console.log('--- 리프레시 성공');
    console.log(payload);
    return {
      id: payload.sub,
    };
  }
  // req.user = {id:payload.sub}
}
