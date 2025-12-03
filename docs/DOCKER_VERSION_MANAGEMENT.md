# Docker 버전 관리 가이드

## 개요

Docker 이미지 태그를 `VERSION` 파일로 중앙 관리합니다. 이를 통해 버전 변경이 쉽고 CI/CD 파이프라인에서도 일관되게 사용할 수 있습니다.

## VERSION 파일

프로젝트 루트에 있는 `VERSION` 파일에 현재 Docker 이미지 태그를 저장합니다.

```
VERSION
```

**현재 버전**: `latest`

## 사용 방법

### 1. 현재 버전 확인
```bash
make docker-tag
```

출력 예시:
```
Current Docker tag: latest
Full image name: ghcr.io/udonggeum/udonggeum-frontend:latest
```

### 2. 버전 변경
`VERSION` 파일을 직접 수정합니다:

```bash
# 예시 1: 특정 버전으로 변경
echo "v1.0.0" > VERSION

# 예시 2: 개발 버전
echo "dev" > VERSION

# 예시 3: 날짜 기반 버전
echo "2025-12-03" > VERSION

# 예시 4: Git 커밋 해시 사용
echo "$(git rev-parse --short HEAD)" > VERSION
```

### 3. Docker 이미지 빌드 및 푸시
```bash
# 버전 확인
make docker-tag

# 빌드만
make docker-build

# 빌드 + 푸시
make pushall
```

## 버전 관리 전략

### 1. Semantic Versioning (추천)
```
VERSION 파일 내용:
v1.0.0    # 메이저 릴리스
v1.1.0    # 마이너 업데이트
v1.1.1    # 패치/버그픽스
```

**장점**:
- 명확한 버전 의미 전달
- 롤백 용이
- 프로덕션 배포에 적합

**사용 시점**:
- 프로덕션 릴리스
- 고객 배포
- 안정화 버전

### 2. Git 커밋 해시
```bash
# VERSION 파일 자동 업데이트
git rev-parse --short HEAD > VERSION
make pushall
```

**장점**:
- 정확한 코드 추적 가능
- 자동화 용이

**사용 시점**:
- CI/CD 자동 빌드
- 개발/스테이징 환경

### 3. 날짜 기반
```bash
# 예시
echo "2025-12-03" > VERSION
```

**장점**:
- 배포 시점 추적 용이

**사용 시점**:
- 일일 빌드
- 스냅샷 배포

### 4. 환경별 태그
```
latest       # 최신 안정 버전 (프로덕션)
dev          # 개발 환경
staging      # 스테이징 환경
hotfix       # 긴급 수정
```

## CI/CD 통합 예시

### GitHub Actions
```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set version from file
        run: echo "VERSION=$(cat VERSION)" >> $GITHUB_ENV

      - name: Build and push
        run: make pushall
```

### 태그 기반 자동 버전
```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set version from git tag
        run: echo "${GITHUB_REF#refs/tags/}" > VERSION

      - name: Build and push
        run: make pushall
```

## 멀티 태그 전략

여러 태그를 동시에 푸시하려면:

```bash
# VERSION 파일: v1.2.3

# 1. 버전별 태그
docker build -t ghcr.io/udonggeum/udonggeum-frontend:v1.2.3 .
docker push ghcr.io/udonggeum/udonggeum-frontend:v1.2.3

# 2. latest 태그도 함께 푸시
docker tag ghcr.io/udonggeum/udonggeum-frontend:v1.2.3 ghcr.io/udonggeum/udonggeum-frontend:latest
docker push ghcr.io/udonggeum/udonggeum-frontend:latest
```

**Makefile 확장 예시**:
```makefile
# 버전 + latest 동시 푸시
pushall-multi:
	@echo "Building with version $(DOCKER_TAG) and latest..."
	@docker build -t $(DOCKER_FULL_IMAGE) .
	@docker push $(DOCKER_FULL_IMAGE)
	@docker tag $(DOCKER_FULL_IMAGE) $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):latest
	@docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):latest
	@echo "Pushed $(DOCKER_TAG) and latest!"
```

## 롤백 방법

### 이전 버전으로 롤백
```bash
# 1. VERSION 파일 수정
echo "v1.0.0" > VERSION

# 2. 해당 버전 이미지 pull & 재배포
docker pull ghcr.io/udonggeum/udonggeum-frontend:v1.0.0
docker tag ghcr.io/udonggeum/udonggeum-frontend:v1.0.0 \
           ghcr.io/udonggeum/udonggeum-frontend:latest
docker push ghcr.io/udonggeum/udonggeum-frontend:latest
```

## 베스트 프랙티스

### ✅ DO
- VERSION 파일을 Git에 커밋
- 의미있는 버전명 사용
- 릴리스 전 버전 업데이트
- CI/CD에서 자동으로 VERSION 읽기

### ❌ DON'T
- VERSION 파일을 .gitignore에 추가 (팀원과 공유 필요)
- 하드코딩된 태그명 사용
- 수동으로 docker build 명령 실행 (Makefile 사용)

## 트러블슈팅

### 문제: VERSION 파일이 없다는 에러
```bash
# 해결: VERSION 파일 생성
echo "latest" > VERSION
```

### 문제: 푸시 권한 에러
```bash
# 해결: GitHub Container Registry 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

### 문제: 이전 버전 이미지와 충돌
```bash
# 해결: 기존 이미지 삭제 후 재빌드
make docker-clean
make docker-build
```

## 참고

- [Semantic Versioning](https://semver.org/)
- [Docker Tagging Best Practices](https://docs.docker.com/engine/reference/commandline/tag/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
