import { Module } from '@nestjs/common';
import { AssetsModule } from './assets/assets.module';
import { CategoriesModule } from './categories/categories.module';
import { MovementsModule } from './movements/movements.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [CategoriesModule, AssetsModule, MovementsModule, TransfersModule],
  exports: [AssetsModule, MovementsModule],
})
export class AlmacenModule {}
