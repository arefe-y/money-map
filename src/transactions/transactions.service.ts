import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transactions.repository';
import { Transaction } from './entities/transactions.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import {
  FindQueryDto,
  PaginatedResponse,
} from 'src/common/interfaces/query-params.interface';
import buildFindQuery from 'src/common/utils/build-find-query.util';
import { FindOptionsWhere } from 'typeorm';
import { UpdateTransactionsDto } from './dtos/update-transaction.dto';
import { TagsService } from 'src/tags/tags.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly tagService: TagsService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    activeUser: ActiveUserData,
  ): Promise<Transaction> {
    const tags = createTransactionDto.tagIds?.length
      ? await this.tagService.findByIds(
          activeUser.id,
          createTransactionDto.tagIds,
        )
      : [];
    return await this.transactionRepository.create({
      ...createTransactionDto,
      tags,
      user: activeUser,
      category: {
        id: createTransactionDto.categoryId,
      },
    });
  }

  async findAll(
    userId: string,
    queryDto: FindQueryDto,
  ): Promise<PaginatedResponse<Transaction>> {
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
      relations: ['category','tags'],
      select: [],
    });

    const wheres = (
      Array.isArray(query.where) ? query.where : [query.where ?? {}]
    ) as FindOptionsWhere<Transaction>[];

    const [data, total] = await this.transactionRepository.findAll({
      ...query,
      where: wheres.map((w) => ({ ...w, user: { id: userId } })),
    });

    return { total, data };
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
    userId: string,
    id: string,
    updateTransactionsDto: UpdateTransactionsDto,
  ): Promise<Transaction> {
    const tags = updateTransactionsDto.tagIds?.length
      ? await this.tagService.findByIds(userId, updateTransactionsDto.tagIds)
      : undefined;
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
