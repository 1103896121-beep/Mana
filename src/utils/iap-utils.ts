import { Capacitor } from '@capacitor/core';

export const IAP_IDS = {
  coffee: 'com.qingning.mana.tip.coffee',
  lunch: 'com.qingning.mana.iap.lunch', // 恢复为正确的 ID
};

/**
 * In-App Purchase 工具类
 * 实现基于 cordova-plugin-purchase (v13+) 的 iOS 内购逻辑。
 */
interface CdvPurchaseTransaction {
  verify: () => void;
  finish: () => void;
  id: string;
}

interface CdvPurchaseReceipt {
  finish: () => void;
}

interface CdvPurchaseError {
  code: number;
  message: string;
}

interface CdvPurchaseProduct {
  id: string;
  type: string;
  state: string;
  title: string;
  description: string;
  price: string;
}

interface CdvPurchaseStore {
  products: any[];
  register: (products: Array<{ id: string; type: string; platform: string }>) => void;
  when: () => {
    approved: (cb: (transaction: CdvPurchaseTransaction) => void) => void;
    verified: (cb: (receipt: CdvPurchaseReceipt) => void) => void;
    product: () => {
      updated: (cb: (product: any) => void) => void;
    };
  };
  error: (cb: (err: CdvPurchaseError) => void) => void;
  ready: (cb: () => void) => void;
  initialize: (platforms: string[]) => void;
  update: () => void;
  get: (productId: string) => CdvPurchaseProduct | undefined;
  requestPayment: (params: { id: string; platform: string }) => Promise<CdvPurchaseError | null>;
}

class IAPUtils {
  private store: CdvPurchaseStore | null = null;
  private initialized = false;
  public isReady = false;
  private initRetryCount = 0;
  private maxRetries = 20; // 500ms * 20 = 10s

  /**
   * 初始化商店插件
   */
  public init(): void {
    if (!Capacitor.isNativePlatform()) return;
    if (this.initialized) return;

    const attemptSetup = () => {
      if (this.initialized) return;
      this.initRetryCount++;

      const win = window as any;
      const CdvPurchase = win.CdvPurchase;
      const store = CdvPurchase?.store || win.store;

      if (!store || !store.register) {
        if (this.initRetryCount < this.maxRetries) {
          console.log(`IAP: Waiting for store plugin... (Attempt ${this.initRetryCount})`);
          setTimeout(attemptSetup, 500);
        } else {
          console.error('IAP: Max retries reached, store plugin not found.');
        }
        return;
      }

      console.log('IAP: Store plugin found, starting setup...');
      this.store = store;

      try {
        console.log('IAP: Starting store registration');
        const pType = CdvPurchase?.ProductType?.CONSUMABLE || 'consumable';
        const pPlatform = CdvPurchase?.Platform?.APPLE_APPSTORE || 'apple-appstore';

        store.register([
          { id: IAP_IDS.coffee, type: pType, platform: pPlatform },
          { id: IAP_IDS.lunch, type: pType, platform: pPlatform }
        ]);

        store.when().approved((t: any) => {
          console.log('IAP: Approved', t.id);
          t.verify();
        });
        
        store.when().verified((r: any) => {
          console.log('IAP: Verified');
          r.finish();
        });

        store.when().product().updated((p: any) => {
          console.log(`IAP: Product ${p.id} -> ${p.state}`);
        });

        store.ready(() => {
          console.log('IAP: Store READY callback');
          this.isReady = true;
          try { store.update(); } catch(e) {}
        });

        store.error((err: any) => {
          console.error('IAP Store Error:', JSON.stringify(err));
        });

        // Build 30: 极其保守的初始化调用
        console.log('IAP: Initializing for platform:', pPlatform);
        if (store.initialize) {
          store.initialize([pPlatform]);
        }
        
        this.initialized = true;
        console.log('IAP: Setup success');
      } catch (e: any) {
        console.error('IAP Setup Exception:', e);
        // Build 30 Diagnostic: 让错误无处遁形
        alert(`IAP Setup Crashed: ${e.message || e}\nTrace: ${e.stack ? e.stack.split('\n')[0] : 'No stack'}`);
        if (this.initRetryCount < this.maxRetries) {
          setTimeout(attemptSetup, 2000); // 延长重试间隔
        }
      }
    };

    attemptSetup();
  }

  /**
   * 强制同步
   */
  public forceSync(): void {
    if (this.store && this.initialized) {
      console.log('IAP: Forcing update...');
      this.store.update();
    } else {
      console.log('IAP: Force sync triggered but not init, calling init...');
      this.init();
    }
  }

  /**
   * 发起内购
   * @param productId 产品 ID (com.qingning.mana.tip.*)
   * @returns 购买是否发起成功
   */
  public async purchase(productId: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log(`IAP: Mocking purchase for ${productId} since this is the web/PWA mode.`);
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 1500); // Simulate network latency
      });
    }

    if (!this.store) {
      console.error('IAP: Store not initialized');
      return false;
    }

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      const store = this.store || CdvPurchase?.store;
      
      if (!store) {
        alert('IAP Error: Store not found even in fallback. Please restart app.');
        return false;
      }

      // Build 27: 更健壮的产品查询
      const product = store.get ? store.get(productId) : store.products?.find((p: any) => p.id === productId);
      
      if (!product) {
        const productsList = store.products || [];
        const availableInfo = productsList.map((p: any) => `${p.id}(${p.state})`).join(', ') || 'NONE';
        const storeState = this.initialized ? 'Initialized' : 'Not-Init';
        alert(`IAP Error: ${productId} not loaded.\nStore: ${storeState}\nRegistered: [${availableInfo}]\nWait a few seconds.`);
        return false;
      }

      console.log('IAP: Requesting purchase for:', product.id, 'State:', product.state);

      const offer = (product as any).getOffer ? (product as any).getOffer() : null;
      if (offer) {
        await offer.order();
        return true;
      }

      // v13 Fallback
      if (typeof store.requestPayment === 'function') {
        const error = await store.requestPayment({
          id: productId,
          platform: CdvPurchase?.Platform?.APPLE_APPSTORE || 'apple-appstore'
        });
        if (error) {
          alert(`IAP Payment Error: ${error.message}`);
          return false;
        }
        return true;
      }
      
      alert('IAP Error: No valid purchase method found for this product.');
      return false;
    } catch (e: any) {
      alert(`IAP Exception: ${e.message || e}`);
      return false;
    }
  }
}

export const iapUtils = new IAPUtils();
export default iapUtils;
