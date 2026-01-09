import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { PaginationDto } from '../../common/dto/pagination/pagination.dto';

@ApiTags('products')
@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Returns paginated products' })
  async findAll(@Query() pagination: PaginationDto, @Query('categoryId') categoryId?: string) {
    return this.productService.findAll(pagination, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Returns product details' })
  async findOne(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post(':id/scrape')
  @ApiOperation({ summary: 'Refresh product data' })
  @ApiResponse({ status: 201, description: 'Product refresh initiated' })
  async scrape(@Param('id') id: string, @Query('force') force?: boolean) {
    return this.productService.scrapeProduct(id, force === true);
  }
}
