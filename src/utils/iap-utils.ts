import { Capacitor } from '@capacitor/core';

export const IAP_IDS = {
  coffee: 'com.qingning.mana.tip.coffee',
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
  private initialized = false;
  public isReady = false;

  /**
   * 初始化商店插件
   * 仅在原生平台执行。
   */
  public init(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (this.initialized) {
      console.log('IAP: Already initialized');
      return;
    }

    const setupStore = () => {
      const globalStore = (window as any).CdvPurchase?.store || (window as any).store;
      if (!globalStore) {
        console.warn('IAP: Store plugin not available yet, waiting...');
        return false;
      }

      this.store = globalStore;
      this.initialized = true;

      try {
        this.store!.register([
          { id: IAP_IDS.coffee, type: 'consumable', platform: 'apple-appstore' },
          { id: IAP_IDS.lunch, type: 'consumable', platform: 'apple-appstore' }
        ]);

        this.store!.when().approved((transaction: any) => transaction.verify());
        this.store!.when().verified((receipt: any) => receipt.finish());

        (this.store as any).when().product().updated((p: any) => {
          console.log(`IAP: Product ${p.id} state updated to: ${p.state}`);
        });

        this.store!.ready(() => {
          console.log('IAP: Store is READY');
          this.isReady = true;
        });

        this.store!.error((err: any) => {
          console.error('IAP Error: ' + JSON.stringify(err));
        });

        (this.store as any).initialize();
        this.store!.update();
        console.log('IAP: Store initialization successful');
        return true;
      } catch (e) {
        this.initialized = false;
        console.error('IAP Init error:', e);
        return false;
      }
    };

    // 尝试立即初始化
    if (setupStore()) return;

    // 如果失败，监听系统就绪事件
    const handleDeviceReady = () => {
      console.log('IAP: deviceReady triggered, retrying init...');
      setupStore();
      document.removeEventListener('deviceready', handleDeviceReady);
    };
    document.addEventListener('deviceready', handleDeviceReady);
    
    // 兜底方案：3秒后最后尝试一次
    setTimeout(() => {
      if (!this.initialized) {
        console.log('IAP: Fallback retry...');
        setupStore();
      }
    }, 3000);
  }

  /**
   * 强制同步。在内购设置面板打开时通过本接口可以唤醒注册。
   */
  public forceSync(): void {
    if (this.store) {
      console.log('IAP: Force synchronization triggered');
      this.store.update();
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
      // Build 12: Robust product lookup to fix "this.store.get is not a function"
      const store = this.store as any;
      const product = store?.get ? store.get(productId) : (window as any).CdvPurchase?.store?.get(productId);
      
      // Build 11 Debug: 显式提示产品加载状态
      // Build 19 Diagnostic Alert Fixed: Safer access to avoid crash if products list is not an array
      if (!product) {
        const store = (this.store as any) || (window as any).CdvPurchase?.store;
        const productsList = store?.products || [];
        const availableIds = productsList.map((p: any) => p.id).join(', ') || 'NONE';
        alert(`IAP Error: Product ${productId} not loaded. Registered IDs in memory: [${availableIds}]. Please wait or check internet.`);
        return false;
      }

      console.log('IAP Attempting purchase for:', product.id, 'State:', product.state);

      // v13 Standard API: Use order() from the default offer
      const offer = (product as any).getOffer();
      if (offer) {
        await offer.order();
        return true;
      }

      // Fallback: If offer is missing, trying requestPayment
      const error = await (this.store as any).requestPayment({
        id: productId,
        platform: 'apple-appstore'
      });
      
      if (error) {
        alert(`IAP Payment Error: ${error.message}`);
        return false;
      }
      return true;
    } catch (e: any) {
      alert(`IAP Exception: ${e.message || e}`);
      console.error('IAP purchase error:', e);
      return false;
    }
  }
}

export const iapUtils = new IAPUtils();
export default iapUtils;
