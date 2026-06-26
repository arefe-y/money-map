import { BadRequestException, Injectable } from '@nestjs/common';
import { BudgetRepository } from './budget.repository';
import { CreateBudgetDto } from './dto/create-budget';
import {
  FindQueryDto,
  PaginatedResponse,
} from 'src/common/interfaces/query-params.interface';
import { Budget } from './entities/budget.entity';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import buildFindQuery from 'src/common/utils/build-find-query.util';
import { FindOptionsWhere } from 'typeorm';
import { TransactionType } from 'src/common/enums/transactions.enum';
import { TransactionsService } from 'src/transactions/transactions.service';
import { GetBudgetStatusDto } from './dto/get-budget-status.dto';

@Injectable()
export class BudgetService {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly transactionService: TransactionsService,
  ) {}

  async create(
    userId: string,
    createBudgetDto: CreateBudgetDto,
  ): Promise<Budget> {
    const { category, month, year } = createBudgetDto;
    const existing = await this.budgetRepository.findOne({
      where: {
        user: { id: userId },
        category: { id: category },
        month: month,
        year: year,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Budget already exist for this category and this date',
      );
    }
    return await this.budgetRepository.create({
      ...createBudgetDto,
      category: { id: category },
      user: { id: userId },
    });
  }

  async findAll(
    userId: string,
    queryDto: FindQueryDto,
  ): Promise<PaginatedResponse<Budget>> {
    const query = buildFindQuery<Budget>(queryDto, {
      filters: ['month', 'year', 'category.id'],
      sort: ['month', 'year', 'createdAt'],
      relations: ['category'],
      select: [],
    });

    const wheres = (
      Array.isArray(query.where) ? query.where : [query.where ?? {}]
    ) as FindOptionsWhere<Budget>[];

    const [data, total] = await this.budgetRepository.findAll({
      ...query,
      where: wheres.map((w) => ({ ...w, user: { id: userId } })),
    });

    return { data, total };
  }

  async findById(id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id },
      relations: { category: true, user: true },
    });
    if (!budget) {
      throw new NotFoundException('Budget');
    }
    return budget;
  }

  async getBudgetStatus(userId: string, budgetStatusDto: GetBudgetStatusDto) {
    const { month, year } = budgetStatusDto;
    const [budgets] = await this.budgetRepository.findAll({
      where: { user: { id: userId }, month, year },
      relations: ['category'],
    });

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const result = [];

    for (const budget of budgets) {
      const { data: transactions } = await this.transactionService.findAll(
        userId,
        {
          where: [
            `category.id::eq::${budget.category.id}`,
            `type::eq::${TransactionType.EXPENSE}`,
            `spentDate::between::${startDate},${endDate}`,
          ],
        },
      );

      const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const remaining = Number(budget.amount) - spent;
      const isExceeded = spent > Number(budget.amount);

      result.push({
        category: budget.category.name,
        budgetAmount: Number(budget.amount),
        spent,
        remaining,
        isExceeded,
        notification: isExceeded
          ? `You have exceeded your budget for ${budget.category.name} by ${Math.abs(remaining)}`
          : remaining < Number(budget.amount) * 0.1
            ? `Warning: You are about to exceed your budget for ${budget.category.name}`
            : null,
      });
    }

    return result;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    return await this.budgetRepository.update(id, updateBudgetDto);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.budgetRepository.delete(id);
    return {
      message: 'Budget deleted successfully',
    };
  }
}
