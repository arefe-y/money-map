import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  password: string;
}
