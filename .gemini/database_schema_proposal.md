# 데이터베이스 스키마 제안 (v1.5)

## 1. 개요

사용자 피드백을 반영하여 아바타 및 추천인 관련 기능을 제거하고, **상품 URL 공유를 통한 리워드 시스템**을 중심으로 스키마를 재구성했습니다.

## 2. 테이블 상세

### `users` (Supabase Auth 연동)

- Supabase의 내장 `auth.users` 테이블을 그대로 활용합니다.

### `profiles`

- 사용자의 추가 정보 및 멤버십/구독 상태를 저장합니다. **`avatar_url`, `recommended_by` 컬럼이 제거되었습니다.**

| 컬럼명             | 데이터 타입                     | 제약 조건                                                 | 비고                    |
| ------------------ | ------------------------------- | --------------------------------------------------------- | ----------------------- |
| `user_id`          | `UUID`                          | `PK`, `FK` (references `auth.users.id` ON DELETE CASCADE) |                         |
| `username`         | `text`                          |                                                           |                         |
| `invite_code`      | `text`                          | `unique`                                                  | 초대 코드 (향후 확장용) |
| `membership_tier`  | `text`                          | `FK` (references `membership_tiers.tier_name`)            | `nullable`, 기본값 없음 |
| `is_subscribed`    | `boolean`                       | `default: false`                                          | 월간 구독 여부          |
| `subscription_start_date` | `timestamp with time zone` | `nullable`                                                | 구독 시작일             |

### `shared_links` (신규)

- **사용자가 생성한 상품 공유 링크 정보를 관리하고, 리워드 지급을 추적합니다.**

| 컬럼명        | 데이터 타입                | 제약 조건                                           | 비고                                     |
| -------------- | -------------------------- | --------------------------------------------------- | ---------------------------------------- |
| `id`           | `bigint`                   | `PK`, `auto-increment`                              |                                          |
| `sharer_id`    | `UUID`                     | `FK` (references `auth.users.id` ON DELETE CASCADE) | 링크를 생성한(공유한) 사용자             |
| `product_id`   | `bigint`                   | `FK` (references `products.id` ON DELETE CASCADE)   | 공유된 상품                              |
| `unique_token` | `text`                     | `unique`                                            | 공유 URL에 사용될 고유 식별자 (e.g., short URL) |
| `created_at`   | `timestamp with time zone` | `default: now()`                                    |                                          |

### `addresses`

- 사용자가 여러 배송지를 저장하고 관리할 수 있도록 지원합니다. (v1.4와 동일)

| 컬럼명           | 데이터 타입 | 제약 조건                                                 | 비고               |
| ---------------- | ----------- | --------------------------------------------------------- | ------------------ |
| `id`             | `bigint`    | `PK`, `auto-increment`                                    |                    |
| `user_id`        | `UUID`      | `FK` (references `auth.users.id` ON DELETE CASCADE)       |                    |
| `recipient_name` | `text`      |                                                           | 수령인 이름        |
| `recipient_phone`| `text`      |                                                           | 수령인 연락처      |
| `address`        | `text`      |                                                           | 전체 주소          |
| `is_default`     | `boolean`   | `default: false`                                          | 기본 배송지 여부   |
| `created_at`     | `timestamp with time zone` | `default: now()`                                          |                    |

### `membership_tiers`

- 멤버십 등급별 혜택 정보를 관리합니다. (v1.2와 동일)

| 컬럼명         | 데이터 타입 | 제약 조건 | 비고 (예시)        |
| --------------- | ----------- | --------- | ------------------ |
| `tier_name`     | `text`      | `PK`      | 'Topaz', 'Emerald', 'Diamond' |
| `min_purchase`  | `integer`   |           | 100000, 200000, 300000 |
| `discount_rate` | `numeric`   |           | 0.03, 0.06, 0.09   |

### `subscriptions`

- 구독 상품 정보를 관리합니다. (v1.2와 동일)

| 컬럼명                   | 데이터 타입 | 제약 조건 | 비고 (예시) |
| ------------------------- | ----------- | --------- | ----------- |
| `id`                      | `integer`   | `PK`      | 1           |
| `name`                    | `text`      |           | '월간 구독' |
| `price`                   | `integer`   |           | 7700        |
| `point_accumulation_rate` | `numeric`   |           | 0.04        |

### `products`

- 판매할 상품 정보를 관리합니다. (v1.2와 동일)

| 컬럼명           | 데이터 타입                     | 제약 조건              |
| ---------------- | ------------------------------- | ---------------------- |
| `id`             | `bigint`                        | `PK`, `auto-increment` |
| `name`           | `text`                          |                        |
| `description`    | `text`                          |                        | 마크다운 형식 (이미지, 텍스트 혼합 가능) |
| `image_url`      | `text[]`                        |                        |
| `price`          | `integer`                       |                        |
| `stock_quantity` | `integer`                       |                        |
| `category`       | `text`                          |                        |
| `created_at`     | `timestamp with time zone`      |                        |

### 바. `orders`

- **어떤 공유 링크를 통해 주문이 발생했는지 추적하기 위해 `shared_link_id` 컬럼이 추가되었습니다.**

| 컬럼명             | 데이터 타입                     | 제약 조건                                       | 비고                               |
| ------------------ | ------------------------------- | ----------------------------------------------- | ---------------------------------- |
| `id`               | `bigint`                        | `PK`, `auto-increment`                          |                                    |
| `user_id`          | `UUID`                          | `FK` (references `auth.users.id`)               |                                    |
| `address_id`       | `bigint`                        | `FK` (references `addresses.id`)                | 배송받을 주소 ID                   |
| `shared_link_id`   | `bigint`                        | `nullable`, `FK` (references `shared_links.id`) | 주문을 발생시킨 공유 링크 ID       |
| `total_price`      | `integer`                       |                                                 | 할인 적용 전 총액                  |
| `discount_amount`  | `integer`                       | `default: 0`                                    | 등급 할인 금액                     |
| `shipping_fee`     | `integer`                       | `default: 3000`                                 | 배송비 (기본 3000원)               |
| `final_price`      | `integer`                       |                                                 | 최종 결제 금액 (배송비 포함)       |
| `earned_points`    | `integer`                       | `default: 0`                                    | 적립 예정 포인트 (확정 시 지급)    |
| `status`           | `order_status_enum`             | (e.g., 'pending', 'paid', 'shipped', 'delivered', 'confirmed', 'cancelled') | 주문 상태 (ENUM 타입 권장)         |
| `shipping_company` | `text`                          | `nullable`                                      | 택배사 (관리자 입력)               |
| `tracking_number`  | `text`                          | `nullable`                                      | 송장 번호 (관리자 입력)            |
| `created_at`       | `timestamp with time zone`      |                                                 | 주문 생성일                        |
| `shipped_at`       | `timestamp with time zone`      | `nullable`                                      | 배송 시작일                        |
| `confirmed_at`     | `timestamp with time zone`      | `nullable`                                      | 구매 확정일                        |

### `order_items`

- 각 주문에 포함된 상품들의 상세 내역입니다.

| 컬럼명           | 데이터 타입 | 제약 조건                                  |
| ---------------- | ----------- | ------------------------------------------ |
| `order_id`       | `bigint`    | `PK`, `FK` (references `orders.id`)        |
| `product_id`     | `bigint`    | `PK`, `FK` (references `products.id`)      |
| `quantity`       | `integer`   |                                            |
| `price_per_item` | `integer`   |  |

### `point_history`

- `reason`의 예시에 **'공유 리워드'**가 추가되었습니다.

| 컬럼명         | 데이터 타입                | 제약 조건                               | 비고                                               |
| --------------- | -------------------------- | --------------------------------------- | -------------------------------------------------- |
| `id`            | `bigint`                   | `PK`, `auto-increment`                  |                                                    |
| `user_id`       | `UUID`                     | `FK` (references `auth.users.id`)       |                                                    |
| `order_id`      | `bigint`                   | `FK` (references `orders.id`), `nullable` | 어떤 주문으로 인해 발생한 포인트인지 추적        |
| `points_change` | `integer`                  |                                         | 포인트 변동량 (적립: 양수, 사용: 음수)           |
| `reason`        | `text`                     |                                         | 변동 사유 (e.g., '주문 적립', '공유 리워드', '이벤트', '사용') |
| `created_at`    | `timestamp with time zone` |                                         | 포인트 변동 발생일                               |
| `expires_at`    | `timestamp with time zone` | `nullable`                              | 소멸 예정일 (적립 발생일 + 6개월)                  |

## 3. 로직 설명

- **상품 공유**:
  1. 로그인한 사용자가 상품 페이지에서 '공유하기' 버튼을 누릅니다.
  2. 시스템은 `shared_links` 테이블에 `sharer_id`(현재 사용자)와 `product_id`를 저장하고, `unique_token`을 생성하여 새로운 레코드를 만듭니다.
  3. 이 `unique_token`이 포함된 고유 URL(e.g., `ellamarket.com/share/{unique_token}`)을 사용자에게 제공합니다.
- **공유 링크를 통한 주문**:
  1. 다른 사용자가 이 고유 URL로 접속하여 상품을 구매하면, 주문 정보가 생성될 때 `orders.shared_link_id`에 해당 `shared_links` 레코드의 `id`가 기록됩니다.
- **구매 확정 및 포인트 지급**:
  1. **자동/수동 확정**: 주문 상태가 `delivered` 후 3일이 지나거나 사용자가 직접 확정하면 `confirmed`로 변경됩니다.
  2. **주문 포인트 지급**: 주문 상태가 `confirmed`로 변경되면, 구매자에게 `orders.earned_points`에 기록된 값을 `point_history`에 '주문 적립' 사유로 추가합니다.
  3. **공유 리워드 포인트 지급**: **(핵심 로직)** 주문 상태가 `confirmed`로 변경되고, 해당 주문의 `orders.shared_link_id`가 존재할 경우, 시스템은 다음을 수행합니다.
     - `shared_links` 테이블에서 `sharer_id` (링크 공유자)를 찾습니다.
     - 해당 주문의 `final_price` (최종 결제 금액)의 4%를 계산합니다.
     - 계산된 포인트를 `sharer_id`에게 `point_history`를 통해 '공유 리워드' 사유로 지급합니다.
- **기타 로직**: 배송지 관리, 등급 산정, 구독, 포인트 소멸 등의 로직은 이전 버전과 동일하게 유지됩니다.

---

**위 스키마에 대한 피드백을 부탁드립니다. 이 설계안은 '상품 URL 공유 리워드' 기능을 중심으로 비즈니스 요구사항을 명확히 반영하고 있습니다.**
