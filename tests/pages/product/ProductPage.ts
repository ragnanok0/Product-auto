import { Page, expect } from '@playwright/test';
 
export class ProductPage {
  readonly page: Page;
 
  constructor(page: Page) {
    this.page = page;
  }
 
  async goToProductRegister() {
    console.log('[2단계] 신규상품 등록 메뉴 이동 중...');
    await this.page.locator('button.navi-cate:has-text("상품관리")').click();
    await this.page.locator('a.link:has-text("신규상품 등록")').click();
    await this.page.waitForTimeout(2000);
    console.log('[2단계] 신규상품 등록 페이지 로드 완료 ✓');
  }
 
  async inputProductName(productName: string) {
    console.log('[2단계] 상품명 입력 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
    const nameInput = frame.locator('input[title="상품명 입력"]');
 
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prdName = `${productName}_${dateStr}`;
 
    await nameInput.click();
    await nameInput.fill(prdName);
    await expect(nameInput).toHaveValue(prdName);
    console.log(`[2단계] 상품명 입력 완료 ✓ (${prdName})`);
  }
 
  async selectCategory() {
    console.log('[2단계] 카테고리 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    await frame.locator('label:has-text("카테고리명 선택")').click();
    await this.page.waitForTimeout(500);
    await frame.locator('li:has-text("식품")').click();
    await this.page.waitForTimeout(500);
    await frame.locator('li:has-text("냉장/냉동식품")').click();
    await this.page.waitForTimeout(500);
    await frame.locator('li:has-text("냉장/냉동식품 기타")').click();
    await this.page.waitForTimeout(500);
    await frame.locator('li:has-text("냉장냉동식품 기타")').click();
    await this.page.waitForTimeout(500);
    console.log('[2단계] 카테고리 선택 완료 ✓');
  }
 
  async selectSellerDelivery() {
    console.log('[2단계] 배송 유형 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
    const section = frame.locator('#section-consignment');
    const label = section.locator('label:has-text("셀러위탁배송")');
 
    await label.click();
    await expect(section.locator('label.lab.active:has-text("셀러위탁배송")')).toHaveCount(1);
    await expect(section.locator('input[type="radio"][value="Y"]:checked')).toHaveCount(1);
    console.log('[2단계] 셀러위탁배송 선택 완료 ✓');
  }
 
  async selectSalePeriod() {
    console.log('[2단계] 판매기간 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
    await frame.locator('select[title="기간선택"]').selectOption('60d');
    console.log('[2단계] 판매기간 60일 선택 완료 ✓');
  }
 
  async inputPrice(price: string) {
    console.log('[2단계] 판매가 입력 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
    const priceInput = frame.locator('strong:has-text("판매가")')
      .locator('xpath=ancestor::div[contains(@class,"b-box__row")]')
      .locator('input.inp');
 
    await priceInput.click();
    await priceInput.fill(price);
 
    const value = await priceInput.inputValue();
    expect(Number(value.replace(/,/g, ''))).toBe(Number(price.replace(/,/g, '')));
    console.log(`[2단계] 판매가 입력 완료 ✓ (${price}원)`);
  }
 
  async selectSkuSetting() {
    console.log('[3단계] SKU 설정 활성화 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
    const skuSection = frame.locator('div.b-box__row').filter({ hasText: 'SKU설정' });
    const label = skuSection.locator('label.lab:has-text("설정")').first();
 
    await label.click();
    await expect(label).toHaveClass(/active/);
    console.log('[3단계] SKU 설정 활성화 완료 ✓');
  }
 
  async searchSku(skuNo: string) {
    console.log(`[3단계] SKU 번호(${skuNo}) 검색 중...`);
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const skuInput = frame.locator('input[placeholder*="SKU번호 입력"]');
    await expect(skuInput).toBeVisible({ timeout: 10000 });
 
    const searchBox = skuInput.locator(
      'xpath=ancestor::div[contains(@class,"input-text--search")]'
    );
    const searchBtn = searchBox.locator('button.btn-search');
 
    await skuInput.click();
    await skuInput.fill(skuNo);
 
    await skuInput.evaluate((el: HTMLInputElement, value: string) => {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    }, skuNo);
 
    await skuInput.press('Enter');
    await searchBtn.click({ force: true });
 
    const loadingOverlay = frame.locator('.ag-overlay-loading-wrapper');
    try {
      await loadingOverlay.waitFor({ state: 'hidden', timeout: 10000 });
    } catch {
      // 로딩 오버레이가 없는 경우 무시
    }
 
    const rows = frame.locator('.ag-row');
 
    await expect.poll(async () => {
      return await rows.count();
    }, {
      timeout: 20000,
      intervals: [500, 1000, 1500, 2000],
      message: '[오류] SKU 검색 결과 없음 - 결과가 나타나지 않습니다.'
    }).toBeGreaterThanOrEqual(1);
 
    await this.page.waitForTimeout(1500);
 
    const rowCount = await rows.count();
    console.log(`[3단계] SKU 검색 완료 ✓ (검색결과: ${rowCount}건)`);
 
    if (rowCount === 0) {
      await this.page.screenshot({ path: 'debug-sku-search-fail.png' });
      throw new Error('[오류] SKU 검색 결과 없음');
    }
  }
 
  async selectAllSku() {
    console.log('[3단계] SKU 항목 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const checkboxes = frame.locator('.ag-center-cols-container .ag-selection-checkbox input');
    await expect(checkboxes.first()).toBeVisible({ timeout: 10000 });
 
    const count = await checkboxes.count();
 
    if (count === 0) throw new Error('[오류] SKU 체크박스를 찾을 수 없습니다.');
 
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      try {
        await checkbox.scrollIntoViewIfNeeded();
        await checkbox.click({ timeout: 2000 });
      } catch {
        console.log(`[3단계] ${i + 1}번째 항목 재시도 중...`);
        await checkbox.evaluate((el: HTMLInputElement) => el.click());
      }
    }
 
    const selected = frame.locator('.ag-checkbox-input-wrapper.ag-checked');
    const selectedCount = await selected.count();
 
    if (selectedCount === 0) throw new Error('[오류] SKU 선택 실패');
    console.log(`[3단계] SKU ${selectedCount}개 선택 완료 ✓`);
  }
 
  async applySkuSelection() {
    console.log('[3단계] SKU 적용 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const applyBtn = frame.locator('#btnAddStockList');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
 
    const rows = frame.locator('.ag-row');
    const rowCount = await rows.count();
 
    if (rowCount === 0) throw new Error('[오류] SKU 적용 실패');
    console.log(`[3단계] SKU 적용 완료 ✓ (${rowCount}건)`);
  }
 
  async selectAllSkuInBottomGrid() {
    console.log('[3단계] 하단 그리드 전체 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const rows = frame.locator('.ag-row');
    const rowCount = await rows.count();
 
    if (rowCount === 0) throw new Error('[오류] 하단 SKU 목록 없음');
 
    const header = frame.locator('.ag-header-select-all')
      .filter({ has: frame.locator(':visible') })
      .last();
 
    await header.click();
 
    const selectedRows = frame.locator('.ag-row-selected');
    const selectedCount = await selectedRows.count();
 
    if (selectedCount === 0) throw new Error('[오류] 전체 선택 실패');
    console.log(`[3단계] 하단 그리드 ${selectedCount}개 선택 완료 ✓`);
  }
 
  async clickRegisterSku() {
    console.log('[3단계] SKU 등록 버튼 클릭 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const registerBtn = frame.getByRole('button', { name: '등록', exact: true });
    await registerBtn.waitFor({ state: 'attached' });
    await registerBtn.evaluate((el: HTMLElement) => el.click());
 
    await this.page.waitForTimeout(500);
 
    const rows = frame.locator('.ag-row');
    const count = await rows.count();
 
    if (count === 0) throw new Error('[오류] SKU 등록 후 목록 없음');
    console.log(`[3단계] SKU 등록 완료 ✓ (${count}건)`);
  }
 
  async selectMainImageButton() {
    console.log('[4단계] 대표 이미지 등록 버튼 클릭 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const uploadBtn = frame.locator('.b-box__row')
      .filter({ hasText: '대표 이미지' })
      .locator('button.c-addimg__btn-add')
      .filter({ hasText: /600\s*X\s*600/ })
      .first();

    await uploadBtn.waitFor({ state: 'attached', timeout: 5000 });

    await uploadBtn.evaluate((el: HTMLElement) => {
      el.scrollIntoView();
      el.click();
    });
    console.log('[4단계] 이미지 업로드 다이얼로그 열기 완료 ✓');
  }
 
  async uploadMainImage(imagePath: string) {
    console.log('[4단계] 대표 이미지 업로드 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const dialogs = frame.locator('div[role="dialog"]');
    const dialogCount = await dialogs.count();

    let activeDialog = null;
 
    for (let i = 0; i < dialogCount; i++) {
      const d = dialogs.nth(i);
      const visible = await d.isVisible().catch(() => false);
      const text = await d.textContent().catch(() => '');

      if (visible && text?.includes('이미지 불러오기')) {
        activeDialog = d;
        break;
      }
    }
 
    const fileInput = activeDialog.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached' });
    await fileInput.setInputFiles(imagePath);
    await fileInput.dispatchEvent('change');
    await fileInput.dispatchEvent('input');
    await fileInput.dispatchEvent('blur');
 
    const thumbnail = frame.locator('.c-addimg__thumb img');
    const thumbCount = await thumbnail.count();
 
    if (thumbCount === 0) console.log('[경고] 썸네일이 확인되지 않습니다.');
    console.log('[4단계] 이미지 업로드 완료 ✓');
  }
 
  async inputDetailHtml() {
    console.log('[5단계] 상품 상세 설명 입력 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const textarea = frame.locator('textarea[title="html 입력"]:visible').first();
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    await textarea.click();
 
    const htmlContent = '구매금지 상품입니다. 구매 시 판매취소되오니 구매금지 바랍니다.';
    await textarea.fill(htmlContent);
    await textarea.dispatchEvent('input');
    await textarea.dispatchEvent('change');
    await textarea.dispatchEvent('blur');
 
    await expect(textarea).toHaveValue(htmlContent);
    console.log('[5단계] 상품 상세 설명 입력 완료 ✓');
  }
 
  async checkNoBrand() {
    console.log('[5단계] 브랜드 없음 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const label = frame.locator('label[for="lbCheckNobrand01"]');
    await label.waitFor({ state: 'visible', timeout: 5000 });
    await label.click();
 
    const checkbox = frame.locator('#lbCheckNobrand01');
    await expect(checkbox).toBeChecked();
    console.log('[5단계] 브랜드 없음 선택 완료 ✓');
  }
 
  async selectOriginDetail() {
    console.log('[5단계] 원산지 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const section = frame.locator('.c-radio__tab').filter({
      has: frame.locator('input[name="원재료"]'),
    });
    const label = section.locator('label:has-text("상세설명 참조")');
 
    await label.waitFor({ state: 'visible', timeout: 5000 });
    await label.click();
 
    await expect(label).toHaveClass(/active/);
    await expect(section.locator('input[value="05"]:checked')).toHaveCount(1);
    console.log('[5단계] 원산지 선택 완료 ✓');
  }
 
  async selectProductInfoType() {
    console.log('[5단계] 상품정보 제공고시 유형 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const select = frame.locator('#prdInfoTypeOpt');
    await select.waitFor({ state: 'visible', timeout: 5000 });
    await select.selectOption('891031');
 
    const selectedValue = await select.inputValue();
    if (selectedValue !== '891031') throw new Error('[오류] 가공식품 선택 실패');
    console.log('[5단계] 상품정보 제공고시 유형 선택 완료 ✓');
  }
 
  async selectAllDetailRefer() {
    console.log('[5단계] 상품정보 제공고시 항목 선택 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const section = frame.locator('.b-box').filter({ hasText: '상품정보 제공고시' }).first();
    await section.waitFor({ state: 'visible', timeout: 10000 });
 
    const rows = section.locator('.b-box-sub__row');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
 
    const rowCount = await rows.count();
    if (rowCount === 0) throw new Error('[오류] 상품정보 제공고시 항목 없음');
 
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const label = row.locator('label:has-text("상품상세설명 참조")');
      try {
        await label.click({ timeout: 2000 });
      } catch {
        await label.evaluate((el: HTMLElement) => el.click());
      }
      const checked = row.locator('input[type="radio"][value="상품상세설명 참조"]:checked');
      await expect(checked).toHaveCount(1);
    }
 
    console.log(`[5단계] 상품정보 제공고시 ${rowCount}개 항목 선택 완료 ✓`);
  }
 
  async inputReturnExchangeGuide() {
    console.log('[6단계] 반품/교환 안내 입력 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const section = frame.locator('.b-box').filter({ hasText: '반품/교환 안내' }).first();
    await section.waitFor({ state: 'visible', timeout: 10000 });
 
    const textarea = section.locator('textarea[title="반품/교환 안내"]');
    await textarea.waitFor({ state: 'visible' });
 
    const content = '구매금지 상품입니다. 구매 시 판매취소되오니 구매금지 바랍니다.';
    await textarea.click();
    await textarea.fill(content);
    await expect(textarea).toHaveValue(content);
    console.log('[6단계] 반품/교환 안내 입력 완료 ✓');
  }
 
  async inputAsGuide() {
    console.log('[6단계] A/S 안내 입력 중...');
    const frame = this.page.frameLocator('iframe[title="신규상품 등록"]');
 
    const section = frame.locator('.b-box').filter({ hasText: 'A/S안내' }).first();
    await section.waitFor({ state: 'visible', timeout: 10000 });
 
    const textarea = section.locator('textarea[title="A/S안내"]');
    await textarea.waitFor({ state: 'visible' });
 
    const content = '구매금지 상품입니다. 구매 시 판매취소되오니 구매금지 바랍니다.';
    await textarea.click();
    await textarea.fill(content);
    await expect(textarea).toHaveValue(content);
    console.log('[6단계] A/S 안내 입력 완료 ✓');
  }
 
  async clickSubmitProduct() {
    console.log('[7단계] 상품 등록 버튼 클릭 중...');
    const frame = this.page.frames().find(f =>f.url().includes('/pages/product-reg/index.html'));
 
    if (!frame) throw new Error('[오류] 상품등록 iframe을 찾을 수 없습니다.');
 
    const submitBtn = frame.locator('section.action-bar button').filter({ hasText: '등록하기' });
    const count = await submitBtn.count();
 
    if (count === 0) throw new Error('[오류] 등록하기 버튼을 찾을 수 없습니다.');
    await submitBtn.first().click();
    console.log('[7단계] 등록하기 버튼 클릭 완료 ✓');
 
    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }
 
  async extractProductNo(): Promise<string> {
    console.log('[7단계] 상품번호 추출 중...');
    const frame = this.page.frames().find(f =>f.url().includes('/pages/product-reg/index.html'));
 
    if (!frame) throw new Error('[오류] 상품등록 iframe을 찾을 수 없습니다.');
 
    const popup = frame.locator('div').filter({hasText: '상품등록이 완료되었습니다'});
    await expect(popup.first()).toHaveCount(1, { timeout: 15000 });
 
    const target = popup.first();
    const prdNo = await target.locator('span[name="prdNo"]').textContent();
 
    if (!prdNo) throw new Error('[오류] 상품번호를 추출할 수 없습니다.');
 
    const clean = prdNo.trim();
    return clean;
  }
 
  async createProduct(productName: string, price: string, skuNo: string, imagePath: string) {
    // 기본 정보
    await this.goToProductRegister();
    await this.inputProductName(productName);
    await this.selectCategory();
    await this.selectSellerDelivery();
    await this.selectSalePeriod();
    await this.inputPrice(price);
 
    // SKU 설정
    await this.selectSkuSetting();
    await this.searchSku(skuNo);
    await this.selectAllSku();
    await this.applySkuSelection();
    await this.selectAllSkuInBottomGrid();
    await this.clickRegisterSku();
 
    // 이미지
    await this.selectMainImageButton();
    await this.uploadMainImage(imagePath);
 
    // 상세정보
    await this.inputDetailHtml();
    await this.checkNoBrand();
    await this.selectOriginDetail();
 
    // 상품정보 제공고시
    await this.selectProductInfoType();
    await this.selectAllDetailRefer();
 
    // 추가 정보
    await this.inputReturnExchangeGuide();
    await this.inputAsGuide();
 
    // 등록 완료
    await this.clickSubmitProduct();
    const prdNo = await this.extractProductNo();
 
    console.log('==========================================');
    console.log('[테스트 성공]');
    console.log(`- 등록된 상품번호: ${prdNo}`);
    console.log('==========================================');
  }
}
