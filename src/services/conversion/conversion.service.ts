import { Injectable } from '@nestjs/common';
import { AlaioService, GetRowData } from '../alaio/alaio.service';

@Injectable()
export class ConversionService {
  constructor(private readonly alaioService: AlaioService) {}

  async kpwToUsd(kpw: number): Promise<number> {
    let kpwusd = await this.getKPWUsd();
    let usdReturn = +(kpw * kpwusd);

    if (!usdReturn) {
      return 0;
    } else {
      // console.log(usdReturn);
      return usdReturn;
    }
  }

  async getKPWUsd() {
    let kpwData: any = await this.alaioService.getBalance(
      'kpw.alaswap',
      'kompwndtoken',
      'KPW',
    );
    const kpwValue = this.alaioService.toToken(kpwData.data).value;

    let alaData: any = await this.alaioService.getBalance(
      'kpw.alaswap',
      'alaio.token',
      'ALA',
    );
    const alaValue = this.alaioService.toToken(alaData.data).value;

    let alaUsdValue = await this.alaUSDValue();

    return (alaValue * alaUsdValue) / kpwValue;
  }

  async usdToKpw(usd) {
    let kpwUsd = await this.getKPWUsd();
    let kpwreturn = usd / kpwUsd;

    if (!kpwreturn) {
      return '...';
    } else {
      return kpwreturn.toFixed(4);
    }
  }

  async alaUSDValue() {
    let alaData: any = await this.alaioService.getBalance(
      'eth.alaswap',
      'alaio.token',
      'ALA',
    );
    const ethxAlaToken = this.alaioService.toToken(alaData.data);

    let ethxData: any = await this.alaioService.getBalance(
      'eth.alaswap',
      'ethxtoken',
      'ETHX',
    );
    const ethxToken = this.alaioService.toToken(ethxData.data);

    let ethData: any = (await (<Promise<GetRowData>>this.alaioService.getRows({
        table: 'global',
        contract: 'opn.contract',
        scope: 'opn.contract',
      }))).rows[0];

    const ethValue = this.alaioService.toToken(ethData.eth_price);

    return (ethxToken.value / ethxAlaToken.value) * ethValue.value;
  }
}
