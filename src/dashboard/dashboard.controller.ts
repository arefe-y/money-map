import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { DashboardService } from './dashboard.service';
import { FindQueryDto } from 'src/common/interfaces/query-params.interface';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@UseGuards(JwtAuthGuard)
@Controller('dashbboard')
@ApiTags('dashboard')
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSammary(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() queryDto: FindQueryDto,
  ) {
    return this.dashboardService.summary(activeUser.id, queryDto);
  }

  @Get('monthly')
  getMonthlyReport(
    @ActiveUser() activeUser: ActiveUserData,
    @Query('year') year: number,
  ) {
    return this.dashboardService.getMonthlyReport(activeUser.id, year);
  }

  @Get('category-breakdown')
  getCategoryBreakDown(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() queryDto: FindQueryDto,
  ) {
    return this.dashboardService.getCategoryBreadDownReport(
      activeUser.id,
      queryDto,
    );
  }
}
