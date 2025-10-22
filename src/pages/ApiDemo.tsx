// 1. Imports (외부 → 내부 순서)
import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      switch (method) {
        case 'GET':
          result = await apiClient.get(endpoint, { headers });
          break;
        case 'POST':
          result = await apiClient.post(endpoint, body, { headers });
          break;
        case 'PUT':
          result = await apiClient.put(endpoint, body, { headers });
          break;
        case 'PATCH':
          result = await apiClient.patch(endpoint, body, { headers });
          break;
        case 'DELETE':
          result = await apiClient.delete(endpoint, { headers });
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

  // 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            API Testing Console
          </h1>
          <p className="text-slate-600">
            Test your backend API endpoints • Base URL:{' '}
            <code className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">
              {API_BASE_URL}
            </code>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Request
            </h2>

            {/* HTTP Method & Endpoint */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Method & Endpoint
              </label>
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/endpoint"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>

            {/* Request Body */}
            {method !== 'GET' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='{\n  "key": "value"\n}'
                />
              </div>
            )}

            {/* Custom Headers */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Headers (JSON)
              </label>
              <textarea
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
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
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Response
            </h2>

            {!response && !error && !isLoading && (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📡</div>
                  <p>No request sent yet</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Loading...</p>
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

            {response && (
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

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Response Body */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Response Body
                  </h3>
                  <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto max-h-96 text-xs font-mono">
                    {formatJson(response.data)}
                  </pre>
                </div>

                {/* Response Headers */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">
                    Response Headers
                  </h3>
                  <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto max-h-48 text-xs font-mono">
                    {formatJson(response.headers)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Test Endpoints */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Quick Test Endpoints
          </h2>
          <p className="text-slate-600 mb-4 text-sm">
            빠른 테스트를 위한 실제 API 엔드포인트 (UDONGGEUM API v1)
          </p>

          {/* Auth Endpoints */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
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
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
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
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
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
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
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
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
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

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>💡 Tip:</strong> 🔒 표시는 인증이 필요한 엔드포인트입니다.
              먼저 로그인하여 받은 Access Token을 Custom Headers에 추가하세요:
              <code className="ml-1 px-1 py-0.5 bg-amber-100 rounded text-xs">
                {`{"Authorization": "Bearer <token>"}`}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
