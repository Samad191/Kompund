import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from './token.model';
import { ConversionService } from 'src/services/conversion/conversion.service';
import { AlaioService } from 'src/services/alaio/alaio.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Token', schema: TokenSchema }
    ])
  ],
  controllers: [TokenController],
  providers: [TokenService, ConversionService, AlaioService],
  exports: [TokenService]
})
export class TokenModule {}
