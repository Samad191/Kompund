import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { AlaioService } from './services/alaio/alaio.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConversionService } from './services/conversion/conversion.service';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: `${__dirname}/config/env/${process.env.NODE_ENV}.env`,
      // load: [configuration],
    }),
    TokenModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway,
    AlaioService,    
    ConversionService,
  ],
})
export class AppModule {}
