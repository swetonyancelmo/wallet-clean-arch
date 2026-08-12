import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('accounts')
export class AccountOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'owner_name' })
  ownerName: string;

  @Column({ name: 'balance_in_cents', type: 'bigint' })
  balanceInCents: number;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
