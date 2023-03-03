import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('getForexCurrenciesPrice')
  async getCurrenciesPrice() {
    return await this.tokenService.getForexCurrenciesPrice()
  }

  @Get('getCryptoPrice')
  async getCryptoPrice() {
    return await this.tokenService.getCryptoPrice()
  }

  @Get('getKpwPrice')
  async getKpwPrice() {
    return await this.tokenService.getKpwPrice()
  }
}
