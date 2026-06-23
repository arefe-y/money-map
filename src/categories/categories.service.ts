import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './categories.repository';
import { Category } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import {
  FindQueryDto,
  PaginatedResponse,
} from 'src/common/interfaces/query-params.interface';
import buildFindQuery from 'src/common/utils/build-find-query.util';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(
    createcategoryDto: CreateCategoryDto,
    activeUser: ActiveUserData,
  ): Promise<Category> {
    return await this.categoryRepository.create({
      ...createcategoryDto,
      user: activeUser,
    });
  }

  async findAll(
    userId: string,
    queryDto: FindQueryDto,
  ): Promise<PaginatedResponse<Category>> {
    const query = buildFindQuery<Category>(queryDto, {
      filters: ['name', 'id'],
      sort: ['name', 'createdAt'],
      relations: ['user'],
      select: [],
    });

    const wheres = (
      Array.isArray(query.where) ? query.where : [query.where ?? {}]
    ) as FindOptionsWhere<Category>[];

    const [data, total] = await this.categoryRepository.findAll({
      ...query,
      where: wheres.map((w) => ({ ...w, user: { id: userId } })),
    });

    return { total, data };
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!category) {
      throw new NotFoundException('Catgory');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryRepository.update(id, updateCategoryDto);
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.categoryRepository.delete(id);
    return {
      message: 'Category deleted successfully',
    };
  }
}
