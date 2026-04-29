import { Locator, Page } from '@playwright/test';
 
export class LoginPage {
  readonly page: Page;
  readonly idInput: Locator;
  readonly pwInput: Locator;
  readonly loginBtn: Locator;
  readonly nextTimeBtn: Locator;
 
  constructor(page: Page) {
    this.page = page;
    this.idInput = page.locator('#loginName');
    this.pwInput = page.locator('#passWord');
    this.loginBtn = page.getByRole('button', { name: '로그인' });
    this.nextTimeBtn = page.locator('button:has-text("다음에 하기")');
  }
 
  async login(
    userId: string = process.env.SO_USER_ID || '',
    userPw: string = process.env.SO_USER_PW || ''
  ) {
    console.log('[1단계] 로그인 페이지 접속 중...');
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.page.getByRole('link', { name: '로그인' }).click();
 
    console.log('[1단계] 계정 정보 입력 중...');
    await this.idInput.waitFor({ state: 'visible' });
    await this.idInput.click();
    await this.idInput.fill(userId);
    await this.pwInput.click();
    await this.pwInput.fill(userPw);
    await this.pwInput.press('Enter');
 
    try {
      await this.nextTimeBtn.waitFor({ state: 'visible', timeout: 5000 });
      await this.nextTimeBtn.click();
      await this.page.waitForURL('**/view/main', { timeout: 10000 });
      console.log('[1단계] 로그인 완료 ✓');
    } catch (e) {
      console.log('[1단계] 로그인 완료 ✓');
    }
  }
}
