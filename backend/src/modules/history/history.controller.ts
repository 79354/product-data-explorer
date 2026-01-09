import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';

@ApiTags('history')
@Controller('api/history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get user browse history' })
  @ApiResponse({ status: 200, description: 'Returns browse history' })
  async findAll(@Query('sessionId') sessionId: string, @Query('userId') userId?: string) {
    return this.historyService.findBySession(sessionId, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Save browse history' })
  @ApiResponse({ status: 201, description: 'History saved' })
  async create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }
}
