import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Model } from 'mongoose';
import { Token } from './token.model';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios'
import { ConversionService } from 'src/services/conversion/conversion.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel('Token') private readonly TokenModel: Model<Token>,
    private readonly conversionService: ConversionService

    ) {}
  async updateKpwPrice(kpwPrice) {
    const data = await this.TokenModel.find();
    console.log('data ', data)
    const nonce = data[data.length -1].nonce ? Number(data[data.length -1].nonce) + 1 : 0;
    console.log('last index', Number(data[data.length -1].nonce) + 1)
    const res = await this.TokenModel.create({
      price: kpwPrice,
      time: Date.now(),
      nonce,
    })
    return res;
  }


  static cryptoArray = [
    { name: 'bitcoin', price: 0 },
    { name: 'ethereum', price: 0 },
    { name: 'solana', price: 0 },
    { name: 'tron', price: 0 },
    { name: 'ala', price: 0, function: true  }
  ];

  async getForexCurrenciesPrice() {
    const url = `https://openexchangerates.org/api/latest.json?app_id=${process.env.FOREX_API_KEY}`
    const { data } = await axios.get(url);
    console.log('res', data)
    return data.rates;
  }

  async getCryptoPrice() {
    return TokenService.cryptoArray;
  }

  async cryptoArrayUpdate() {
    for(let i=0; i<TokenService.cryptoArray.length; i++) {
      if(TokenService.cryptoArray[i].function) {
        const alaUsdValue = await this.conversionService.alaUSDValue()
        TokenService.cryptoArray[i].price = 1/ alaUsdValue;
      } else {
      const urlForCrypto = 
      `https://api.coingecko.com/api/v3/simple/price?ids=${TokenService.cryptoArray[i].name}&vs_currencies=usd`
      const { data } = await axios.get(urlForCrypto);
      TokenService.cryptoArray[i].price = data[TokenService.cryptoArray[i].name].usd 
    }
  }
  console.log('crypto arr', TokenService.cryptoArray)
}

  async getKpwPrice(hours = 1) {
    const res = await this.TokenModel.find();
    console.log('res', res)
    return res;
  }

}