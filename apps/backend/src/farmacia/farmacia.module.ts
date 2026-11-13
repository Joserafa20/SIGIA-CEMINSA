import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { LotsModule } from './lots/lots.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [ProductsModule, LotsModule, StockModule],
})
export class FarmaciaModule {}
