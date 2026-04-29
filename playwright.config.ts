import 'dotenv/config';
import path from 'path';

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',        // ← dist 안의 tests 폴더
  testMatch: '**/*.spec.ts', // ← .ts 대신 .js로 변경!
  /* CI 서버 속도를 고려해 전체 제한 시간 2분 설정 */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  /* 한 번에 하나씩 차분하게 실행 (안정성) */
  fullyParallel: false,
  workers: 1,
  /* 실패 시에만 리포트 생성 */
  reporter: [
  ['html', { open: 'never' }] // 'always'나 'on-failure' 대신 'never'로 설정
],

  /* 테스트 공통 설정 */
  use: {
    baseURL: process.env.BASE_URL || '',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        '--disable-dev-shm-usage',
      ]
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
      },
    },
    {
      name: 'webkit',
      use: { 
        browserName: 'webkit',
      },
    }, */
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
