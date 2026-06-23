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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { FindQueryDto } from 'src/common/interfaces/query-params.interface';

@UseGuards(JwtAuthGuard)
@Controller('categories')
@ApiTags('categories')
@ApiBearerAuth('access-token')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.categoryService.create(createCategoryDto, activeUser);
  }

  @Get()
  findAll(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() queryDto: FindQueryDto,
  ) {
    return this.categoryService.findAll(activeUser.id, queryDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
