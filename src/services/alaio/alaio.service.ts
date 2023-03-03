import { Injectable } from '@nestjs/common';

import { JsonRpc, RpcError, Api } from 'alaiojs';
import { JsSignatureProvider } from 'alaiojs/dist/alaiojs-jssig';
import { TextDecoder, TextEncoder } from 'text-encoding';

// import { JsonRpc, RpcError, Api } from 'eosjs';
// import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
// const { TextDecoder, TextEncoder } = require('util');

const fetch = require('node-fetch');
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { constants } from 'src/constants';

@Injectable()
export class AlaioService {
  public rpc: JsonRpc;
  public api: Api;
  private contractName: string = constants.CONTRACT;
  private defaultPrivateKey: string = process.env.PRIVATE_KEY;
  public selectedNet: string = '';
  host: string = '';

  constructor(private configService: ConfigService) {
    this.host = process.env.ALA_NODE;
    this.selectedNet = process.env.TESTNET ? 'testnet' : 'mainnet';

    let signatureProvider: JsSignatureProvider = new JsSignatureProvider([
      this.defaultPrivateKey,
    ]);
    let rpc: JsonRpc = (this.rpc = new JsonRpc(this.host, { fetch }));

    this.api = new Api({
      rpc,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
    });
  }

  changeNet(network: 'testnet' | 'mainnet') {
    if (this.selectedNet != network) {
      switch (network) {
        case 'testnet':
          this.selectedNet = 'testnet';
          break;
        case 'mainnet':
          this.selectedNet = 'mainnet';
          break;
        default:
          this.selectedNet = this.configService.get<string>('testnet')
            ? 'testnet'
            : 'mainnet';
      }
    }
  }

  pushTransaction(action: string, actor: string, data: any, contract?: string) {
    if (!contract) contract = actor;

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.api.transact(
          {
            actions: [
              {
                account: contract,
                name: action,
                authorization: [
                  {
                    actor: actor,
                    permission: 'active',
                  },
                ],
                data: data,
              },
            ],
          },
          {
            blocksBehind: 3,
            expireSeconds: 3600,
          },
        );

        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  getRows(options: any): Promise<GetRowData> {
    return new Promise(async (res, rej) => {
      let defaults: any = {
        scope: this.contractName,
        contract: this.contractName,
        limit: 9999,
        index: 0,
        reverse: false,
      };
      ['scope', 'contract', 'limit', 'index', 'reverse'].forEach((key) => {
        if (!options.hasOwnProperty(key)) options[key] = defaults[key];
      });
      try {
        let result: GetRowData = await this.rpc.get_table_rows({
          json: true,
          code: options.contract,
          scope: options.scope ? options.scope : options.contract,
          table: options.table,
          index_position: options.index_position,
          limit: options.limit,
          lower_bound: options.lower_bound,
          upper_bound: options.upper_bound,
          key_type: options.key_type,
          reverse: options.reverse,
        });
        res(result);
      } catch (e) {
        console.log('\nCaught exception on get_table_rows: ', e, options);
        if (e instanceof RpcError) rej(JSON.stringify(e.json, null, 2));
        else rej(e);
      }
    });
  }

  getTableScope(options: any): Promise<TableScopes> {
    return new Promise(async (res, rej) => {
      let defaults: any = {
        code: this.contractName,
        limit: 999,
        reverse: false,
      };
      ['code', 'limit', 'reverse'].forEach((key) => {
        if (!options.hasOwnProperty(key)) options[key] = defaults[key];
      });
      let { code, table, upper_bound, lower_bound, reverse } = options;
      if (!table) rej('No table supplied');
      try {
        let result: TableScopes = await this.rpc.get_table_by_scope(options);
        res(result);
      } catch (e) {
        console.log('\nCaught exception on get_table_by_scope: ', e, options);
        if (e instanceof RpcError) rej(JSON.stringify(e.json, null, 2));
        else rej(e);
      }
    });
  }

  //Returns a list of every user in the contract
  getAllUsers(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let getUsers = async (lower_bound?: string): Promise<any[]> => {
        let userRow = await this.getTableScope({
          contract: 'kompwndtoken',
          table: 'accounts',
          lower_bound: lower_bound,
        });
        let users: any = userRow.rows;
        // console.log(users)
        if (userRow && userRow.more != '') {
          let moreUsers = await getUsers(userRow.more);
          return moreUsers.concat(users);
        } else {
          return users;
        }
      };

      getUsers().then(async (data) => {
        resolve(data);
      });
    });
  }

  getBalance(
    username: string,
    contract: string,
    symbol: string,
  ): Promise<{ data: string }> {
    return new Promise(async (res) => {
      let data: any = await axios.get(
        this.host + '/v1/chain/get_currency_balance',
        {
          params: {
            code: contract,
            account: username,
            symbol,
          },
        },
      );

      if (data.data.length) {
        res({ data: data.data[0] });
      } else {
        res({ data: `0.0000 ${symbol}` });
      }
    });
  }

  toToken(tok: string) {
    let ValSym = tok.split(' ');
    let precString = ValSym[0].split('.')[1];
    return <Token>{
      value: parseFloat(ValSym[0]),
      precision: precString ? precString.length : 4,
      symbol: ValSym[1],
    };
  }
}

export interface GetRowData {
  rows: any[];
  more: boolean;
  next_key: string;
}

export interface TableScopes {
  rows: TableScope[];
  more: string;
}

export interface TableScope {
  code: string;
  scope: string;
  table: string;
  payer: string;
  count: number;
}

export interface Token {
  value: number;
  precision: number;
  symbol: string;
}
