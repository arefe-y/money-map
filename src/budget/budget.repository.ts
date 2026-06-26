import { BaseRepository } from 'src/common/repositories/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Budget } from './entities/budget.entity';

@Injectable()
export class BudgetRepository extends BaseRepository<Budget> {
  constructor(
    @InjectRepository(Budget)
    repository: Repository<Budget>,
  ) {
    super(repository);
  }
}
