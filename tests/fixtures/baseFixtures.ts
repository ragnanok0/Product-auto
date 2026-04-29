import { test as base, Page } from '@playwright/test';

import { LoginPage } from '../pages/SKU/sofficelogin';
import { LogisticsPage } from '../pages/SKU/LogisticsPage';
import { SkuRegisterPopup } from '../pages/SKU/SkuRegisterPopup';
import { InboundRequestPage } from '../pages/SKU/InboundRequestPage';


import { WmsLoginPage } from '../pages/wms/wmsLoginPage';
import { WmsMenuPage } from '../pages/wms/WmsMenuPage';
import { WmsInboundPage } from '../pages/wms/WmsInboundPage';
import { WmsInboundConfirmPage } from '../pages/wms/WmsInboundConfirmPage';
import { WmsPalletizingPage } from '../pages/wms/WmsPalletizingPage';


import { ProductPage } from '../pages/product/ProductPage';

export type StorageType = '상온' | '냉장' | '냉동';

export const WMS_CONFIG = {
  '상온': { center: '50_셀러위탁상온', shipper: '50_셀러위탁상온' },
  '냉장': { center: '10_인천3센터', shipper: '10_인천3' },
  '냉동': { center: '10_인천3센터', shipper: '10_인천3' }
} as const;

type MyFixtures = {
  loginPage: LoginPage;
  logisticsPage: LogisticsPage;

  wmsLogin: WmsLoginPage;
  wmsMenu: WmsMenuPage;
  inboundPage: WmsInboundPage;
  inboundConfirmPage: WmsInboundConfirmPage;
  palletizingpage: WmsPalletizingPage;

  productPage: ProductPage;
};


export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  logisticsPage: async ({ page }, use) => {
    await use(new LogisticsPage(page));
  },
  wmsLogin: async ({ page }, use) => {
    await use(new WmsLoginPage(page));
  },
  wmsMenu: async ({ page }, use) => {
    await use(new WmsMenuPage(page));
  },
  inboundPage: async ({ page }, use) => {
    await use(new WmsInboundPage(page));
  },
  inboundConfirmPage: async ({ page }, use) => {
    await use(new WmsInboundConfirmPage(page));
  },
  palletizingpage: async ({ page }, use) => {
    await use(new WmsPalletizingPage(page));
  },
  productPage: async ({ page }: any, use: any) => {
  await use(new ProductPage(page));
  },
});

export { expect } from '@playwright/test';
