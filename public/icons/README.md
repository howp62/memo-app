# App Icons

PWA 설치를 위해 다음 아이콘 파일이 필요합니다:

- `icon-192.png` — 192x192px PNG 아이콘
- `icon-512.png` — 512x512px PNG 아이콘

## 빠른 생성 방법

온라인 도구 사용:
1. https://favicon.io 에서 아이콘 생성
2. 또는 Figma/Canva 에서 노란색 배경 + 메모 아이콘으로 디자인

## 임시 아이콘 생성 (Node.js)

```bash
# canvas 패키지로 간단히 생성 가능
npx @pwa-asset-generator/cli ./public/icons/source.svg ./public/icons
```
