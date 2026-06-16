import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => User)
  user: User;
}
