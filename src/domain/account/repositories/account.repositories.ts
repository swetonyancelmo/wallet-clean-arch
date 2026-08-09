import { Account } from '../entities/account.entity';

export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');

export interface AccountRepository {
  save(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
}
