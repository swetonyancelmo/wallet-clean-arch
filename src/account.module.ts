import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountOrmEntity } from './infrastructure/database/typeorm/entities/account.orm-entity';
import { CreateAccountUseCase } from './application/account/use-cases/create-account.use-case';
import { DepositUseCase } from './application/account/use-cases/deposit.use-case';
import { WithdrawUseCase } from './application/account/use-cases/withdraw.use-case';
import { TransferUseCase } from './application/account/use-cases/transfer.use-case';
import { ACCOUNT_REPOSITORY } from './domain/account/repositories/account.repository';
import { TypeOrmAccountRepository } from './infrastructure/database/typeorm/repositories/typeorm-account.repository';
import { AccountController } from './presentation/account/controllers/account.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccountOrmEntity])],
  providers: [
    CreateAccountUseCase,
    DepositUseCase,
    WithdrawUseCase,
    TransferUseCase,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: TypeOrmAccountRepository,
    },
  ],
  exports: [
    CreateAccountUseCase,
    DepositUseCase,
    WithdrawUseCase,
    TransferUseCase,
  ],
  controllers: [AccountController],
})
export class AccountModule {}
