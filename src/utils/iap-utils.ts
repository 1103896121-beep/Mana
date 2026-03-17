import { Capacitor } from '@capacitor/core';

export const IAP_IDS = {
  coffee: 'com.qingning.mana.iap.coffee',
  lunch: 'com.qingning.mana.iap.lunch',
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
  register: (products: Array<{ id: string; type: string; platform: string }>) => void;
  when: () => {
    approved: (cb: (transaction: CdvPurchaseTransaction) => void) => void;
    verified: (cb: (receipt: CdvPurchaseReceipt) => void) => void;
  };
  error: (cb: (err: CdvPurchaseError) => void) => void;
  ready: (cb: () => void) => void;
  initialize: () => void;
  update: () => void;
  get: (productId: string) => CdvPurchaseProduct | undefined;
  requestPayment: (params: { id: string; platform: string }) => Promise<CdvPurchaseError | null>;
}

class IAPUtils {
  private store: CdvPurchaseStore | null = null;
  public isReady = false;

  /**
   * 初始化商店插件
   * 仅在原生平台执行。
   */
  public init(): void {
    if (!Capacitor.isNativePlatform()) {
      // Mocking store for web/PWA
      return;
    }
    
    // Safety check for store availability
    const globalStore = (window as unknown as { store: CdvPurchaseStore }).store;
    if (!globalStore) {
      console.warn('IAP: Store plugin not available.');
      return;
    }

    this.store = globalStore;

    // Register consumable products (CdvPurchase v13+)
    try {
      this.store.register([
        {
          id: IAP_IDS.coffee,
          type: 'consumable',
          platform: 'apple-appstore'
        },
        {
          id: IAP_IDS.lunch,
          type: 'consumable',
          platform: 'apple-appstore'
        }
      ]);

      // Setup event listeners
      this.store.when().approved((transaction) => {
        transaction.verify(); // Starts receipt validation
      });

      this.store.when().verified((receipt) => {
        receipt.finish(); // Finish transaction to allow buying again
      });

      // Handle generic errors
      this.store.error((err) => {
        console.error('IAP Error: ' + JSON.stringify(err));
      });

      this.store.ready(() => {
        this.isReady = true;
      });

      // Initialize for Apple App Store (v13 requirements)
      (this.store as any).initialize();
      this.store.update();
    } catch (e) {
      console.error('IAP Init error:', e);
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
      const product = this.store.get(productId);
      if (!product) {
        console.error('IAP: Product not found:', productId);
        return false;
      }

      // v13 Standard API: Use order() from the default offer
      const offer = (product as any).getOffer();
      if (offer) {
        await offer.order();
        return true;
      }

      // Fallback to requestPayment if offer is missing (unlikely in v13)
      const error = await (this.store as any).requestPayment({
        id: productId,
        platform: 'apple-appstore'
      });
      
      return !error;
    } catch (e) {
      console.error('IAP purchase error:', e);
      return false;
    }
  }
}

export const iapUtils = new IAPUtils();
export default iapUtils;
