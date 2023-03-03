import { Module } from '@nestjs/common';
import { ConversionService } from './conversion.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({

//   controllers: [TokenController],
  providers: [ConversionService],
  exports: [ConversionService]
})
export class TokenModule {}
