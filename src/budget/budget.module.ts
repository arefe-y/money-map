import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetRepository } from './budget.repository';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Budget]), TransactionsModule],
  controllers: [BudgetController],
  providers: [BudgetService, BudgetRepository],
})
export class BudgetModule {}
