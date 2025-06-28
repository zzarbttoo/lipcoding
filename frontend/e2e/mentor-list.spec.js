import { test, expect } from '@playwright/test'

// 멘토 리스트 화면에서 mentors-test.json 데이터를 정상적으로 렌더링하는지 E2E 테스트

test('멘토 리스트가 정상적으로 보인다', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // 로그인 및 프로필 등록 등은 생략, 바로 멘토 리스트로 이동한다고 가정
  // 실제 앱 구조에 따라 필요시 로그인/프로필 등록 자동화 코드 추가 가능

  // "멘토 리스트 보기" 버튼 클릭
  await page.getByRole('button', { name: /멘토 리스트 보기/ }).click()

  // mentors-test.json의 멘토 이름이 모두 화면에 보이는지 확인
  await expect(page.getByText('홍길동')).toBeVisible()
  await expect(page.getByText('이몽룡')).toBeVisible()
  await expect(page.getByText('성춘향')).toBeVisible()

  // 각 멘토의 기술 스택도 보이는지 확인
  await expect(page.getByText('React, Vue, JavaScript')).toBeVisible()
  await expect(page.getByText('Node.js, Express, MongoDB')).toBeVisible()
  await expect(page.getByText('React, Node.js, TypeScript')).toBeVisible()
})
