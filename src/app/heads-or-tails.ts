import { isNumber } from 'util';

export class HeadsOrTails {
    static Heads = new HeadsOrTails(0);
    static Tails = new HeadsOrTails(1);

    private _val: boolean;
    
    constructor(val: boolean | number = false) {
        if (isNumber(val)) {
            this.setValInt(val);
        } else {
            this.setValBool(val);
        }
    }

    setValBool(val: boolean) {
        this._val = val;
    }
    getValBool(): boolean {
        return this._val;
    }

    setValInt(val: number) {
        if (val === 1) {
            this._val = true;
        } else {
            this._val = false;
        }
    }
    getValInt(): number {
        if (this._val) {
            return 1;
        }
        return 0;
    }

    equals(other: HeadsOrTails | number | boolean): boolean {
        if (other === undefined || other == null) {
            return false;
        }

        if (typeof other == 'number') {
            return this.getValInt() === other;
        } else if (typeof other == 'boolean') {
            return this.getValBool() === other;
        }
        let result = false;
        try {
            result = this.getValBool() === other.getValBool();
        } catch(e) {
            console.log('other is unknown');
        }
        
        return result;
    }

    toString(): string {
        if (this._val) {
            return 'Tales';
        }
        return 'Heads';
    }
}
