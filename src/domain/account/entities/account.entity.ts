import { randomUUID } from 'crypto';
import { InsufficientFundsException } from '../exceptions/insufficientfunds.exception';
import { InvalidAmountException } from '../exceptions/invalidamount.exception';

export class Account {
  private constructor(
    private readonly _id: string,
    private readonly _ownerName: string,
    private _balanceInCents: number,
    private readonly _createdAt: Date,
  ) {}

  static create(ownerName: string): Account {
    return new Account(randomUUID(), ownerName, 0, new Date());
  }

  static restore(
    id: string,
    ownerName: string,
    balanceInCents: number,
    createdAt: Date,
  ): Account {
    return new Account(id, ownerName, balanceInCents, createdAt);
  }

  deposit(amountInCents: number): void {
    this.ensurePositiveAmount(amountInCents);

    this._balanceInCents += amountInCents;
  }

  withdraw(amountInCents: number): void {
    this.ensurePositiveAmount(amountInCents);

    if (this.balanceInCents < amountInCents) {
      throw new InsufficientFundsException(
        this._id,
        this._balanceInCents,
        amountInCents,
      );
    }

    this._balanceInCents -= amountInCents;
  }

  private ensurePositiveAmount(amountInCents: number): void {
    if (amountInCents == null) {
      throw new InvalidAmountException(amountInCents);
    }

    if (amountInCents <= 0) {
      throw new InvalidAmountException(amountInCents);
    }

    if (!Number.isInteger(amountInCents)) {
      throw new InvalidAmountException(amountInCents);
    }
  }

  get id(): string {
    return this._id;
  }

  get ownerName(): string {
    return this._ownerName;
  }

  get balanceInCents(): number {
    return this._balanceInCents;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
