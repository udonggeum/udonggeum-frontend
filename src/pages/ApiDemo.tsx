// 1. Imports (외부 → 내부 순서)
import { useState, useEffect } from 'react';
import axios, { type AxiosResponse } from 'axios';
import { apiClient } from '@/api/client';
import { API_BASE_URL } from '@/constants/api';

// 2. Types/Interfaces

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiResponse {
  status: number;
  statusText: string;
  data: unknown;
  headers: Record<string, string>;
  duration: number;
}

// 3. Component
export default function ApiDemo() {
  // 상태 선언
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [endpoint, setEndpoint] = useState<string>('/');
  const [requestBody, setRequestBody] = useState<string>('{\n  \n}');
  const [customHeaders, setCustomHeaders] = useState<string>('{}');
  const [bearerToken, setBearerToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Bearer token을 customHeaders에 자동 동기화
  useEffect(() => {
    if (bearerToken.trim()) {
      try {
        // 기존 헤더 파싱
        const existingHeaders = customHeaders.trim()
          ? (JSON.parse(customHeaders) as Record<string, string>)
          : {};

        // Authorization 헤더 추가/업데이트
        const updatedHeaders = {
          ...existingHeaders,
          Authorization: `Bearer ${bearerToken.trim()}`,
        };

        setCustomHeaders(JSON.stringify(updatedHeaders, null, 2));
      } catch {
        // JSON 파싱 실패시 새로운 헤더로 덮어쓰기
        setCustomHeaders(
          JSON.stringify({ Authorization: `Bearer ${bearerToken.trim()}` }, null, 2)
        );
      }
    } else {
      // Bearer token이 비어있으면 Authorization 헤더 제거
      try {
        const existingHeaders = customHeaders.trim()
          ? (JSON.parse(customHeaders) as Record<string, string>)
          : {};

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Authorization, ...rest } = existingHeaders as { Authorization?: string; [key: string]: string | undefined };

        setCustomHeaders(
          Object.keys(rest).length > 0 ? JSON.stringify(rest, null, 2) : '{}'
        );
      } catch {
        // 파싱 실패시 빈 객체로 설정
        setCustomHeaders('{}');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bearerToken]);

  // 핸들러
  const handleSendRequest = async () => {
    // 1️⃣ [입력 검증]
    if (!endpoint.trim()) {
      setError('엔드포인트를 입력해주세요.');
      return;
    }

    // 2️⃣ [초기화]
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      // 3️⃣ [헤더 파싱]
      let headers: Record<string, string> = {};
      if (customHeaders.trim()) {
        try {
          headers = JSON.parse(customHeaders) as Record<string, string>;
        } catch {
          throw new Error('헤더 JSON 형식이 올바르지 않습니다.');
        }
      }

      // 4️⃣ [요청 바디 파싱]
      let body: unknown = undefined;
      if (method !== 'GET' && requestBody.trim()) {
        try {
          body = JSON.parse(requestBody) as unknown;
        } catch {
          throw new Error('요청 바디 JSON 형식이 올바르지 않습니다.');
        }
      }

      // 5️⃣ [API 요청 실행]
      let result: AxiosResponse;

      // Check if this is an auth endpoint that should block redirects
      const authEndpoints = ['/auth/login', '/auth/register', '/auth/me'];
      const shouldBlockRedirect = authEndpoints.some((authPath) =>
        endpoint.includes(authPath)
      );

      // Configure request options
      const requestConfig = {
        headers,
        ...(shouldBlockRedirect && { maxRedirects: 0 }),
      };

      switch (method) {
        case 'GET':
          result = await apiClient.get(endpoint, requestConfig);
          break;
        case 'POST':
          result = await apiClient.post(endpoint, body, requestConfig);
          break;
        case 'PUT':
          result = await apiClient.put(endpoint, body, requestConfig);
          break;
        case 'PATCH':
          result = await apiClient.patch(endpoint, body, requestConfig);
          break;
        case 'DELETE':
          result = await apiClient.delete(endpoint, requestConfig);
          break;
      }

      // 6️⃣ [응답 저장]
      const endTime = performance.now();
      const duration = endTime - startTime;

      setResponse({
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers as Record<string, string>,
        duration,
      });
    } catch (err) {
      // 7️⃣ [에러 처리]
      const endTime = performance.now();
      const duration = endTime - startTime;

      // 에러 메시지 추출
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as { error?: string } | undefined;
        errorMessage = responseData?.error ?? err.message;

        // 에러 응답도 표시
        if (err.response) {
          setResponse({
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
            headers: err.response.headers as Record<string, string>,
            duration,
          });
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = (
    testMethod: HttpMethod,
    testEndpoint: string,
    testBody?: string
  ) => {
    setMethod(testMethod);
    setEndpoint(testEndpoint);
    if (testBody) {
      setRequestBody(testBody);
    }
  };

  // 유틸리티 함수
  const formatJson = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyToken = async (token: string) => {
    const success = await copyToClipboard(token);
    if (success) {
      // Optional: Show a toast or temporary message
      alert('토큰이 클립보드에 복사되었습니다! 🎉');
    } else {
      alert('복사에 실패했습니다. 수동으로 선택해 복사하세요.');
    }
  };

  // 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            API Testing Console
          </h1>
          <div className="flex flex-wrap gap-4 items-center text-sm">
            {/* Priority 1: Mock Mode */}
            {import.meta.env.VITE_MOCK_API === 'true' ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">Active Mode:</span>
                <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-semibold flex items-center gap-2">
                  🎭 Mock API (MSW)
                </div>
              </div>
            ) : !API_BASE_URL ? (
              /* Priority 2: Vite Proxy */
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">Active Mode:</span>
                <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold flex items-center gap-2">
                  🔧 Vite Proxy
                  <span className="font-normal">→</span>
                  <code className="px-2 py-0.5 bg-blue-50 rounded text-xs text-blue-900">
                    {import.meta.env.VITE_PROXY_TARGET || 'http://192.168.71.112:8080'}
                  </code>
                </div>
              </div>
            ) : (
              /* Priority 3: Direct API URL */
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">Active Mode:</span>
                <div className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold flex items-center gap-2">
                  🌐 Direct API
                  <span className="font-normal">→</span>
                  <code className="px-2 py-0.5 bg-purple-50 rounded text-xs text-purple-900">
                    {API_BASE_URL}
                  </code>
                </div>
              </div>
            )}

            {/* Documentation Link */}
            <div className="flex items-center gap-2 text-slate-800">
              <span className="font-medium">📖</span>
              <a
                href="/docs/MOCKING.md"
                target="_blank"
                className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs hover:bg-slate-200 transition-colors font-medium"
              >
                Mock API Guide
              </a>
            </div>
          </div>
        </div>

        {/* Bearer Token Quick Input */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                🔑 Bearer Token (Quick Input)
              </label>
              <input
                type="text"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                placeholder="Paste your access token here..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-900"
              />
              <p className="mt-2 text-xs text-slate-600">
                토큰을 입력하면 자동으로 Custom Headers에 <code className="px-1 py-0.5 bg-slate-100 rounded">Authorization: Bearer ...</code> 형식으로 추가됩니다.
              </p>
            </div>
            {bearerToken && (
              <button
                onClick={() => setBearerToken('')}
                className="mt-7 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Request
            </h2>

            {/* HTTP Method & Endpoint */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Method & Endpoint
              </label>
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 bg-white"
                >
                  <option value="GET" className="text-slate-900">GET</option>
                  <option value="POST" className="text-slate-900">POST</option>
                  <option value="PUT" className="text-slate-900">PUT</option>
                  <option value="PATCH" className="text-slate-900">PATCH</option>
                  <option value="DELETE" className="text-slate-900">DELETE</option>
                </select>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/endpoint"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-900"
                />
              </div>
            </div>

            {/* Request Body */}
            {method !== 'GET' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-900"
                  placeholder='{\n  "key": "value"\n}'
                />
              </div>
            )}

            {/* Custom Headers */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Custom Headers (JSON)
              </label>
              <textarea
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-900"
                placeholder='{\n  "Authorization": "Bearer token"\n}'
              />
            </div>

            {/* Send Button */}
            <button
              onClick={() => void handleSendRequest()}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Send Request
                </>
              )}
            </button>
          </div>

          {/* Response Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Response
            </h2>

            {!response && !error && !isLoading && (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📡</div>
                  <p className="font-medium">No request sent yet</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-800 font-medium">Loading...</p>
                </div>
              </div>
            )}

            {error && !response && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-xl">❌</span>
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {response ? (
              <>
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          response.status >= 200 && response.status < 300
                            ? 'bg-green-100 text-green-800'
                            : response.status >= 400
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {response.status} {response.statusText}
                      </span>
                      <span className="text-sm text-slate-600">
                        {response.duration.toFixed(0)}ms
                      </span>
                    </div>
                  </div>

                  {/* Success Login/Register - Show Token Copy Button */}
                  {response.status >= 200 &&
                  response.status < 300 &&
                  response.data &&
                  typeof response.data === 'object' &&
                  'tokens' in response.data &&
                  response.data.tokens &&
                  typeof response.data.tokens === 'object' &&
                  'access_token' in response.data.tokens ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800 mb-1 flex items-center gap-2">
                            <span>✅</span>
                            인증 성공!
                          </h3>
                          <p className="text-green-700 text-sm mb-3">
                            로그인/회원가입이 완료되었습니다. Bearer Token을 복사하여 사용하세요.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                void handleCopyToken(
                                  (response.data as { tokens: { access_token: string } })
                                    .tokens.access_token
                                )
                              }
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              📋 Copy Access Token
                            </button>
                            <button
                              onClick={() => {
                                const token = (
                                  response.data as { tokens: { access_token: string } }
                                ).tokens.access_token;
                                setBearerToken(token);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              🔑 Use Token
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Response Body */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-2">
                    Response Body
                  </h3>
                  <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto max-h-96 text-xs font-mono text-slate-900">
                    {formatJson(response.data)}
                  </pre>
                </div>

                {/* Response Headers */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-2">
                    Response Headers
                  </h3>
                  <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto max-h-48 text-xs font-mono text-slate-900">
                    {formatJson(response.headers)}
                  </pre>
                </div>
              </div>
            </>) : null}
          </div>
        </div>

        {/* Quick Test Endpoints */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Quick Test Endpoints
          </h2>
          <p className="text-slate-800 mb-4 text-sm font-medium">
            빠른 테스트를 위한 실제 API 엔드포인트 (UDONGGEUM API v1)
          </p>

          {/* Auth Endpoints */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
              🔐 Authentication
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() =>
                  handleQuickTest(
                    'POST',
                    '/api/v1/auth/register',
                    '{\n  "email": "user@example.com",\n  "password": "password123",\n  "name": "테스트 사용자",\n  "phone": "010-1234-5678"\n}'
                  )
                }
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-blue-800">POST</div>
                <div className="text-xs text-blue-600">/auth/register</div>
              </button>
              <button
                onClick={() =>
                  handleQuickTest(
                    'POST',
                    '/api/v1/auth/login',
                    '{\n  "email": "user@example.com",\n  "password": "password123"\n}'
                  )
                }
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-blue-800">POST</div>
                <div className="text-xs text-blue-600">/auth/login</div>
              </button>
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/auth/me')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/auth/me 🔒</div>
              </button>
            </div>
          </div>

          {/* Stores Endpoints */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
              🏪 Stores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/stores')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/stores</div>
              </button>
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/stores/locations')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/stores/locations</div>
              </button>
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/stores/1?include_products=true')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/stores/1</div>
              </button>
            </div>
          </div>

          {/* Products Endpoints */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
              💍 Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/products')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/products</div>
              </button>
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/products/popular?category=gold&limit=4')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/products/popular</div>
              </button>
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/products/1')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/products/1</div>
              </button>
            </div>
          </div>

          {/* Cart Endpoints */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
              🛒 Cart
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/cart')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/cart 🔒</div>
              </button>
              <button
                onClick={() =>
                  handleQuickTest(
                    'POST',
                    '/api/v1/cart',
                    '{\n  "product_id": 1,\n  "product_option_id": 101,\n  "quantity": 2\n}'
                  )
                }
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-blue-800">POST</div>
                <div className="text-xs text-blue-600">/cart 🔒</div>
              </button>
              <button
                onClick={() =>
                  handleQuickTest(
                    'PUT',
                    '/api/v1/cart/11',
                    '{\n  "quantity": 3\n}'
                  )
                }
                className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-yellow-800">PUT</div>
                <div className="text-xs text-yellow-600">/cart/11 🔒</div>
              </button>
            </div>
          </div>

          {/* Orders Endpoints */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
              📦 Orders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/orders')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/orders 🔒</div>
              </button>
              <button
                onClick={() =>
                  handleQuickTest(
                    'POST',
                    '/api/v1/orders',
                    '{\n  "fulfillment_type": "delivery",\n  "shipping_address": "서울시 강남구 테헤란로 123"\n}'
                  )
                }
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-blue-800">POST</div>
                <div className="text-xs text-blue-600">/orders 🔒</div>
              </button>
              <button
                onClick={() => handleQuickTest('GET', '/api/v1/orders/21')}
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-medium transition-colors text-left"
              >
                <div className="font-semibold text-green-800">GET</div>
                <div className="text-xs text-green-600">/orders/21 🔒</div>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>💡 Tip:</strong> 🔒 표시는 인증이 필요한 엔드포인트입니다.
                먼저 로그인하여 받은 Access Token을 Custom Headers에 추가하세요:
                <code className="ml-1 px-1 py-0.5 bg-amber-100 rounded text-xs">
                  {`{"Authorization": "Bearer <token>"}`}
                </code>
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>🚫 Redirect Blocking:</strong> 로그인, 회원가입, 사용자 정보 엔드포인트는
                자동 리다이렉트가 차단됩니다. 실제 서버 응답 상태 코드(301/302 등)를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
