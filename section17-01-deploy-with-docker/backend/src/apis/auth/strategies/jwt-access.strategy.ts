import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor() {
    // 토큰이 시크릿키를 통해 암호화된것이 맞는지, 만료시간이 지났는지
    super({
      // jwtFromRequest: (req) => {
      //   // accessToken
      //   const temp = req.headers.Authorization;
      //   const accessToken = temp.toLowercase().replace('bearer ', '');
      //   return accessToken;
      // },
      // secretOrKey: '나의비밀번호',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 위 코드와 동일
      secretOrKey: '나의비밀번호',
    });
  }

  // 토큰 성공 시 검증
  validate(payload) {
    console.log(payload);
    return {
      id: payload.sub,
    };
  }
  // req.user = {id:payload.sub}
}
