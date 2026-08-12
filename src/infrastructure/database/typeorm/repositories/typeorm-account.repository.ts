import { Injectable } from '@nestjs/common';
import { AccountRepository } from 'src/domain/account/repositories/account.repository';
import { Repository } from 'typeorm';
import { AccountOrmEntity } from '../entities/account.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/domain/account/entities/account.entity';

@Injectable()
export class TypeOrmAccountRepository implements AccountRepository {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly ormRepository: Repository<AccountOrmEntity>,
  ) {}

  async save(account: Account): Promise<void> {
    const accountOrm = this.toOrmEntity(account);
    await this.ormRepository.save(accountOrm);
  }

  async findById(id: string): Promise<Account | null> {
    const accountOrm = await this.ormRepository.findOne({
      where: {
        id: id,
      },
    });

    if (accountOrm == null) {
      return null;
    }

    return this.toDomain(accountOrm);
  }

  async findAll(): Promise<Account[]> {
    const accountsOrm = await this.ormRepository.find();
    return accountsOrm.map((a) => this.toDomain(a));
  }

  private toDomain(orm: AccountOrmEntity): Account {
    const account = Account.restore(
      orm.id,
      orm.ownerName,
      Number(orm.balanceInCents),
      orm.createdAt,
    );

    return account;
  }

  private toOrmEntity(account: Account): AccountOrmEntity {
    const accountOrmEntity = new AccountOrmEntity();
    accountOrmEntity.id = account.id;
    accountOrmEntity.ownerName = account.ownerName;
    accountOrmEntity.balanceInCents = account.balanceInCents;
    accountOrmEntity.createdAt = account.createdAt;

    return accountOrmEntity;
  }
}
