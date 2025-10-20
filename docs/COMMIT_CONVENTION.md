# Commit Convention

## 형식

```
[TYPE] 간결한 설명 (50자 이내, 영어로)

선택사항:
- 상세 설명 (72자마다 줄바꿈, 한글로)
- Breaking Change: 설명
```

## TYPE 종류

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- **refactor**: 코드 리팩토링 (기능 변경 없음)
- **test**: 테스트 코드 추가 또는 수정
- **chore**: 빌드 설정, 패키지 매니저 설정 등

## 예시

```
[feat] add user authentication

사용자 로그인 및 회원가입 기능을 추가했습니다.
JWT 토큰 기반 인증을 사용합니다.
```

```
[fix] resolve memory leak in event listener

이벤트 리스너가 제거되지 않아 발생하던 메모리 누수 문제를 수정했습니다.
```