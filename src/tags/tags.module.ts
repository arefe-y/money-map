import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { TagController } from './tags.controller';
import { TagsService } from './tags.service';
import { TagRepository } from './tags.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagController],
  providers: [TagsService, TagRepository],
  exports: [TagsService],
})
export class TagModule {}
