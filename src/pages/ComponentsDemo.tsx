import { useState } from 'react';
import { Button, ErrorAlert, LoadingSpinner, FallbackImage } from '../components';
import ProductCard from '../components/ProductCard';
import ProductsLoadingSkeleton from '../components/ProductsLoadingSkeleton';
import type { Product } from '../types';

/**
 * ComponentsDemo Page
 *
 * Comprehensive showcase of all UI components and daisyUI base components.
 * Organized by tabs for easy navigation.
 */
export default function ComponentsDemo() {
  const [activeTab, setActiveTab] = useState<string>('buttons');

  // Mock data for demonstrations
  const mockProduct: Product = {
    id: '1',
    name: '18K 골드 반지',
    price: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    imageAlt: '골드 반지',
    categoryId: 'rings',
    regionId: 'seoul-gangnam',
    storeName: '우리금은방',
    isWishlisted: false,
    isInCart: false,
  };

  const tabs = [
    { id: 'buttons', label: 'Buttons', icon: '🔘' },
    { id: 'alerts', label: 'Alerts & Feedback', icon: '⚠️' },
    { id: 'loading', label: 'Loading & Skeleton', icon: '⏳' },
    { id: 'cards', label: 'Cards & Products', icon: '🃏' },
    { id: 'navigation', label: 'Navigation', icon: '🧭' },
    { id: 'daisyui', label: 'daisyUI Base', icon: '🌼' },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">우동금 컴포넌트 데모</h1>
          <p className="text-base-content/70">
            모든 재사용 가능한 컴포넌트와 daisyUI 베이스 컴포넌트 쇼케이스
          </p>
          <div className="badge badge-primary badge-lg mt-4">
            daisyUI 5.3.10 + React 19
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div role="tablist" className="tabs tabs-boxed bg-base-100 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`tab tab-lg ${activeTab === tab.id ? 'tab-active' : ''}`}
                aria-selected={activeTab === tab.id}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-base-100 rounded-lg shadow-xl p-6">
          {activeTab === 'buttons' && <ButtonsTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'loading' && <LoadingTab />}
          {activeTab === 'cards' && <CardsTab product={mockProduct} />}
          {activeTab === 'navigation' && <NavigationTab />}
          {activeTab === 'daisyui' && <DaisyUITab />}
        </div>
      </div>
    </div>
  );
}

/**
 * Buttons Tab - Showcase all button variants and states
 */
function ButtonsTab() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-12">
      <Section title="Button 컴포넌트" description="테마 인식 버튼 with 5 variants × 5 sizes">
        {/* Variants */}
        <SubSection title="Variants" code={`<Button variant="primary">Primary</Button>`}>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="accent">Accent</Button>
          </div>
        </SubSection>

        {/* Sizes */}
        <SubSection title="Sizes" code={`<Button size="lg">Large</Button>`}>
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">XL</Button>
          </div>
        </SubSection>

        {/* States */}
        <SubSection title="States" code={`<Button loading>Loading...</Button>`}>
          <div className="flex flex-wrap gap-2">
            <Button
              loading={isLoading}
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 2000);
              }}
            >
              {isLoading ? 'Loading...' : 'Click to Load'}
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
          </div>
        </SubSection>

        {/* Modifiers */}
        <SubSection title="Modifiers" code={`<Button wide>Wide Button</Button>`}>
          <div className="space-y-2">
            <div>
              <Button wide>Wide Button (extra padding)</Button>
            </div>
            <div>
              <Button block>Block Button (full width)</Button>
            </div>
          </div>
        </SubSection>

        {/* With Icons */}
        <SubSection
          title="With Icons"
          code={`<Button><svg>...</svg>Delete</Button>`}
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              찜하기
            </Button>
            <Button variant="secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              장바구니
            </Button>
          </div>
        </SubSection>
      </Section>
    </div>
  );
}

/**
 * Alerts Tab - Showcase all alert and error components
 */
function AlertsTab() {
  const [showRetry, setShowRetry] = useState(false);

  return (
    <div className="space-y-12">
      <Section
        title="ErrorAlert 컴포넌트"
        description="재사용 가능한 에러/경고/정보 알림"
      >
        <SubSection title="Error Variant" code={`<ErrorAlert variant="error" />`}>
          <ErrorAlert
            title="오류가 발생했습니다"
            message="네트워크 연결을 확인해주세요."
            variant="error"
            onRetry={() => {
              setShowRetry(true);
              setTimeout(() => setShowRetry(false), 2000);
            }}
          />
          {showRetry && (
            <div className="mt-2 text-sm text-success">✓ Retry callback executed!</div>
          )}
        </SubSection>

        <SubSection title="Warning Variant" code={`<ErrorAlert variant="warning" />`}>
          <ErrorAlert
            title="입력 오류"
            message="모든 필수 항목을 입력해주세요."
            variant="warning"
          />
        </SubSection>

        <SubSection title="Info Variant" code={`<ErrorAlert variant="info" />`}>
          <ErrorAlert
            title="알림"
            message="유지보수 예정: 2025년 10월 30일 오전 2시-4시"
            variant="info"
          />
        </SubSection>
      </Section>

      <Section
        title="daisyUI Base Alerts"
        description="daisyUI 기본 알림 컴포넌트"
      >
        <SubSection title="Alert Variants" code={`<div role="alert" className="alert alert-success">`}>
          <div className="space-y-4">
            <div role="alert" className="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>상품이 장바구니에 추가되었습니다!</span>
            </div>

            <div role="alert" className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>재고가 얼마 남지 않았습니다!</span>
            </div>

            <div role="alert" className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>무료 배송은 5만원 이상 구매 시 제공됩니다.</span>
            </div>

            <div role="alert" className="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>결제 처리 중 오류가 발생했습니다.</span>
            </div>
          </div>
        </SubSection>
      </Section>
    </div>
  );
}

/**
 * Loading Tab - Showcase loading states
 */
function LoadingTab() {
  return (
    <div className="space-y-12">
      <Section
        title="LoadingSpinner 컴포넌트"
        description="재사용 가능한 로딩 스피너"
      >
        <SubSection title="Sizes" code={`<LoadingSpinner size="md" />`}>
          <div className="flex gap-8 items-center">
            <LoadingSpinner size="sm" message="Small" />
            <LoadingSpinner size="md" message="Medium" />
            <LoadingSpinner size="lg" message="Large" />
          </div>
        </SubSection>

        <SubSection title="Without Message" code={`<LoadingSpinner showMessage={false} />`}>
          <LoadingSpinner showMessage={false} />
        </SubSection>
      </Section>

      <Section
        title="ProductsLoadingSkeleton"
        description="상품 로딩 스켈레톤 (그리드)"
      >
        <SubSection title="4 Cards" code={`<ProductsLoadingSkeleton count={4} />`}>
          <ProductsLoadingSkeleton count={4} />
        </SubSection>
      </Section>

      <Section title="daisyUI Loading Variants" description="daisyUI 기본 로딩">
        <SubSection title="Loading Spinners" code={`<span className="loading loading-spinner" />`}>
          <div className="flex gap-4 items-center">
            <span className="loading loading-spinner loading-xs" />
            <span className="loading loading-spinner loading-sm" />
            <span className="loading loading-spinner loading-md" />
            <span className="loading loading-spinner loading-lg" />
          </div>
        </SubSection>

        <SubSection title="Loading Dots" code={`<span className="loading loading-dots" />`}>
          <div className="flex gap-4 items-center">
            <span className="loading loading-dots loading-xs" />
            <span className="loading loading-dots loading-sm" />
            <span className="loading loading-dots loading-md" />
            <span className="loading loading-dots loading-lg" />
          </div>
        </SubSection>

        <SubSection title="Loading Ring" code={`<span className="loading loading-ring" />`}>
          <div className="flex gap-4 items-center">
            <span className="loading loading-ring loading-xs" />
            <span className="loading loading-ring loading-sm" />
            <span className="loading loading-ring loading-md" />
            <span className="loading loading-ring loading-lg" />
          </div>
        </SubSection>
      </Section>
    </div>
  );
}

/**
 * Cards Tab - Showcase card components
 */
function CardsTab({ product }: { product: Product }) {
  return (
    <div className="space-y-12">
      <Section title="ProductCard 컴포넌트" description="상품 카드 컴포넌트">
        <SubSection title="Default State" code={`<ProductCard product={product} />`}>
          <div className="max-w-sm">
            <ProductCard
              product={product}
              onWishlist={() => console.log('Wishlist clicked')}
              onAddToCart={() => console.log('Add to cart clicked')}
            />
          </div>
        </SubSection>
      </Section>

      <Section title="daisyUI Base Cards" description="daisyUI 기본 카드">
        <SubSection title="Card with Image" code={`<div className="card bg-base-100 shadow-xl">`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-base-100 shadow-xl">
              <figure>
                <FallbackImage
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400"
                  alt="Jewelry"
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">Card Title</h3>
                <p>Card description goes here.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">Buy Now</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Card without Image</h3>
                <p>This is a simple card with text only content.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-sm">Action</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl image-full">
              <figure>
                <FallbackImage
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400"
                  alt="Gold"
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-white">Image Full Card</h3>
                <p className="text-white/80">Overlay text on image</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-sm">View</button>
                </div>
              </div>
            </div>
          </div>
        </SubSection>
      </Section>
    </div>
  );
}

/**
 * Navigation Tab - Showcase navigation components
 */
function NavigationTab() {
  return (
    <div className="space-y-12">
      <Section title="Breadcrumbs" description="페이지 경로 표시">
        <SubSection title="Simple Breadcrumbs" code={`<div className="breadcrumbs">`}>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <a>Home</a>
              </li>
              <li>
                <a>Products</a>
              </li>
              <li>반지</li>
            </ul>
          </div>
        </SubSection>
      </Section>

      <Section title="Tabs" description="탭 네비게이션">
        <SubSection title="Tabs Boxed" code={`<div className="tabs tabs-boxed">`}>
          <div className="tabs tabs-boxed">
            <a className="tab tab-active">Tab 1</a>
            <a className="tab">Tab 2</a>
            <a className="tab">Tab 3</a>
          </div>
        </SubSection>

        <SubSection title="Tabs Bordered" code={`<div className="tabs tabs-bordered">`}>
          <div className="tabs tabs-bordered">
            <a className="tab tab-active">반지</a>
            <a className="tab">목걸이</a>
            <a className="tab">팔찌</a>
          </div>
        </SubSection>
      </Section>

      <Section title="Steps" description="단계 표시 (체크아웃 플로우)">
        <SubSection title="Steps Component" code={`<ul className="steps">`}>
          <ul className="steps w-full">
            <li className="step step-primary">장바구니</li>
            <li className="step step-primary">배송지 입력</li>
            <li className="step">결제</li>
            <li className="step">주문 완료</li>
          </ul>
        </SubSection>
      </Section>
    </div>
  );
}

/**
 * daisyUI Tab - Showcase base daisyUI components
 */
function DaisyUITab() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-12">
      <Section title="Badges" description="배지 컴포넌트">
        <SubSection title="Badge Colors" code={`<div className="badge badge-primary">`}>
          <div className="flex flex-wrap gap-2">
            <div className="badge">Default</div>
            <div className="badge badge-primary">Primary</div>
            <div className="badge badge-secondary">Secondary</div>
            <div className="badge badge-accent">Accent</div>
            <div className="badge badge-ghost">Ghost</div>
            <div className="badge badge-info">Info</div>
            <div className="badge badge-success">Success</div>
            <div className="badge badge-warning">Warning</div>
            <div className="badge badge-error">Error</div>
          </div>
        </SubSection>

        <SubSection title="Badge Sizes" code={`<div className="badge badge-lg">`}>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="badge badge-xs">XS</div>
            <div className="badge badge-sm">SM</div>
            <div className="badge badge-md">MD</div>
            <div className="badge badge-lg">LG</div>
          </div>
        </SubSection>
      </Section>

      <Section title="Tooltips" description="툴팁">
        <SubSection title="Tooltip Positions" code={`<div className="tooltip" data-tip="...">`}>
          <div className="flex gap-4">
            <div className="tooltip" data-tip="Top tooltip">
              <button className="btn btn-sm">Top</button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Right tooltip">
              <button className="btn btn-sm">Right</button>
            </div>
            <div className="tooltip tooltip-bottom" data-tip="Bottom tooltip">
              <button className="btn btn-sm">Bottom</button>
            </div>
            <div className="tooltip tooltip-left" data-tip="Left tooltip">
              <button className="btn btn-sm">Left</button>
            </div>
          </div>
        </SubSection>
      </Section>

      <Section title="Modal" description="모달 다이얼로그">
        <SubSection title="Modal Example" code={`<dialog className="modal">`}>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            Open Modal
          </button>
          {modalOpen && (
            <dialog className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg">모달 제목</h3>
                <p className="py-4">모달 내용이 여기에 들어갑니다.</p>
                <div className="modal-action">
                  <button className="btn" onClick={() => setModalOpen(false)}>
                    닫기
                  </button>
                  <button className="btn btn-primary" onClick={() => setModalOpen(false)}>
                    확인
                  </button>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button onClick={() => setModalOpen(false)}>close</button>
              </form>
            </dialog>
          )}
        </SubSection>
      </Section>

      <Section title="Toggle & Checkbox" description="토글 및 체크박스">
        <SubSection title="Toggle Switch" code={`<input type="checkbox" className="toggle" />`}>
          <div className="flex gap-4">
            <input type="checkbox" className="toggle" defaultChecked />
            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            <input type="checkbox" className="toggle toggle-secondary" defaultChecked />
            <input type="checkbox" className="toggle toggle-accent" defaultChecked />
          </div>
        </SubSection>

        <SubSection title="Checkbox" code={`<input type="checkbox" className="checkbox" />`}>
          <div className="flex gap-4">
            <input type="checkbox" className="checkbox" defaultChecked />
            <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
            <input type="checkbox" className="checkbox checkbox-secondary" defaultChecked />
            <input type="checkbox" className="checkbox checkbox-accent" defaultChecked />
          </div>
        </SubSection>
      </Section>

      <Section title="Rating" description="별점">
        <SubSection title="Rating Component" code={`<div className="rating">`}>
          <div className="rating">
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
            <input
              type="radio"
              name="rating-2"
              className="mask mask-star-2 bg-orange-400"
              defaultChecked
            />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
          </div>
        </SubSection>
      </Section>

      <Section title="Dropdown" description="드롭다운 메뉴">
        <SubSection title="Dropdown Menu" code={`<div className="dropdown">`}>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn m-1">
              Click
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              <li>
                <a>Item 1</a>
              </li>
              <li>
                <a>Item 2</a>
              </li>
            </ul>
          </div>
        </SubSection>
      </Section>
    </div>
  );
}

/**
 * Section Component - Container for demo sections
 */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-base-content/70">{description}</p>
      </div>
      {children}
    </section>
  );
}

/**
 * SubSection Component - Individual component showcase
 */
function SubSection({
  title,
  code,
  children,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="p-6 bg-base-200 rounded-lg">{children}</div>
      <div className="mockup-code text-xs">
        <pre data-prefix="$">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
