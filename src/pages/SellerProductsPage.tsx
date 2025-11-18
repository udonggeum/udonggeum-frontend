/**
 * SellerProductsPage Component
 * Manages seller's products for their stores
 */

import { useState } from 'react';
import { Package, Plus, Edit, Trash2, DollarSign, Tag } from 'lucide-react';
import {
  useSellerStores,
  useSellerStoreProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/queries';
import { LoadingSpinner, ErrorAlert } from '@/components';
import type { CreateProductRequest, UpdateProductRequest } from '@/schemas/seller';
import type { Product } from '@/schemas';

interface ProductFormData {
  store_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export default function SellerProductsPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>();
  const { data: stores, isLoading: isLoadingStores } = useSellerStores();
  const {
    data: products,
    isLoading: isLoadingProducts,
    isError,
    error,
  } = useSellerStoreProducts(selectedStoreId);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    store_id: 0,
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const resetForm = () => {
    setFormData({
      store_id: selectedStoreId || 0,
      name: '',
      description: '',
      price: 0,
      category: '',
      image_url: '',
    });
    setFormErrors({});
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    if (!selectedStoreId) return;
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      store_id: product.store_id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      image_url: product.image_url || '',
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
    const newValue = name === 'price' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    // Clear error for this field
    if (formErrors[name as keyof ProductFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) errors.name = '상품명을 입력하세요';
    if (!formData.description.trim()) errors.description = '상품 설명을 입력하세요';
    if (formData.price <= 0) errors.price = '가격은 0보다 커야 합니다';
    if (!formData.category.trim()) errors.category = '카테고리를 선택하세요';
    if (formData.image_url && !/^https?:\/\/.+/.test(formData.image_url)) {
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
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image_url: formData.image_url || undefined,
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
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image_url: formData.image_url || undefined,
      };

      createProduct(createData, {
        onSuccess: () => {
          closeModal();
        },
      });
    }
  };

  const handleDelete = (productId: number) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      deleteProduct(productId);
    }
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
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="w-8 h-8" aria-hidden="true" />
          상품 관리
        </h1>
        <p className="text-base-content/70 mt-2">
          판매할 상품을 관리하세요
        </p>
      </div>

      {/* Store Selection */}
      {!stores || stores.length === 0 ? (
        <div className="alert alert-warning mb-8">
          <span>먼저 가게를 추가해주세요. 가게가 있어야 상품을 등록할 수 있습니다.</span>
        </div>
      ) : (
        <div className="mb-8">
          <label htmlFor="store-select" className="label">
            <span className="label-text font-semibold">가게 선택</span>
          </label>
          <select
            id="store-select"
            value={selectedStoreId || ''}
            onChange={(e) => setSelectedStoreId(Number(e.target.value) || undefined)}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="">가게를 선택하세요</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Products List */}
      {!selectedStoreId ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center">
            <Package className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <p className="text-lg font-semibold">가게를 선택하세요</p>
            <p className="text-base-content/70">
              상품을 관리할 가게를 선택해주세요
            </p>
          </div>
        </div>
      ) : isLoadingProducts ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <ErrorAlert error={error} />
      ) : !products || products.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center">
            <Package className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <p className="text-lg font-semibold">등록된 상품이 없습니다</p>
            <p className="text-base-content/70 mb-4">
              첫 번째 상품을 추가해보세요
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="btn btn-primary gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              상품 추가
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={openCreateModal}
              className="btn btn-primary gap-2"
            >
              <Plus className="w-5 h-5" />
              상품 추가
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card bg-base-100 shadow-md">
                {product.image_url && (
                  <figure>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                )}
                <div className="card-body">
                  <h2 className="card-title">{product.name}</h2>
                  <p className="text-base-content/70 text-sm mb-2">
                    {product.description}
                  </p>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">
                        ₩{product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 flex-shrink-0" />
                      <span>{product.category}</span>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="btn btn-sm btn-outline gap-2"
                      disabled={isUpdating || isDeleting}
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-sm btn-error btn-outline gap-2"
                      disabled={isUpdating || isDeleting}
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingProduct ? '상품 수정' : '상품 추가'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Product Name */}
              <div className="form-control w-full mb-4">
                <label htmlFor="name" className="label">
                  <span className="label-text">상품명</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="금반지"
                />
                {formErrors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.name}</span>
                  </label>
                )}
              </div>

              {/* Description */}
              <div className="form-control w-full mb-4">
                <label htmlFor="description" className="label">
                  <span className="label-text">상품 설명</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`textarea textarea-bordered w-full ${formErrors.description ? 'textarea-error' : ''}`}
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
              <div className="form-control w-full mb-4">
                <label htmlFor="price" className="label">
                  <span className="label-text">가격 (원)</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.price ? 'input-error' : ''}`}
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

              {/* Category */}
              <div className="form-control w-full mb-4">
                <label htmlFor="category" className="label">
                  <span className="label-text">카테고리</span>
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.category ? 'input-error' : ''}`}
                  placeholder="반지"
                />
                {formErrors.category && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.category}</span>
                  </label>
                )}
              </div>

              {/* Image URL */}
              <div className="form-control w-full mb-4">
                <label htmlFor="image_url" className="label">
                  <span className="label-text">이미지 URL (선택)</span>
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.image_url ? 'input-error' : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.image_url && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.image_url}</span>
                  </label>
                )}
              </div>

              {/* Modal Actions */}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost"
                  disabled={isCreating || isUpdating}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating
                    ? editingProduct
                      ? '수정 중...'
                      : '추가 중...'
                    : editingProduct
                      ? '수정'
                      : '추가'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}
    </div>
  );
}
