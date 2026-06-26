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
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { FindQueryDto } from 'src/common/interfaces/query-params.interface';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { GetBudgetStatusDto } from './dto/get-budget-status.dto';

@UseGuards(JwtAuthGuard)
@Controller('budget')
@ApiTags('budget')
@ApiBearerAuth('access-token')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() createBudgetDto: CreateBudgetDto,
  ) {
    return this.budgetService.create(activeUser.id, createBudgetDto);
  }

  @Get()
  findAll(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() queryDto: FindQueryDto,
  ) {
    return this.budgetService.findAll(activeUser.id, queryDto);
  }

  @Get('budget-status')
  getBudgetStatus(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() budgetStatusDto: GetBudgetStatusDto,
  ) {
    return this.budgetService.getBudgetStatus(activeUser.id, budgetStatusDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.budgetService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.budgetService.delete(id);
  }
}
