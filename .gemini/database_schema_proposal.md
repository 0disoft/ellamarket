# 데이터베이스 스키마 제안 (v1.3)

## 1. 개요

엘라마켓의 핵심 기능에 더해, 멤버십, 구독, 배송, 포인트 정책 등 상세 비즈니스 로직을 지원하기 위해 스키마를 업데이트했습니다.

## 2. 테이블 상세

### 가. `users` (Supabase Auth 연동)

- Supabase의 내장 `auth.users` 테이블을 그대로 활용합니다.

### 나. `profiles`

- 사용자의 추가 정보 및 멤버십/구독 상태를 저장합니다. `points` 컬럼은 `point_history`를 통해 계산되므로 제거되었습니다.

| 컬럼명             | 데이터 타입                     | 제약 조건                                       | 비고                               |
| ------------------ | ------------------------------- | ----------------------------------------------- | ---------------------------------- |
| `user_id`          | `UUID`                          | `PK`, `FK` (references `auth.users.id`)         |                                    |
| `username`         | `text`                          |                                                 |                                    |
| `avatar_url`       | `text`                          | `nullable`                                      |                                    |
| `invite_code`      | `text`                          | `unique`                                        |                                    |
| `membership_tier`  | `text`                          | `FK` (references `membership_tiers.tier_name`)  | `nullable`, 기본값 없음            |
| `is_subscribed`    | `boolean`                       | `default: false`                                | 월간 구독 여부                     |
| `subscription_start_date` | `timestamp with time zone` | `nullable`                                      | 구독 시작일                        |

### 다. `membership_tiers`

- 멤버십 등급별 혜택 정보를 관리합니다. (v1.2와 동일)

| 컬럼명         | 데이터 타입 | 제약 조건 | 비고 (예시)        |
| --------------- | ----------- | --------- | ------------------ |
| `tier_name`     | `text`      | `PK`      | 'Topaz', 'Emerald', 'Diamond' |
| `min_purchase`  | `integer`   |           | 100000, 200000, 300000 |
| `discount_rate` | `numeric`   |           | 0.03, 0.06, 0.09   |

### 라. `subscriptions`

- 구독 상품 정보를 관리합니다. (v1.2와 동일)

| 컬럼명                   | 데이터 타입 | 제약 조건 | 비고 (예시) |
| ------------------------- | ----------- | --------- | ----------- |
| `id`                      | `integer`   | `PK`      | 1           |
| `name`                    | `text`      |           | '월간 구독' |
| `price`                   | `integer`   |           | 7700        |
| `point_accumulation_rate` | `numeric`   |           | 0.04        |

### 마. `products`

- 판매할 상품 정보를 관리합니다. (v1.2와 동일)

| 컬럼명           | 데이터 타입                     | 제약 조건              |
| ---------------- | ------------------------------- | ---------------------- |
| `id`             | `bigint`                        | `PK`, `auto-increment` |
| `name`           | `text`                          |                        |
| `description`    | `text`                          |                        |
| `image_url`      | `text`                          |                        |
| `price`          | `integer`                       |                        |
| `stock_quantity` | `integer`                       |                        |
| `category`       | `text`                          |                        |
| `created_at`     | `timestamp with time zone`      |                        |

### 바. `orders`

- 사용자의 주문 정보를 관리합니다. 배송 및 구매 확정 관련 컬럼이 추가되었습니다.

| 컬럼명             | 데이터 타입                     | 제약 조건                                  | 비고                               |
| ------------------ | ------------------------------- | ------------------------------------------ | ---------------------------------- |
| `id`               | `bigint`                        | `PK`, `auto-increment`                     |                                    |
| `user_id`          | `UUID`                          | `FK` (references `auth.users.id`)          |                                    |
| `total_price`      | `integer`                       |                                            | 할인 적용 전 총액                  |
| `discount_amount`  | `integer`                       | `default: 0`                               | 등급 할인 금액                     |
| `shipping_fee`     | `integer`                       | `default: 3000`                            | 배송비 (기본 3000원)               |
| `final_price`      | `integer`                       |                                            | 최종 결제 금액 (배송비 포함)       |
| `earned_points`    | `integer`                       | `default: 0`                               | 적립 예정 포인트 (확정 시 지급)    |
| `status`           | `text`                          | (e.g., 'pending', 'paid', 'shipped', 'delivered', 'confirmed', 'cancelled') | 주문 상태                          |
| `shipping_company` | `text`                          | `nullable`                                 | 택배사 (관리자 입력)               |
| `tracking_number`  | `text`                          | `nullable`                                 | 송장 번호 (관리자 입력)            |
| `created_at`       | `timestamp with time zone`      |                                            | 주문 생성일                        |
| `shipped_at`       | `timestamp with time zone`      | `nullable`                                 | 배송 시작일                        |
| `confirmed_at`     | `timestamp with time zone`      | `nullable`                                 | 구매 확정일                        |

### 사. `order_items`

- 각 주문에 포함된 상품들의 상세 내역입니다. (v1.2와 동일)

| 컬럼명           | 데이터 타입 | 제약 조건                                  |
| ---------------- | ----------- | ------------------------------------------ |
| `order_id`       | `bigint`    | `PK`, `FK` (references `orders.id`)        |
| `product_id`     | `bigint`    | `PK`, `FK` (references `products.id`)      |
| `quantity`       | `integer`   |                                            |
| `price_per_item` | `integer`   |                                            |

### 아. `point_history`

- 사용자의 포인트 적립/사용 내역 및 유효기간을 관리합니다.

| 컬럼명         | 데이터 타입                | 제약 조건                               | 비고                                               |
| --------------- | -------------------------- | --------------------------------------- | -------------------------------------------------- |
| `id`            | `bigint`                   | `PK`, `auto-increment`                  |                                                    |
| `user_id`       | `UUID`                     | `FK` (references `auth.users.id`)       |                                                    |
| `order_id`      | `bigint`                   | `FK` (references `orders.id`), `nullable` | 어떤 주문으로 인해 발생한 포인트인지 추적        |
| `points_change` | `integer`                  |                                         | 포인트 변동량 (적립: 양수, 사용: 음수)           |
| `reason`        | `text`                     |                                         | 변동 사유 (e.g., '주문 적립', '이벤트', '사용') |
| `created_at`    | `timestamp with time zone` |                                         | 포인트 변동 발생일                               |
| `expires_at`    | `timestamp with time zone` | `nullable`                              | 소멸 예정일 (적립 발생일 + 6개월)                  |

## 3. 로직 설명

*   **등급 산정**: 매일 자정(또는 특정 주기)에 `orders` 테이블에서 각 사용자의 최근 3개월 구매액을 집계하여 `profiles.membership_tier`를 업데이트합니다.
*   **구독 관리**: 사용자가 구독 결제 시 `profiles`의 `is_subscribed`를 `true`로, `subscription_start_date`를 기록합니다.
*   **결제 시 혜택 적용**:
    1.  **등급 할인**: `profiles.membership_tier`에 따라 할인율을 적용하여 `orders.discount_amount`를 계산합니다.
    2.  **배송비**: `profiles.is_subscribed`가 `true`이면 `orders.shipping_fee`를 0으로 설정합니다.
    3.  **포인트 적립(예정)**: `profiles.is_subscribed`가 `true`이면, `subscriptions`의 적립률에 따라 `orders.earned_points`에 적립될 포인트를 기록합니다.
*   **배송 관리 (관리자)**:
    1.  관리자는 주문 상태를 `shipped`로 변경하고, `orders` 테이블에 `shipping_company`와 `tracking_number`를 입력합니다. 동시에 `shipped_at` 타임스탬프를 기록합니다.
*   **구매 확정 및 포인트 지급**:
    1.  **자동 확정**: 주문 상태가 `delivered`(배송 완료)가 되고 3일이 지나면, 시스템은 자동으로 상태를 `confirmed`로 변경합니다.
    2.  **수동 확정**: 사용자가 직접 '구매 확정' 버튼을 누르면 상태가 `confirmed`로 변경됩니다.
    3.  **포인트 지급**: 주문 상태가 `confirmed`로 변경되는 시점에, `orders.earned_points`에 기록된 값을 `point_history` 테이블에 새로 추가합니다. 이때 `expires_at`은 생성일로부터 6개월 뒤로 설정합니다.
*   **포인트 소멸**: 매일 자정(또는 특정 주기)에 `point_history` 테이블에서 `expires_at`이 지난 포인트를 찾아 비활성화 처리하는 스케줄링 작업을 실행합니다.
*   **배송 조회 (사용자)**: 사용자는 `orders` 테이블의 `shipping_company`와 `tracking_number` 정보를 이용해 외부 택배사 API와 연동하여 배송 상태를 조회할 수 있습니다.

---

**위 스키마에 대한 피드백을 부탁드립니다. 이 설계안을 기반으로 실제 데이터베이스 마이그레이션을 진행해도 될까요?**
