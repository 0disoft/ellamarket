## 작업 요약

- **작업:** 데이터베이스 스키마 제안(v1.3) 업데이트
- **상태:** 완료
- **날짜:** 2025년 7월 19일

## 상세 내용

사용자 피드백을 바탕으로 `database_schema_proposal.md` 파일을 v1.3으로 업데이트했습니다. 주요 변경 사항은 다음과 같습니다.

1.  **멤버십 및 구독 제도 반영**:
    -   3단계 등급제(토파즈, 에메랄드, 다이아몬드) 및 월간 구독 모델을 스키마에 통합했습니다.
    -   `membership_tiers`, `subscriptions` 테이블을 추가하여 관련 정책을 관리합니다.

2.  **배송 및 주문 관리 강화**:
    -   `orders` 테이블에 `shipping_fee`, `shipping_company`, `tracking_number` 등 배송 관련 컬럼을 추가했습니다.
    -   주문 상태에 `delivered`, `confirmed`를 추가하여 구매 확정 프로세스를 지원합니다.

3.  **포인트 시스템 구체화**:
    -   포인트 적립, 사용, 소멸(6개월 유효기간)을 관리하기 위한 `point_history` 테이블을 신설했습니다.
    -   구매 확정 시점에 포인트가 적립되는 로직을 명시했습니다.

## 영향을 받는 파일

- `c:\Users\zerodi\Documents\workspace\ellamarket\.gemini\database_schema_proposal.md`
