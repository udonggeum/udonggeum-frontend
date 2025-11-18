/**
 * SellerStoresPage Component
 * Manages seller's stores (view, create, edit, delete)
 */

import { useState } from 'react';
import { Store, Plus, Edit, Trash2, MapPin, Phone, Clock } from 'lucide-react';
import {
  useSellerStores,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
} from '@/hooks/queries';
import { LoadingSpinner, ErrorAlert } from '@/components';
import type { CreateStoreRequest, UpdateStoreRequest } from '@/schemas/seller';
import type { Store as StoreType } from '@/schemas';

interface StoreFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  business_hours: string;
}

export default function SellerStoresPage() {
  const { data: stores, isLoading, isError, error } = useSellerStores();
  const { mutate: createStore, isPending: isCreating } = useCreateStore();
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore();
  const { mutate: deleteStore, isPending: isDeleting } = useDeleteStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    business_hours: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof StoreFormData, string>>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      business_hours: '',
    });
    setFormErrors({});
    setEditingStore(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (store: StoreType) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      description: (store.description as string | undefined) || '',
      address: (store.address as string | undefined) || '',
      phone: (store.phone as string | undefined) || '',
      business_hours: (store.business_hours as string | undefined) || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name as keyof StoreFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof StoreFormData, string>> = {};

    if (!formData.name.trim()) errors.name = '가게 이름을 입력하세요';
    if (!formData.description.trim()) errors.description = '가게 설명을 입력하세요';
    if (!formData.address.trim()) errors.address = '주소를 입력하세요';
    if (!formData.phone.trim()) {
      errors.phone = '전화번호를 입력하세요';
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone)) {
      errors.phone = '올바른 전화번호 형식이 아닙니다';
    }
    if (!formData.business_hours.trim()) errors.business_hours = '영업 시간을 입력하세요';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingStore) {
      // Update existing store
      const updateData: UpdateStoreRequest = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        business_hours: formData.business_hours,
      };

      updateStore(
        { id: editingStore.id, data: updateData },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    } else {
      // Create new store
      const createData: CreateStoreRequest = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        business_hours: formData.business_hours,
      };

      createStore(createData, {
        onSuccess: () => {
          closeModal();
        },
      });
    }
  };

  const handleDelete = (storeId: number) => {
    if (window.confirm('정말로 이 가게를 삭제하시겠습니까?')) {
      deleteStore(storeId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert error={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Store className="w-8 h-8" aria-hidden="true" />
            가게 관리
          </h1>
          <p className="text-base-content/70 mt-2">
            판매할 가게를 관리하세요
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-5 h-5" />
          가게 추가
        </button>
      </div>

      {/* Stores List */}
      {!stores || stores.length === 0 ? (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body text-center">
            <Store className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
            <p className="text-lg font-semibold">등록된 가게가 없습니다</p>
            <p className="text-base-content/70 mb-4">
              첫 번째 가게를 추가해보세요
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="btn btn-primary gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              가게 추가
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">{store.name}</h2>
                <p className="text-base-content/70 text-sm mb-4">
                  {store.description}
                </p>

                <div className="space-y-2 text-sm">
                  {store.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  {store.business_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{store.business_hours}</span>
                    </div>
                  )}
                </div>

                <div className="card-actions justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => openEditModal(store)}
                    className="btn btn-sm btn-outline gap-2"
                    disabled={isUpdating || isDeleting}
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(store.id)}
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
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingStore ? '가게 수정' : '가게 추가'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Store Name */}
              <div className="form-control w-full mb-4">
                <label htmlFor="name" className="label">
                  <span className="label-text">가게 이름</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="우리 금은방"
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
                  <span className="label-text">가게 설명</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`textarea textarea-bordered w-full ${formErrors.description ? 'textarea-error' : ''}`}
                  placeholder="최고의 품질로 고객님을 찾아갑니다"
                  rows={3}
                />
                {formErrors.description && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.description}</span>
                  </label>
                )}
              </div>

              {/* Address */}
              <div className="form-control w-full mb-4">
                <label htmlFor="address" className="label">
                  <span className="label-text">주소</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.address ? 'input-error' : ''}`}
                  placeholder="서울시 강남구 테헤란로 123"
                />
                {formErrors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.address}</span>
                  </label>
                )}
              </div>

              {/* Phone */}
              <div className="form-control w-full mb-4">
                <label htmlFor="phone" className="label">
                  <span className="label-text">전화번호</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.phone ? 'input-error' : ''}`}
                  placeholder="010-1234-5678"
                />
                {formErrors.phone && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.phone}</span>
                  </label>
                )}
              </div>

              {/* Business Hours */}
              <div className="form-control w-full mb-4">
                <label htmlFor="business_hours" className="label">
                  <span className="label-text">영업 시간</span>
                </label>
                <input
                  id="business_hours"
                  name="business_hours"
                  type="text"
                  value={formData.business_hours}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.business_hours ? 'input-error' : ''}`}
                  placeholder="평일 09:00-18:00, 주말 휴무"
                />
                {formErrors.business_hours && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.business_hours}</span>
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
                    ? editingStore
                      ? '수정 중...'
                      : '추가 중...'
                    : editingStore
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
