import { Inject, Injectable } from '@nestjs/common';
import { Account } from 'src/domain/account/entities/account.entity';
import { ACCOUNT_REPOSITORY } from 'src/domain/account/repositories/account.repository';
import type { AccountRepository } from 'src/domain/account/repositories/account.repository';

export interface CreateAccountInput {
  ownerName: string;
}

export interface CreateAccountOutput {
  id: string;
  ownerName: string;
  balanceInCents: number;
}

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(input: CreateAccountInput): Promise<CreateAccountOutput> {
    const account = Account.create(input.ownerName);

    await this.accountRepository.save(account);

    return {
      id: account.id,
      ownerName: account.ownerName,
      balanceInCents: account.balanceInCents,
    };
  }
}
