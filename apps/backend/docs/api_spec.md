# 엘라마켓 백엔드 API 명세

이 문서는 엘라마켓 백엔드의 API 엔드포인트를 설명하며, 각 엔드포인트의 목적, 요청 형식 및 응답 구조를 상세히 기술합니다.

## 1. 인증 (Auth)

### 1.1. 사용자 회원가입

- **엔드포인트**: `POST /auth/signup`
- **설명**: 이메일과 비밀번호를 사용하여 새로운 사용자를 등록합니다.
- **요청 (입력)**:
  - **헤더**: `Content-Type: application/json`
  - **본문**:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
- **응답 (출력)**:
  - **성공 (201 Created)**:
    ```json
    {
      "message": "사용자가 성공적으로 등록되었습니다.",
      "user": {
        "id": "uuid-of-user",
        "email": "user@example.com"
      }
    }
    ```
  - **오류 (400 Bad Request)**:
    ```json
    {
      "error": "유효하지 않은 입력 데이터입니다."
    }
    ```
  - **오류 (409 Conflict)**:
    ```json
    {
      "error": "해당 이메일을 가진 사용자가 이미 존재합니다."
    }
    ```

### 1.2. 사용자 로그인

- **엔드포인트**: `POST /auth/login`
- **설명**: 사용자를 인증하고 세션 정보(예: JWT 토큰)를 반환합니다.
- **요청 (입력)**:
  - **헤더**: `Content-Type: application/json`
  - **본문**:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "message": "로그인 성공",
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "유효하지 않은 자격 증명입니다."
    }
    ```

### 1.3. 사용자 로그아웃

- **엔드포인트**: `POST /auth/logout`
- **설명**: 현재 사용자를 로그아웃하고 세션을 무효화합니다.
- **요청 (입력)**:
  - **헤더**: `Authorization: Bearer <jwt-access-token>`
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "message": "로그아웃 성공"
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```

### 1.4. 현재 사용자 세션 가져오기

- **엔드포인트**: `GET /auth/session`
- **설명**: 현재 인증된 사용자의 세션 정보를 검색합니다.
- **요청 (입력)**:
  - **헤더**: `Authorization: Bearer <jwt-access-token>`
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "user": {
        "id": "uuid-of-user",
        "email": "user@example.com",
        "username": "user_name",
        "membership_tier": "Topaz",
        "is_subscribed": true
      }
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```

## 2. 상품

### 2.1. 모든 상품 가져오기

- **엔드포인트**: `GET /products`
- **설명**: 모든 상품 목록을 검색합니다. 페이지네이션, 필터링, 정렬을 지원합니다.
- **요청 (입력)**:
  - **쿼리 파라미터**:
    - `page` (선택 사항, 정수): 페이지 번호 (기본값: 1)
    - `limit` (선택 사항, 정수): 페이지당 항목 수 (기본값: 10)
    - `category` (선택 사항, 문자열): 상품 카테고리로 필터링
    - `search` (선택 사항, 문자열): 상품명으로 검색
    - `sort_by` (선택 사항, 문자열): 정렬 기준 필드 (예: `price`, `created_at`)
    - `order` (선택 사항, 문자열): 정렬 순서 (`asc` 또는 `desc`, 기본값: `asc`)
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "products": [
        {
          "id": 1,
          "name": "상품 A",
          "description": "상품 A에 대한 설명",
          "image_url": "http://example.com/productA.jpg",
          "price": 10000,
          "stock_quantity": 50,
          "category": "전자제품",
          "created_at": "2025-07-20T10:00:00Z"
        },
        {
          "id": 2,
          "name": "상품 B",
          "description": "상품 B에 대한 설명",
          "image_url": "http://example.com/productB.jpg",
          "price": 25000,
          "stock_quantity": 20,
          "category": "생활용품",
          "created_at": "2025-07-19T15:30:00Z"
        }
      ],
      "pagination": {
        "total_items": 100,
        "total_pages": 10,
        "current_page": 1,
        "page_size": 10
      }
    }
    ```

### 2.2. ID로 상품 상세 정보 가져오기

- **엔드포인트**: `GET /products/:id`
- **설명**: ID를 통해 특정 상품의 상세 정보를 검색합니다.
- **요청 (입력)**:
  - **경로 파라미터**:
    - `id` (정수): 상품 ID
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "id": 1,
      "name": "상품 A",
      "description": "상품 A에 대한 설명",
      "image_url": "http://example.com/productA.jpg",
      "price": 10000,
      "stock_quantity": 50,
      "category": "전자제품",
      "created_at": "2025-07-20T10:00:00Z"
    }
    ```
  - **오류 (404 Not Found)**:
    ```json
    {
      "error": "상품을 찾을 수 없습니다."
    }
    ```

## 3. 주문

### 3.1. 새 주문 생성

- **엔드포인트**: `POST /orders`
- **설명**: 사용자의 장바구니 내용과 선택된 주소를 기반으로 새 주문을 생성합니다.
- **요청 (입력)**:
  - **헤더**: `Content-Type: application/json`, `Authorization: Bearer <jwt-access-token>`
  - **본문**:
    ```json
    {
      "address_id": 123,
      "items": [
        {
          "product_id": 1,
          "quantity": 2
        },
        {
          "product_id": 2,
          "quantity": 1
        }
      ],
      "shared_link_id": null // 선택 사항: 주문이 공유 링크에서 시작된 경우
    }
    ```
- **응답 (출력)**:
  - **성공 (201 Created)**:
    ```json
    {
      "message": "주문이 성공적으로 생성되었습니다.",
      "order": {
        "id": 101,
        "user_id": "uuid-of-user",
        "address_id": 123,
        "total_price": 45000,
        "discount_amount": 0,
        "shipping_fee": 3000,
        "final_price": 48000,
        "earned_points": 0,
        "status": "pending",
        "created_at": "2025-07-20T11:00:00Z"
      }
    }
    ```
  - **오류 (400 Bad Request)**:
    ```json
    {
      "error": "유효하지 않은 입력 또는 재고 부족"
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```

### 3.2. 사용자 주문 가져오기

- **엔드포인트**: `GET /orders`
- **설명**: 인증된 사용자가 주문한 목록을 검색합니다.
- **요청 (입력)**:
  - **헤더**: `Authorization: Bearer <jwt-access-token>`
  - **쿼리 파라미터**:
    - `status` (선택 사항, 문자열): 주문 상태로 필터링 (예: `pending`, `shipped`)
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "orders": [
        {
          "id": 101,
          "user_id": "uuid-of-user",
          "address_id": 123,
          "total_price": 45000,
          "discount_amount": 0,
          "shipping_fee": 3000,
          "final_price": 48000,
          "earned_points": 0,
          "status": "pending",
          "created_at": "2025-07-20T11:00:00Z",
          "order_items": [
            {
              "product_id": 1,
              "quantity": 2,
              "price_per_item": 10000
            },
            {
              "product_id": 2,
              "quantity": 1,
              "price_per_item": 25000
            }
          ]
        }
      ]
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```

### 3.3. ID로 주문 상세 정보 가져오기

- **엔드포인트**: `GET /orders/:id`
- **설명**: ID를 통해 특정 주문의 상세 정보를 검색합니다.
- **요청 (입력)**:
  - **헤더**: `Authorization: Bearer <jwt-access-token>`
  - **경로 파라미터**:
    - `id` (정수): 주문 ID
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "id": 101,
      "user_id": "uuid-of-user",
      "address_id": 123,
      "total_price": 45000,
      "discount_amount": 0,
      "shipping_fee": 3000,
      "final_price": 48000,
      "earned_points": 0,
      "status": "pending",
      "created_at": "2025-07-20T11:00:00Z",
      "order_items": [
        {
          "product_id": 1,
          "quantity": 2,
          "price_per_item": 10000
        },
        {
          "product_id": 2,
          "quantity": 1,
          "price_per_item": 25000
        }
      ]
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```
  - **오류 (404 Not Found)**:
    ```json
    {
      "error": "주문을 찾을 수 없거나 접근할 수 없습니다."
    }
    ```

## 4. 장바구니 (클라이언트 측 관리 권장)

**참고**: 단순성과 일반적인 전자상거래 패턴을 위해 장바구니 관리는 종종 클라이언트 측(예: 로컬 스토리지 또는 상태 관리 라이브러리 사용)에서 처리됩니다. 이 엔드포인트는 서버 측 장바구니 영속성이 필요한 경우 옵션으로 제공됩니다.

### 4.1. 장바구니 내용 가져오기

- **엔드포인트**: `GET /cart`
- **설명**: 현재 사용자의 장바구니 내용을 검색합니다.
- **요청 (입력)**:
  - **헤더**: `Authorization: Bearer <jwt-access-token>`
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "cart_items": [
        {
          "product_id": 1,
          "quantity": 2,
          "product_name": "상품 A",
          "price_per_item": 10000
        }
      ]
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```

### 4.2. 장바구니에 항목 추가

- **엔드포인트**: `POST /cart/add`
- **설명**: 사용자의 장바구니에 상품을 추가합니다.
- **요청 (입력)**:
  - **헤더**: `Content-Type: application/json`, `Authorization: Bearer <jwt-access-token>`
  - **본문**:
    ```json
    {
      "product_id": 1,
      "quantity": 1
    }
    ```
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "message": "장바구니에 항목이 성공적으로 추가되었습니다.",
      "cart_item": {
        "product_id": 1,
        "quantity": 3
      }
    }
    ```
  - **오류 (400 Bad Request)**:
    ```json
    {
      "error": "유효하지 않은 입력 또는 재고 부족"
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```

### 4.3. 장바구니 항목 수량 업데이트

- **엔드포인트**: `POST /cart/update`
- **설명**: 사용자의 장바구니에 있는 상품의 수량을 업데이트합니다.
- **요청 (입력)**:
  - **헤더**: `Content-Type: application/json`, `Authorization: Bearer <jwt-access-token>`
  - **본문**:
    ```json
    {
      "product_id": 1,
      "quantity": 5
    }
    ```
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "message": "장바구니 항목 수량이 성공적으로 업데이트되었습니다.",
      "cart_item": {
        "product_id": 1,
        "quantity": 5
      }
    }
    ```
  - **오류 (400 Bad Request)**:
    ```json
    {
      "error": "유효하지 않은 입력 또는 재고 부족"
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```
  - **오류 (404 Not Found)**:
    ```json
    {
      "error": "장바구니에서 상품을 찾을 수 없습니다."
    }
    ```

### 4.4. 장바구니에서 항목 제거

- **엔드포인트**: `POST /cart/remove`
- **설명**: 사용자의 장바구니에서 상품을 제거합니다.
- **요청 (입력)**:
  - **헤더**: `Content-Type: application/json`, `Authorization: Bearer <jwt-access-token>`
  - **본문**:
    ```json
    {
      "product_id": 1
    }
    ```
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "message": "장바구니에서 항목이 성공적으로 제거되었습니다."
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```
  - **오류 (404 Not Found)**:
    ```json
    {
      "error": "장바구니에서 상품을 찾을 수 없습니다."
    }
    ```

## 5. 공유 링크

### 5.1. 새 공유 링크 생성

- **엔드포인트**: `POST /shared-links`
- **설명**: 상품에 대한 고유한 공유 가능 링크를 생성합니다.
- **요청 (입력)**:
  - **헤더**: `Content-Type: application/json`, `Authorization: Bearer <jwt-access-token>`
  - **본문**:
    ```json
    {
      "product_id": 1
    }
    ```
- **응답 (출력)**:
  - **성공 (201 Created)**:
    ```json
    {
      "message": "공유 링크가 성공적으로 생성되었습니다.",
      "shared_link": {
        "id": 501,
        "sharer_id": "uuid-of-sharer",
        "product_id": 1,
        "unique_token": "generated-unique-token",
        "url": "http://ellamarket.com/share/generated-unique-token"
      }
    }
    ```
  - **오류 (400 Bad Request)**:
    ```json
    {
      "error": "유효하지 않은 상품 ID입니다."
    }
    ```
  - **오류 (401 Unauthorized)**:
    ```json
    {
      "error": "인증되지 않았습니다."
    }
    ```

### 5.2. 공유 링크를 통해 상품 상세 정보 가져오기

- **엔드포인트**: `GET /shared-links/:token`
- **설명**: 고유한 공유 링크 토큰을 사용하여 상품 상세 정보를 검색합니다. 이 엔드포인트는 공개적으로 접근 가능합니다.
- **요청 (입력)**:
  - **경로 파라미터**:
    - `token` (문자열): 공유 링크의 고유 토큰
- **응답 (출력)**:
  - **성공 (200 OK)**:
    ```json
    {
      "product": {
        "id": 1,
        "name": "상품 A",
        "description": "상품 A에 대한 설명",
        "image_url": "http://example.com/productA.jpg",
        "price": 10000,
        "stock_quantity": 50,
        "category": "전자제품",
        "created_at": "2025-07-20T10:00:00Z"
      },
      "sharer_info": {
        "sharer_id": "uuid-of-sharer",
        "username": "sharer_username"
      }
    }
    ```
  - **오류 (404 Not Found)**:
    ```json
    {
      "error": "공유 링크를 찾을 수 없거나 유효하지 않습니다."
    }
    ```