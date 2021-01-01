import { HeadsOrTails } from './heads-or-tails';

describe('HeadsOrTails', () => {

  it('should create an instance', () => {
    expect(new HeadsOrTails()).toBeTruthy();
  });

  it('should init', ()=>{
    let ht = new HeadsOrTails();
    expect(ht.getValBool()).toEqual(false, 'init false');
  });

  describe('int to boolean', ()=>{
    it('should have value TRUE when the int value is 1', ()=>{
      let t = new HeadsOrTails(1);
      expect(t.getValInt()).toEqual(1, 'int value');
      expect(t.getValBool()).toEqual(true, 'bool value');
      
    });

    it('should have value FALSE when the int value is zero', ()=>{
      let h = new HeadsOrTails(0);
      expect(h.getValInt()).toEqual(0, 'int value');
      expect(h.getValBool()).toEqual(false, 'bool value');
    });
  });

  describe('to string', ()=>{
    it('should print HEADS when the int value is 0', ()=>{
      let h = new HeadsOrTails(0);
      expect(h.toString()).toEqual('Heads');
    });

    it('should print TALES when the int value is 1', ()=> {
      let t = new HeadsOrTails(1);
      expect(t.toString()).toEqual('Tales');
    });
  });

  describe('equality', ()=>{
    describe('both are HeadsOrTails', ()=>{
      it('should return TRUE when both values are the same', ()=>{
        const a = new HeadsOrTails(true);
        const b = new HeadsOrTails(true);
        expect(a.equals(b)).toEqual(true);
      });

      it('should return FALSE when other is different', ()=>{
        const a = new HeadsOrTails(true);
        const b = new HeadsOrTails(false);
        expect(a.equals(b)).toEqual(false);
      });

      it('should return FALSE when other is undefined', ()=>{
        const a = new HeadsOrTails(true);
        expect(a.equals(undefined)).toEqual(false);
      });
    });

    describe('other is int', ()=>{
      it('should return TRUE when both values are the same', ()=>{
        const a = new HeadsOrTails(true);
        expect(a.equals(1)).toEqual(true);
      });

      it('should return FALSE when other is different', ()=>{
        const a = new HeadsOrTails(true);
        expect(a.equals(0)).toEqual(false);
      });
    });

    describe('other is boolean', ()=>{
      it('should return TRUE when both values are the same', ()=>{
        const a = new HeadsOrTails(true);
        expect(a.equals(true)).toEqual(true);
      });

      it('should return FALSE when other is different', ()=>{
        const a = new HeadsOrTails(true);
        expect(a.equals(false)).toEqual(false);
      });
    });
  });

});
