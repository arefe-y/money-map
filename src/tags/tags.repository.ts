import { BaseRepository } from 'src/common/repositories/base.repository';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TagRepository extends BaseRepository<Tag> {
  constructor(
    @InjectRepository(Tag)
    repository: Repository<Tag>,
  ) {
    super(repository);
  }
}
