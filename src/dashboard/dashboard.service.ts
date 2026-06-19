import { Injectable } from '@nestjs/common';
import { TransactionType } from 'src/common/enums/transactions.enum';
import { FindQueryDto } from 'src/common/interfaces/query-params.interface';
import { TransactionsService } from 'src/transactions/transactions.service';

@Injectable()
export class DashboardService {
  constructor(private readonly transactionsService: TransactionsService) {}

  async summary(userId: string, queryDto: FindQueryDto) {
    const transactions = await this.transactionsService.findAll(
      userId,
      queryDto,
    );

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      totalBalance: totalIncome - totalExpense,
    };
  }

  async getMonthlyReport(userId: string, year: number) {
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const transactions = await this.transactionsService.findAll(userId, {
      where: `spentDate::between::${targetYear}-01-01, ${targetYear}-12-31`,
      relations: 'category',
    });

    const months = [];

    for (let i = 0; i < 12; i++) {
      months.push({
        month: i + 1,
        monthName: new Date(targetYear, i, 1).toLocaleString('default', {
          month: 'long',
        }),
        income: 0,
        expense: 0,
        balance: 0,
        categories: {} as Record<string, { income: number; expense: number }>,
      });
    }

    transactions.forEach((t) => {
      const monthIndex = new Date(t.spentDate).getMonth();
      const amount = Number(t.amount);
      const categoryName = t.category.name;

      if (t.type === TransactionType.INCOME) {
        months[monthIndex].income += amount;
      } else {
        months[monthIndex].expense += amount;
      }

      if (!months[monthIndex].categories[categoryName]) {
        months[monthIndex].categories[categoryName] = { income: 0, expense: 0 };
      }

      if (t.type === TransactionType.INCOME) {
        months[monthIndex].categories[categoryName].income += amount;
      } else {
        months[monthIndex].categories[categoryName].expense += amount;
      }
    });
    const result = [];

    for (const { categories, ...m } of months) {
      const categoryList = [];

      for (const name in categories) {
        const { income, expense } = categories[name];
        categoryList.push({ name, income, expense, balance: income - expense });
      }

      result.push({
        ...m,
        balance: m.income - m.expense,
        categories: categoryList,
      });
    }

    return result;
  }
}
