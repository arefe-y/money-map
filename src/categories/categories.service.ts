import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './categories.repository';
import { Category } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

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

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.findAll({ relations: { user: true } });
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
