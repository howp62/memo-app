-- =============================================
-- 메모 앱 Supabase 스키마
-- Supabase SQL Editor 에서 순서대로 실행하세요
-- =============================================

-- 1. notes 테이블
create table public.notes (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null default '',
  content     text        not null default '',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- 2. attachments 테이블
create table public.attachments (
  id          uuid        default gen_random_uuid() primary key,
  note_id     uuid        references public.notes(id) on delete cascade not null,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  file_url    text        not null,
  file_name   text        not null,
  file_size   bigint,
  file_type   text,
  created_at  timestamptz default now() not null
);

-- 3. 인덱스 (검색 성능 향상)
create index notes_user_id_updated_at_idx on public.notes(user_id, updated_at desc);
create index attachments_note_id_idx on public.attachments(note_id);

-- 4. RLS (Row Level Security) 활성화
alter table public.notes       enable row level security;
alter table public.attachments enable row level security;

-- 5. RLS 정책 — notes
create policy "사용자는 자신의 메모만 조회 가능" on public.notes
  for select using (auth.uid() = user_id);

create policy "사용자는 자신의 메모만 생성 가능" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "사용자는 자신의 메모만 수정 가능" on public.notes
  for update using (auth.uid() = user_id);

create policy "사용자는 자신의 메모만 삭제 가능" on public.notes
  for delete using (auth.uid() = user_id);

-- 6. RLS 정책 — attachments
create policy "사용자는 자신의 첨부파일만 조회 가능" on public.attachments
  for select using (auth.uid() = user_id);

create policy "사용자는 자신의 첨부파일만 생성 가능" on public.attachments
  for insert with check (auth.uid() = user_id);

create policy "사용자는 자신의 첨부파일만 삭제 가능" on public.attachments
  for delete using (auth.uid() = user_id);

-- 7. updated_at 자동 갱신 트리거
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

-- 8. Realtime 활성화 (Supabase 대시보드에서도 가능)
-- Database > Replication > supabase_realtime 에서 notes 테이블 활성화
alter publication supabase_realtime add table public.notes;

-- =============================================
-- Storage 설정 (아래 SQL을 별도로 실행)
-- =============================================

-- 9. Storage 버킷 생성 (public = 공개 접근 허용)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
        'text/plain', 'application/zip',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 10. Storage RLS 정책
create policy "사용자는 자신의 폴더에만 업로드 가능" on storage.objects
  for insert with check (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "사용자는 자신의 파일만 조회 가능" on storage.objects
  for select using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "사용자는 자신의 파일만 삭제 가능" on storage.objects
  for delete using (
    bucket_id = 'attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- 샘플 데이터 (선택사항 — 테스트용)
-- auth.users 에 실제 유저가 있어야 동작합니다
-- =============================================

-- insert into public.notes (user_id, title, content)
-- values
--   ('your-user-uuid', '첫 번째 메모', '안녕하세요! 메모 앱에 오신 것을 환영합니다.'),
--   ('your-user-uuid', '장보기 목록', '우유\n계란\n빵\n사과'),
--   ('your-user-uuid', '아이디어 노트', '새로운 프로젝트 아이디어:\n- 기능 1: 태그 추가\n- 기능 2: 폴더 구조\n- 기능 3: 공유 기능');
