import { BadRequestException, Injectable } from '@nestjs/common';
import { TagRepository } from './tags.repository';
import { CreateTagDto } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';
import {
  FindQueryDto,
  PaginatedResponse,
} from 'src/common/interfaces/query-params.interface';
import buildFindQuery from 'src/common/utils/build-find-query.util';
import { FindOptionsWhere, In } from 'typeorm';

@Injectable()
export class TagsService {
  constructor(private readonly tagRepository: TagRepository) {}

  async create(userId: string, createTagDto: CreateTagDto): Promise<Tag> {
    const existing = await this.tagRepository.findOne({
      where: { user: { id: userId }, name: createTagDto.name },
    });

    if (existing) {
      throw new BadRequestException('Tag already exists !');
    }
    return await this.tagRepository.create({
      name: createTagDto.name,
      user: { id: userId },
    });
  }

  async findAll(
    userId: string,
    queryDto: FindQueryDto,
  ): Promise<PaginatedResponse<Tag>> {
    const query = buildFindQuery<Tag>(queryDto, {
      filters: ['name', 'id'],
      relations: ['name', 'createdAt'],
      select: [],
      sort: [],
    });

    const wheres = (
      Array.isArray(query.where) ? query.where : [query.where ?? {}]
    ) as FindOptionsWhere<Tag>[];

    const [data, total] = await this.tagRepository.findAll({
      ...query,
      where: wheres.map((w) => ({ ...w, user: { id: userId } })),
    });

    return { total, data };
  }

  async findByIds(userId: string, tagIds: string[]): Promise<Tag[]> {
    const [tags] = await this.tagRepository.findAll({
      where: {
        user: { id: userId },
        id: In(tagIds),
      },
    });

    if (!tags.length) {
      throw new BadRequestException('Tags not found !');
    }
    return tags;
  }

  async delete(userId: string, tagId: string): Promise<void> {
    await this.tagRepository.findOne({
      where: {
        user: { id: userId },
        id: tagId,
      },
    });
    return await this.tagRepository.delete(tagId);
  }
}
