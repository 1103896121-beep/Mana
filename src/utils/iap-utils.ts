import { Capacitor } from '@capacitor/core';

export const IAP_IDS = {
  coffee: 'com.qingning.mana.tip.coffee',
  lunch: 'com.qingning.mana.tip.lunch', // 统一命名模式
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
      // Build 27: 优先从 CdvPurchase 顶级对象获取
      const CdvPurchase = (window as any).CdvPurchase;
      const globalStore = CdvPurchase?.store || (window as any).store;
      
      if (!globalStore || !globalStore.register) {
        console.warn('IAP: Store plugin (v13) not available yet.');
        return false;
      }

      this.store = globalStore;
      this.initialized = true;

      try {
        // v13 Standard Constants
        const pType = CdvPurchase?.ProductType?.CONSUMABLE || 'consumable';
        const pPlatform = CdvPurchase?.Platform?.APPLE_APPSTORE || 'apple-appstore';

        console.log(`IAP: Registering products on platform: ${pPlatform}`);

        this.store!.register([
          { id: IAP_IDS.coffee, type: pType, platform: pPlatform },
          { id: IAP_IDS.lunch, type: pType, platform: pPlatform }
        ]);

        this.store!.when().approved((transaction: any) => {
          console.log('IAP: Transaction approved:', transaction.id);
          transaction.verify();
        });
        
        this.store!.when().verified((receipt: any) => {
          console.log('IAP: Receipt verified');
          receipt.finish();
        });

        // Build 27: 更精细的状态监听
        this.store!.when().product().updated((p: any) => {
          console.log(`IAP: Product ${p.id} [${p.state}]`);
        });

        this.store!.ready(() => {
          console.log('IAP: Store READY callback');
          this.isReady = true;
          this.store!.update(); // 准备就绪后立刻更新一次
        });

        this.store!.error((err: any) => {
          console.error('IAP Global Error:', JSON.stringify(err));
        });

        // Build 27: v13 初始化需传入平台数组
        if (typeof (this.store as any).initialize === 'function') {
          (this.store as any).initialize([pPlatform]);
          console.log('IAP: store.initialize() called with platform');
        } else {
          (window as any).CdvPurchase?.store?.initialize([pPlatform]);
        }
        
        return true;
      } catch (e) {
        this.initialized = false;
        console.error('IAP Critical Setup Error:', e);
        return false;
      }
    };

    // 1. 尝试立即初始化
    if (setupStore()) return;

    // 2. 监听系统就绪事件
    const handleDeviceReady = () => {
      console.log('IAP: deviceready hit');
      if (!this.initialized) setupStore();
      document.removeEventListener('deviceready', handleDeviceReady);
    };
    document.addEventListener('deviceready', handleDeviceReady);
    
    // 3. 兜底方案
    setTimeout(() => {
      if (!this.initialized) {
        console.log('IAP: Last resort retry');
        setupStore();
      }
    }, 4000);
  }

  /**
   * 强制同步
   */
  public forceSync(): void {
    if (this.store) {
      console.log('IAP: Syncing...');
      this.store.update();
    } else {
      console.log('IAP: Cannot sync, store null. Retrying init.');
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
