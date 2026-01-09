import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewHistory } from '../../database/entities/view-history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(ViewHistory)
    private historyRepo: Repository<ViewHistory>,
  ) {}

  async findBySession(sessionId: string, userId?: string) {
    const where: any = { sessionId };
    if (userId) where.userId = userId;

    return this.historyRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async create(createHistoryDto: CreateHistoryDto): Promise<ViewHistory> {
    const history = this.historyRepo.create(createHistoryDto);
    return this.historyRepo.save(history);
  }
}
