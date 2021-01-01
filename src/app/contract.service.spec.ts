/* // import { TestBed } from '@angular/core/testing';

import { ContractService } from './contract.service';
import { Web3Service } from './web3.service';

describe('ContractService', () => {
  let service: ContractService;
  let w3s: Web3Service;
  
  // beforeEach(() => TestBed.configureTestingModule({
  //   providers: [Web3Service]
  // }));
  beforeEach(()=>{
    w3s = new Web3Service();
    service = new ContractService(w3s);
  })

  it('should be created', () => {
    // const service: ContractService = TestBed.get(ContractService);
    expect(w3s).toBeTruthy();
    expect(service).toBeTruthy();
  });
});
*/