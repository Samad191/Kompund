import { Test, TestingModule } from '@nestjs/testing';
import { AlaioService } from './alaio.service';

describe('AlaioService', () => {
  let service: AlaioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlaioService],
    }).compile();

    service = module.get<AlaioService>(AlaioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
