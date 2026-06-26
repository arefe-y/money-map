import { Category } from 'src/categories/entities/categories.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';

@Entity('budget')
export class Budget extends BaseEntity {
  @Column('decimal')
  amount: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @ManyToOne(() => Category)
  category: Category;

  @ManyToOne(() => User)
  user: User;
}
