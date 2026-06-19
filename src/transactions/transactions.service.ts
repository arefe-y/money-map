import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transactions.repository';
import { Transaction } from './entities/transactions.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { FindQueryDto } from 'src/common/interfaces/query-params.interface';
import buildFindQuery from 'src/common/utils/build-find-query.util';
import { FindOptionsWhere } from 'typeorm';
import { UpdateTransactionsDto } from './dtos/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    activeUser: ActiveUserData,
  ): Promise<Transaction> {
    return await this.transactionRepository.create({
      ...createTransactionDto,
      user: activeUser,
      category: {
        id: createTransactionDto.categoryId,
      },
    });
  }

  async findAll(
    userId: string,
    queryDto: FindQueryDto,
  ): Promise<Transaction[]> {
    const query = buildFindQuery<Transaction>(queryDto, {
      filters: [
        'date',
        'amount',
        'type',
        'category.id',
        'category.name',
        'spentDate',
      ],
      sort: ['date', 'amount', 'createdAt'],
      relations: ['category'],
      select: [],
    });

    const wheres = (
      Array.isArray(query.where) ? query.where : [query.where ?? {}]
    ) as FindOptionsWhere<Transaction>[];

    return this.transactionRepository.findAll({
      ...query,
      where: wheres.map((w) => ({ ...w, user: { id: userId } })),
    });
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = this.transactionRepository.findOne({
      where: { id },
      relations: { category: true, user: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction');
    }
    return transaction;
  }

  async update(
    id: string,
    updateTransactionsDto: UpdateTransactionsDto,
  ): Promise<Transaction> {
    return await this.transactionRepository.update(
      id,
      updateTransactionsDto.categoryId
        ? {
            ...updateTransactionsDto,
            category: { id: updateTransactionsDto.categoryId },
          }
        : { ...updateTransactionsDto },
    );
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.transactionRepository.delete(id);
    return {
      message: 'Transaction deleted successfully',
    };
  }
}
