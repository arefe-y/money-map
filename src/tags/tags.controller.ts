import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { TagsService } from './tags.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CreateTagDto } from './dto/create-tag.dto';
import { FindQueryDto } from 'src/common/interfaces/query-params.interface';
import { identity } from 'rxjs';

@UseGuards(JwtAuthGuard)
@Controller('tags')
@ApiTags('tags')
@ApiBearerAuth('access-token')
export class TagController {
  constructor(private readonly tagService: TagsService) {}

  @Post()
  create(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() createTagDto: CreateTagDto,
  ) {
    return this.tagService.create(activeUser.id, createTagDto);
  }

  @Get()
  findAll(
    @ActiveUser() ActiveUser: ActiveUserData,
    @Query() queryDto: FindQueryDto,
  ) {
    return this.tagService.findAll(ActiveUser.id, queryDto);
  }

  @Delete(':id')
  delete(@ActiveUser() activeUser: ActiveUserData, id: string) {
    return this.tagService.delete(activeUser.id, id);
  }
}
