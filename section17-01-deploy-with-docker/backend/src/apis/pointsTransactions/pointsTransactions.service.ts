import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  POINT_TRANSACTION_STATUS_ENUM,
  PointTransaction,
} from './entities/pointTransaction.entity';
import { IPointsTransactionsServiceCreate } from './interfaces/points-transactions-service.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PointsTransactionsService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly pointsTransactionsRepository: Repository<PointTransaction>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async create({
    impUid,
    amount,
    user: _user,
  }: IPointsTransactionsServiceCreate) {
    // --------- 트랜잭션 시작 ---------
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    queryRunner.startTransaction('SERIALIZABLE');
    try {
      // 1. 거래 기록 생성
      const pointTransaction = this.pointsTransactionsRepository.create({
        // 등록을 위한 빈 객체
        impUid,
        amount,
        user: _user, // 이름 변경
        status: POINT_TRANSACTION_STATUS_ENUM.PAYMENT,
      });
      // await this.pointsTransactionsRepository.save(pointTransaction);
      await queryRunner.manager.save(pointTransaction);

      // 2. 유저의 돈 찾아서 업데이트 하기(숫자일때 가능)
      await queryRunner.manager.increment(
        User,
        { id: _user.id },
        'point',
        amount,
      );

      await queryRunner.commitTransaction();

      // 결과 전송
      return pointTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      console.log('------------------ db release');
      queryRunner.release();
    }
    // --------- 트랜잭션 종료 ---------
  }
}
