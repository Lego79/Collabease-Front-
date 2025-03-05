// src/types/MemberTokenPayload.ts
export interface MemberTokenPayload {
  memberId: string;    // UUID 형태
  nickname: string;
  // 만약 JWT에 iat, exp 같은 필드가 있다면 여기에 선언
  iat?: number;
  exp?: number;
}
