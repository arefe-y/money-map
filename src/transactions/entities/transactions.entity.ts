import { Category } from 'src/categories/entities/categories.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { TransactionType } from 'src/common/enums/transactions.enum';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('decimal', {
    precision: 12,
  })
  amount: number;

  @ManyToOne(() => Category)
  category: Category;

  @Column('date')
  spentDate: Date;

  @ManyToOne(() => User)
  user: User;
}
