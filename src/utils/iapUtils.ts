/* eslint-disable @typescript-eslint/no-explicit-any */
import { Capacitor } from '@capacitor/core';

export const IAP_IDS = {
  coffee: 'com.david.mana.tip.coffee',
  lunch: 'com.david.mana.tip.lunch',
};

class IAPUtils {
  private store: any = null;
  public isReady = false;

  public init() {
    if (!Capacitor.isNativePlatform()) {
      console.log('IAP: Not running on a native device (iOS/Android). Mocking store.');
      return;
    }
    
    // Safety check for store availability
    if (!(window as any).store) {
      console.warn('IAP: Store plugin not available.');
      return;
    }

    this.store = (window as any).store;

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
      this.store.when().approved((transaction: any) => {
        console.log('IAP Approved:', transaction);
        transaction.verify(); // Starts receipt validation
      });

      this.store.when().verified((receipt: any) => {
        console.log('IAP Verified:', receipt);
        receipt.finish(); // Finish transaction to allow buying again
      });

      // Handle generic errors
      this.store.error((err: any) => {
        console.error('IAP Error: ' + JSON.stringify(err));
      });

      this.store.ready(() => {
        console.log('IAP Store is ready and initialized.');
        this.isReady = true;
      });

      // Initialize the store
      this.store.initialize();
    } catch (e) {
      console.error('IAP Init error:', e);
    }
  }

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

      return new Promise((resolve) => {
        // v13 simplified ordering
        this.store.requestPayment({
          id: productId,
          platform: 'apple-appstore'
        }).then((error: any) => {
          if (error) {
            console.error('IAP requestPayment failed:', error);
            resolve(false);
          } else {
            // Assume success if no error is thrown instantly (in a real app, track the transaction state)
            resolve(true); 
          }
        }).catch(() => {
          resolve(false);
        });
      });
    } catch (e) {
      console.error('IAP purchase error:', e);
      return false;
    }
  }
}

export const iapUtils = new IAPUtils();
export default iapUtils;
