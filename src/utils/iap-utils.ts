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
  public onPurchaseSuccess?: () => void;

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
        const pType = CdvPurchase?.ProductType?.CONSUMABLE || 'consumable';
        const pPlatform = CdvPurchase?.Platform?.APPLE_APPSTORE || 'apple-appstore';
        
        console.log(`IAP: Initializing v13 with products on ${pPlatform}`);

        // Build 34: 极其简洁的注册方式，减少干扰
        store.register([
          { id: IAP_IDS.coffee, type: pType, platform: pPlatform },
          { id: IAP_IDS.lunch, type: pType, platform: pPlatform }
        ]);

        const when = store.when();
        if (when.approved) {
          when.approved((t: any) => {
            console.log('IAP: Approved', t.id);
            t.verify();
          });
        }
        
        if (when.verified) {
          when.verified((r: any) => {
            console.log('IAP: Verified');
            r.finish();
            if (this.onPurchaseSuccess) {
              this.onPurchaseSuccess();
            }
          });
        }

        store.ready(() => {
          console.log('IAP: Store READY');
          this.isReady = true;
          const pList = store.products || [];
          console.log(`IAP: Store Ready! ${pList.length} products found in memory.`);
          // Build 34: 如果注册为 NONE，打印内存中所有产品的 ID 和状态供最终诊断
          pList.forEach((p: any) => console.log(`IAP DEBUG: Product ${p.id} state: ${p.state}`));
          
          if (store.update) {
            try { store.update(); } catch(e) {}
          }
        });

        if (store.error) {
          store.error((err: any) => {
            console.error('IAP Store Error:', JSON.stringify(err));
          });
        }

        console.log('IAP: Starting initialization sequence');
        if (typeof store.initialize === 'function') {
          store.initialize([pPlatform]);
        }
        
        this.initialized = true;
        console.log('IAP: Setup complete');
      } catch (e: any) {
        console.error('IAP Setup Exception:', e);
        if (this.initRetryCount < this.maxRetries) {
          setTimeout(attemptSetup, 2000);
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
