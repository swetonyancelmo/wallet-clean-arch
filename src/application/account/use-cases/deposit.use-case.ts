import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/domain/account/exceptions/resource-not-found.exception';
import { ACCOUNT_REPOSITORY } from 'src/domain/account/repositories/account.repository';
import type { AccountRepository } from 'src/domain/account/repositories/account.repository';

export interface DepositInput {
  accountId: string;
  amountInCents: number;
}

export interface DepositOutput {
  accountId: string;
  newBalanceInCents: number;
}

@Injectable()
export class DepositUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(input: DepositInput): Promise<DepositOutput> {
    const account = await this.accountRepository.findById(input.accountId);

    if (account == null) {
      throw new ResourceNotFoundException(input.accountId);
    }

    account.deposit(input.amountInCents);

    await this.accountRepository.save(account);

    return {
      accountId: account.id,
      newBalanceInCents: account.balanceInCents,
    };
  }
}
