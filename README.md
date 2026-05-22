# 메모 앱

Apple Notes에서 영감을 받은 심플하고 빠른 크로스 플랫폼 메모 앱.

**기술 스택:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · PWA

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| ✍️ 메모 작성/편집 | 제목 + 본문 분리 구조 |
| 💾 자동 저장 | 1초 디바운스 자동 저장 |
| 🔄 실시간 동기화 | Supabase Realtime — 여러 기기 즉시 반영 |
| 🔍 메모 검색 | 제목/본문 전체 검색 |
| 📎 파일 첨부 | 이미지, PDF, 문서 (최대 10MB) |
| 🌙 다크 모드 | 시스템 설정 연동 + 수동 전환 |
| 📱 PWA | iPhone/macOS/Windows 설치 가능 |
| 🔐 이메일 인증 | Supabase Auth |

---

## 빠른 시작

### 1. 프로젝트 클론 & 의존성 설치

```bash
git clone <your-repo>
cd memo-app
npm install
```

### 2. Supabase 설정

**2-1. Supabase 프로젝트 생성**
1. [supabase.com](https://supabase.com) 접속 → 새 프로젝트 생성
2. 프로젝트 이름: `memo-app` (원하는 이름)
3. 비밀번호 설정 후 생성 대기 (약 1-2분)

**2-2. 데이터베이스 스키마 실행**
1. Supabase 대시보드 → SQL Editor
2. `supabase/schema.sql` 파일 전체 복사 → 붙여넣기 → Run

**2-3. Realtime 활성화**
1. Database → Replication
2. `supabase_realtime` publication에서 `notes` 테이블 활성화

**2-4. API 키 복사**
1. Settings → API
2. `URL` 과 `anon public` 키 복사

### 3. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 로컬 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## Vercel 배포

### 1. Vercel CLI 배포

```bash
npm install -g vercel
vercel
```

### 2. GitHub 연동 배포 (권장)

1. GitHub에 push
2. [vercel.com](https://vercel.com) → New Project → GitHub 저장소 연결
3. Environment Variables 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 3. Supabase Auth 리디렉션 URL 설정

1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `https://your-app.vercel.app`
3. Redirect URLs: `https://your-app.vercel.app/**`

---

## PWA 설치

### iPhone (iOS Safari)
1. Safari에서 앱 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 이름 확인 후 "추가"

### macOS (Chrome/Edge)
1. 주소창 오른쪽 설치 아이콘 클릭
2. "설치" 클릭

### Windows (Chrome/Edge)
1. 주소창 오른쪽 설치 아이콘 클릭
2. "앱 설치" 클릭

> **PWA 아이콘 설정:** `public/icons/icon-192.png` 와 `icon-512.png` 파일을 추가해야 홈 화면 아이콘이 표시됩니다.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/login/       # 로그인/회원가입 페이지
│   ├── (main)/
│   │   ├── notes/          # 메모 메인 페이지 (사이드바 + 에디터)
│   │   └── settings/       # 설정 페이지
│   ├── layout.tsx          # 루트 레이아웃 (Noto Sans KR 폰트)
│   └── globals.css         # 전역 스타일
├── components/
│   ├── features/
│   │   ├── NotesSidebar.tsx  # 메모 목록 + 검색
│   │   ├── NoteEditor.tsx    # 메모 에디터 + 자동저장
│   │   └── FileUpload.tsx    # 파일 첨부 컴포넌트
│   ├── providers/
│   │   └── ThemeProvider.tsx # 다크모드 상태 관리
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Spinner.tsx
├── hooks/
│   ├── useAuth.ts          # Supabase 인증
│   ├── useNotes.ts         # 메모 CRUD + Realtime
│   └── useAutoSave.ts      # 1초 디바운스 자동저장
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   └── utils.ts            # 날짜 포맷, 유틸리티
└── types/
    └── index.ts            # TypeScript 타입 정의
```

---

## 향후 개선 아이디어

- [ ] **태그/폴더** — 메모 분류 기능
- [ ] **마크다운 지원** — 볼드, 이탤릭, 체크리스트
- [ ] **메모 공유** — 링크로 공유 (읽기 전용)
- [ ] **PIN/생체인증** — 앱 잠금 기능
- [ ] **메모 고정** — 중요 메모 상단 고정
- [ ] **휴지통** — 삭제 후 30일 복구 가능
- [ ] **내보내기** — TXT/PDF/Markdown 내보내기
- [ ] **오프라인** — IndexedDB 기반 오프라인 저장
- [ ] **AI 요약** — Claude API로 긴 메모 요약
