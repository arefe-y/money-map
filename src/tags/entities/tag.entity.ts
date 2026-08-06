import { BaseEntity } from 'src/common/entities/base.entity';
import { Transaction } from 'src/transactions/entities/transactions.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';

@Entity('tags')
export class Tag extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToMany(() => Transaction, (transaction) => transaction.tags)
  transactions: Transaction[];
}
