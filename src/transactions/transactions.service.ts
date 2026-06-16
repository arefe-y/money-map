import { Injectable } from '@nestjs/common';
import { TransactionRepository } from './transactions.repository';
import { Transaction } from './entities/transactions.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { UpdateTransactionsDto } from './update-transaction.dto';

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

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.findAll({
      relations: { category: true, user: true },
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
