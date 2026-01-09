import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';

@ApiTags('navigation')
@Controller('api/navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation headings' })
  @ApiResponse({ status: 200, description: 'Returns all navigation headings' })
  async findAll() {
    return this.navigationService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get navigation by slug' })
  @ApiResponse({ status: 200, description: 'Returns navigation details' })
  async findOne(@Param('slug') slug: string) {
    return this.navigationService.findBySlug(slug);
  }

  @Post('scrape')
  @ApiOperation({ summary: 'Trigger navigation scraping' })
  @ApiResponse({ status: 201, description: 'Scraping initiated' })
  async scrape(@Query('force') force?: boolean) {
    return this.navigationService.scrapeNavigation(force === true);
  }
}
