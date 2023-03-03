import { WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlaioService } from './services/alaio/alaio.service';
import { ConversionService } from './services/conversion/conversion.service';
import { constants } from './constants';
import { TokenService } from './token/token.service';

@WebSocketGateway()
export class AppGateway {
  isRunning = false;
  constructor(
    private readonly alaioService: AlaioService,
    private readonly conversionService: ConversionService,
    private readonly tokenService: TokenService
  ) {}

  private logger: Logger = new Logger(AppGateway.name);

  @Cron(CronExpression.EVERY_10_HOURS)
  async updateKpwPrice() {
    const kpwPrice = await this.conversionService.kpwToUsd(1)
    console.log('kpw price', kpwPrice)
    await this.tokenService.updateKpwPrice(kpwPrice);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCryptoPrices() {
    await this.tokenService.cryptoArrayUpdate();
  }

}
