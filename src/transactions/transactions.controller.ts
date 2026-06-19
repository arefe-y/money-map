import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { FindQueryDto } from 'src/common/interfaces/query-params.interface';
import { UpdateTransactionsDto } from './dtos/update-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
@ApiTags('transactions')
@ApiBearerAuth('access-token')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.transactionsService.create(createTransactionDto, activeUser);
  }

  @Get()
  findAll(@Param('id') id: string, @Query() queryDto: FindQueryDto) {
    return this.transactionsService.findAll(id, queryDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionsDto: UpdateTransactionsDto,
  ) {
    return this.transactionsService.update(id, updateTransactionsDto);
  }

  @Delete('id')
  delete(@Param('id') id: string) {
    return this.transactionsService.delete(id);
  }
}
