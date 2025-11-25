/**
 * SellerProductsPage Component
 * Manages seller's products for their stores
 */

import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, DollarSign, Tag } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  useSellerStores,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  sellerKeys,
} from '@/hooks/queries';
import { sellerService } from '@/services/seller';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoadingSpinner, ErrorAlert, ImageUploadWithOptimization, Button, Card, CardBody, Select } from '@/components';
import type { CreateProductRequest, UpdateProductRequest, ProductOptionInput } from '@/schemas/seller';
import type { Product } from '@/schemas';

interface ProductFormData {
  store_id: number;
  name: string;
  description: string;
  price: number;
  weight?: number;
  purity?: string;
  category: string;
  material: string;
  stock_quantity: number;
  image_url: string;
  options: ProductOptionInput[];
}

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  '반지': 'bg-pink-100 text-pink-700 border-pink-200',
  '팔찌': 'bg-purple-100 text-purple-700 border-purple-200',
  '목걸이': 'bg-sky-100 text-sky-700 border-sky-200',
  '귀걸이': 'bg-teal-100 text-teal-700 border-teal-200',
  '기타': 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function SellerProductsPage() {
  const [searchParams] = useSearchParams();
  const stockParam = searchParams.get('stock'); // 'low' or null

  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(stockParam === 'low');

  // Update filter when URL parameter changes
  useEffect(() => {
    setShowLowStockOnly(stockParam === 'low');
  }, [stockParam]);

  const { data: stores, isLoading: isLoadingStores } = useSellerStores();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  // Fetch products for all stores to enable "all" filter using useQueries
  const storeIds = stores?.map((store) => store.id) || [];
  const productQueries = useQueries({
    queries: storeIds.map((storeId) => ({
      queryKey: sellerKeys.products(storeId),
      queryFn: () => sellerService.getStoreProducts(storeId),
      enabled: isAdmin,
      staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  });

  // Get products from selected store or all stores
  const allProducts = productQueries.flatMap((query) => query.data || []);
  const filteredByStore = selectedStoreId === 'all'
    ? allProducts
    : allProducts.filter((p) => p.store_id === selectedStoreId);

  // Apply category filter
  const filteredByCategory = selectedCategory === 'all'
    ? filteredByStore
    : filteredByStore.filter((p) => p.category === selectedCategory);

  // Apply low stock filter (stock_quantity <= 5)
  const products = showLowStockOnly
    ? filteredByCategory.filter((p) => (p.stock_quantity ?? 0) <= 5)
    : filteredByCategory;

  const isLoadingProducts = productQueries.some((q) => q.isLoading);
  const isError = productQueries.some((q) => q.isError);
  const error = productQueries.find((q) => q.error)?.error;

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    store_id: 0,
    name: '',
    description: '',
    price: 0,
    weight: undefined,
    purity: undefined,
    category: '',
    material: '',
    stock_quantity: 0,
    image_url: '',
    options: [],
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const resetForm = () => {
    setFormData({
      store_id: selectedStoreId === 'all' ? 0 : selectedStoreId || 0,
      name: '',
      description: '',
      price: 0,
      weight: undefined,
      purity: undefined,
      category: '',
      material: '',
      stock_quantity: 0,
      image_url: '',
      options: [],
    });
    setFormErrors({});
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    // When "all" is selected, user must select a store in the form
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      store_id: product.store_id || 0,
      name: product.name,
      description: product.description || '',
      price: product.price,
      weight: product.weight,
      purity: product.purity,
      category: product.category,
      material: product.material || '',
      stock_quantity: product.stock_quantity || 0,
      image_url: product.image_url || '',
      options: product.options || [],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue: string | number | undefined = value;

    if (name === 'price' || name === 'weight' || name === 'stock_quantity') {
      newValue = parseFloat(value) || 0;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    // Clear error for this field
    if (formErrors[name as keyof ProductFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          name: '',
          value: '',
          additional_price: 0,
          stock_quantity: 0,
          is_default: prev.options.length === 0,
        },
      ],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, field: keyof ProductOptionInput, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) errors.name = '상품명을 입력하세요';
    if (formData.price <= 0) errors.price = '가격은 0보다 커야 합니다';
    if (!formData.category.trim()) errors.category = '카테고리를 선택하세요';
    if (!formData.material.trim()) errors.material = '재질을 선택하세요';

    // Check store_id only when creating new product (not when editing)
    if (!editingProduct && (!formData.store_id || formData.store_id === 0)) {
      errors.store_id = '가게를 선택하세요';
    }

    // Allow both absolute URLs (http://, https://) and relative paths (/uploads/...)
    if (formData.image_url && !/^(https?:\/\/.+|\/uploads\/.+)/.test(formData.image_url)) {
      errors.image_url = '올바른 URL 형식이 아닙니다';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingProduct) {
      // Update existing product
      const updateData: UpdateProductRequest = {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        weight: formData.weight,
        purity: formData.purity,
        category: formData.category,
        material: formData.material,
        stock_quantity: formData.stock_quantity,
        image_url: formData.image_url || undefined,
        options: formData.options,
      };

      updateProduct(
        { id: editingProduct.id, data: updateData },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    } else {
      // Create new product
      const createData: CreateProductRequest = {
        store_id: formData.store_id,
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        weight: formData.weight,
        purity: formData.purity,
        category: formData.category,
        material: formData.material,
        stock_quantity: formData.stock_quantity,
        image_url: formData.image_url || undefined,
        options: formData.options,
      };

      createProduct(createData, {
        onSuccess: () => {
          closeModal();
        },
      });
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteConfirmProduct(product);
  };

  const confirmDelete = () => {
    if (deleteConfirmProduct) {
      deleteProduct(deleteConfirmProduct.id, {
        onSuccess: () => {
          setDeleteConfirmProduct(null);
        },
      });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmProduct(null);
  };

  if (isLoadingStores) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-[var(--color-text)]">
            <Package className="w-8 h-8" aria-hidden="true" />
            상품 관리
          </h1>
          <p className="text-[var(--color-text)]/70 mt-2">
            판매할 상품을 관리하세요
          </p>
          {showLowStockOnly && (
            <div className="alert bg-orange-100 text-orange-700 border-orange-200 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>재고 부족 상품만 표시 중입니다 (재고 5개 이하)</span>
            </div>
          )}
        </div>

      {/* Filters */}
      {!stores || stores.length === 0 ? (
        <div className="alert alert-warning mb-8">
          <span>먼저 가게를 추가해주세요. 가게가 있어야 상품을 등록할 수 있습니다.</span>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Store Filter */}
          <Select
            id="store-select"
            label="가게 필터"
            value={selectedStoreId}
            onChange={(e) =>
              setSelectedStoreId(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
          >
            <option value="all">전체</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>

          {/* Category Filter */}
          <Select
            id="category-select"
            label="카테고리 필터"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="반지">반지</option>
            <option value="팔찌">팔찌</option>
            <option value="목걸이">목걸이</option>
            <option value="귀걸이">귀걸이</option>
            <option value="기타">기타</option>
          </Select>
        </div>
      )}

      {/* Products List */}
      {isLoadingProducts ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <ErrorAlert error={error ?? undefined} message={error?.message || '상품 목록을 불러오는데 실패했습니다'} />
      ) : !products || products.length === 0 ? (
        <Card>
          <CardBody className="text-center">
            <Package className="w-16 h-16 mx-auto text-[var(--color-text)]/30 mb-4" />
            <p className="text-lg font-semibold text-[var(--color-text)]">등록된 상품이 없습니다</p>
            <p className="text-[var(--color-text)]/70 mb-4">
              첫 번째 상품을 추가해보세요
            </p>
            <Button
              variant="primary"
              onClick={openCreateModal}
              className="gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              상품 추가
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateModal}
              variant="primary" className="gap-2"
            >
              <Plus className="w-5 h-5" />
              상품 추가
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} hover className="hover:border-[var(--color-gold)]/50">
                {product.image_url && (
                  <figure>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                )}
                <CardBody>
                  <h2 className="card-title text-[var(--color-text)]">{product.name}</h2>
                  <p className="text-[var(--color-text)]/70 text-sm mb-2">
                    {product.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--color-text)]">
                      <DollarSign className="w-4 h-4 flex-shrink-0 text-[var(--color-gold)]" />
                      <span className="font-semibold">
                        ₩{product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 flex-shrink-0 text-[var(--color-text)]/50" />
                      <span className={`badge badge-sm ${CATEGORY_COLORS[product.category] || CATEGORY_COLORS['기타']}`}>
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <Button onClick={() => openEditModal(product)}
                      variant="outline" size="sm" className="gap-2"
                      disabled={isUpdating || isDeleting}
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </Button>
                    <Button onClick={() => handleDeleteClick(product)}
                      variant="error" size="sm" className="gap-2"
                      disabled={isUpdating || isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto bg-[var(--color-secondary)] border border-[var(--color-text)]/20">
            <h3 className="font-bold text-lg mb-6 text-[var(--color-text)]">
              {editingProduct ? '상품 수정' : '상품 추가'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* 2-Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Image Upload */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-base">상품 이미지</h4>
                  <ImageUploadWithOptimization
                    onImageSelect={(url) => {
                      setFormData((prev) => ({ ...prev, image_url: url }));
                      if (formErrors.image_url) {
                        setFormErrors((prev) => ({ ...prev, image_url: undefined }));
                      }
                    }}
                    currentImageUrl={formData.image_url}
                  />
                  {formErrors.image_url && (
                    <div className="text-error text-sm mt-1">{formErrors.image_url}</div>
                  )}
                </div>

                {/* Right Column: Product Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-base">기본 정보</h4>

                  {/* Product Name */}
                  <div className="form-control w-full">
                <label htmlFor="name" className="label">
                  <span className="label-text">상품명</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="금반지"
                />
                {formErrors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.name}</span>
                  </label>
                )}
              </div>

                  {/* Description */}
                  <div className="form-control w-full">
                <label htmlFor="description" className="label">
                  <span className="label-text">상품 설명</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`textarea textarea-bordered w-full bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 ${formErrors.description ? 'textarea-error' : ''}`}
                  placeholder="24K 순금으로 제작된 고급 반지입니다"
                  rows={3}
                />
                {formErrors.description && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.description}</span>
                  </label>
                )}
              </div>

                  {/* Price */}
                  <div className="form-control w-full">
                <label htmlFor="price" className="label">
                  <span className="label-text">가격 (원)</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 ${formErrors.price ? 'input-error' : ''}`}
                  placeholder="500000"
                  min="0"
                  step="1000"
                />
                {formErrors.price && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.price}</span>
                  </label>
                )}
              </div>

                  {/* Category & Material Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Category */}
                    <div className="form-control w-full">
                <label htmlFor="category" className="label">
                  <span className="label-text">카테고리</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`select select-bordered w-full bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 ${formErrors.category ? 'select-error' : ''}`}
                >
                  <option value="">카테고리를 선택하세요</option>
                  <option value="반지">반지</option>
                  <option value="팔찌">팔찌</option>
                  <option value="목걸이">목걸이</option>
                  <option value="귀걸이">귀걸이</option>
                  <option value="기타">기타</option>
                    </select>
                    {formErrors.category && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.category}</span>
                      </label>
                    )}
                    </div>

                    {/* Material */}
                    <div className="form-control w-full">
                      <label htmlFor="material" className="label">
                        <span className="label-text">재질</span>
                      </label>
                <select
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className={`select select-bordered w-full bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 ${formErrors.material ? 'select-error' : ''}`}
                >
                  <option value="">재질을 선택하세요</option>
                  <option value="금">금</option>
                  <option value="은">은</option>
                  <option value="백금">백금</option>
                  <option value="기타">기타</option>
                    </select>
                    {formErrors.material && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.material}</span>
                      </label>
                    )}
                    </div>
                  </div>

                  {/* Weight & Purity Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Weight */}
                    <div className="form-control w-full">
                <label htmlFor="weight" className="label">
                  <span className="label-text">중량 (g, 선택)</span>
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={handleInputChange}
                  className="input input-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 w-full"
                  placeholder="3.75"
                      step="0.01"
                      min="0"
                    />
                    </div>

                    {/* Purity */}
                    <div className="form-control w-full">
                      <label htmlFor="purity" className="label">
                        <span className="label-text">순도 (선택)</span>
                      </label>
                <input
                  id="purity"
                  name="purity"
                  type="text"
                  value={formData.purity || ''}
                  onChange={handleInputChange}
                      className="input input-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 w-full"
                      placeholder="18K, 24K, 925 등"
                    />
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="form-control w-full">
                <label htmlFor="stock_quantity" className="label">
                  <span className="label-text">재고 수량</span>
                </label>
                <input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  className="input input-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 w-full"
                    placeholder="10"
                    min="0"
                  />
                  </div>
                </div>
              </div>

              {/* Product Options - Full Width Below Grid */}
              <div className="form-control w-full mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-base">상품 옵션 (선택)</h4>
                  <Button onClick={addOption}
                    variant="outline" size="sm" className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    옵션 추가
                  </Button>
                </div>

                {formData.options.length === 0 ? (
                  <div className="text-sm text-[var(--color-text)]/60 p-4 border border-dashed rounded-lg text-center">
                    사이즈, 색상 등의 옵션을 추가할 수 있습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="border border-[var(--color-text)]/20 rounded-lg bg-[var(--color-primary)] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">옵션 {index + 1}</span>
                          <Button onClick={() => removeOption(index)}
                            variant="circle" size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">옵션명</span>
                            </label>
                            <input
                              type="text"
                              value={option.name}
                              onChange={(e) => updateOption(index, 'name', e.target.value)}
                              className="input input-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 input-sm w-full"
                              placeholder="사이즈, 색상 등"
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">옵션값</span>
                            </label>
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => updateOption(index, 'value', e.target.value)}
                              className="input input-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 input-sm w-full"
                              placeholder="10호, 골드 등"
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">추가 금액 (원)</span>
                            </label>
                            <input
                              type="number"
                              value={option.additional_price}
                              onChange={(e) => updateOption(index, 'additional_price', parseFloat(e.target.value) || 0)}
                              className="input input-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 input-sm w-full"
                              placeholder="0"
                              min="0"
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-xs">재고 수량</span>
                            </label>
                            <input
                              type="number"
                              value={option.stock_quantity}
                              onChange={(e) => updateOption(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                              className="input input-bordered bg-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-text)]/20 input-sm w-full"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label cursor-pointer justify-start gap-2">
                            <input
                              type="checkbox"
                              checked={option.is_default}
                              onChange={(e) => updateOption(index, 'is_default', e.target.checked)}
                              className="checkbox checkbox-sm"
                            />
                            <span className="label-text text-xs">기본 옵션으로 설정</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="modal-action">
                <Button onClick={closeModal}
                  variant="ghost"
                  disabled={isCreating || isUpdating}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating
                    ? editingProduct
                      ? '수정 중...'
                      : '추가 중...'
                    : editingProduct
                      ? '수정'
                      : '추가'}
                </Button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="modal modal-open">
          <div className="modal-box bg-[var(--color-secondary)] border border-[var(--color-text)]/10">
            <h3 className="text-lg font-bold text-[var(--color-text)]">상품 삭제 확인</h3>
            <p className="py-4 text-sm text-[var(--color-text)]/70">
              정말로 <span className="font-semibold text-[var(--color-text)]">{deleteConfirmProduct.name}</span> 상품을 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="modal-action flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                취소
              </Button>
              <Button
                variant="error"
                onClick={confirmDelete}
                loading={isDeleting}
              >
                삭제
              </Button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={cancelDelete}></div>
        </div>
      )}
    </div>
  );
}
