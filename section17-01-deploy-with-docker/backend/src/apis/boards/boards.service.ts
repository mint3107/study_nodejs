import { Injectable, Scope } from '@nestjs/common';
import { Board } from './entities/board.entity';
import { IBoardsServiceCreate } from './interfaces/boards-service.interface';

// 인젝션 스코프 싱글톤 여부 확인
// DEFAULT: 싱글톤 생성
// REQUEST: 매 요청마다 new 생성
// TRANSIENT: 매 주입마다 new 생성
@Injectable({ scope: Scope.DEFAULT })
export class BoardsService {
  findAll(): Board[] {
    const result = [
      {
        number: 1,
        writer: '김영희',
        title: '안녕하세요~',
        contents: '내용입니다~!',
      },
      { number: 2, writer: '이철수', title: '반갑습니다~', contents: '호호' },
      { number: 3, writer: '강심려', title: '누구신가요?', contents: '하하' },
    ];
    return result;
  }

  create({ createBoardInput }: IBoardsServiceCreate): string {
    console.log(createBoardInput.writer);
    console.log(createBoardInput.title);
    console.log(createBoardInput.contents);

    return '게시물 등록에 성공하였습니다.';
  }
}
