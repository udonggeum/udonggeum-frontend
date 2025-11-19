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
  region: string;
  district: string;
  address: string;
  phone_number: string;
  image_url: string;
  description: string;
  open_time: string;
  close_time: string;
}

// 한국 시·도 목록
const REGIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
];

export default function SellerStoresPage() {
  const { data: stores, isLoading, isError, error } = useSellerStores();
  const { mutate: createStore, isPending: isCreating } = useCreateStore();
  const { mutate: updateStore, isPending: isUpdating } = useUpdateStore();
  const { mutate: deleteStore, isPending: isDeleting } = useDeleteStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    region: '',
    district: '',
    address: '',
    phone_number: '',
    image_url: '',
    description: '',
    open_time: '',
    close_time: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof StoreFormData, string>>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      district: '',
      address: '',
      phone_number: '',
      image_url: '',
      description: '',
      open_time: '',
      close_time: '',
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
      region: store.region || '',
      district: store.district || '',
      address: store.address || '',
      phone_number: store.phone_number || '',
      image_url: store.image_url || '',
      description: store.description || '',
      open_time: store.open_time || '',
      close_time: store.close_time || '',
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name as keyof StoreFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof StoreFormData, string>> = {};

    if (!formData.name.trim()) errors.name = '가게 이름을 입력하세요';
    if (!formData.region.trim()) errors.region = '시·도를 선택하세요';
    if (!formData.district.trim()) errors.district = '구·군을 입력하세요';

    if (formData.phone_number && !/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone_number)) {
      errors.phone_number = '올바른 전화번호 형식이 아닙니다';
    }

    if (formData.image_url && formData.image_url.trim() && !/^https?:\/\/.+/.test(formData.image_url)) {
      errors.image_url = '올바른 URL 형식이 아닙니다';
    }

    if (formData.open_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.open_time)) {
      errors.open_time = '올바른 시간 형식이 아닙니다 (예: 09:00)';
    }

    if (formData.close_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.close_time)) {
      errors.close_time = '올바른 시간 형식이 아닙니다 (예: 20:00)';
    }

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
        region: formData.region,
        district: formData.district,
        address: formData.address || undefined,
        phone_number: formData.phone_number || undefined,
        image_url: formData.image_url || undefined,
        description: formData.description || undefined,
        open_time: formData.open_time || undefined,
        close_time: formData.close_time || undefined,
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
        region: formData.region,
        district: formData.district,
        address: formData.address || undefined,
        phone_number: formData.phone_number || undefined,
        image_url: formData.image_url || undefined,
        description: formData.description || undefined,
        open_time: formData.open_time || undefined,
        close_time: formData.close_time || undefined,
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
                {store.description && (
                  <p className="text-base-content/70 text-sm mb-4">
                    {store.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {(store.region || store.district || store.address) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {[store.region, store.district, store.address]
                          .filter(Boolean)
                          .join(' ')}
                      </span>
                    </div>
                  )}
                  {store.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{store.phone_number}</span>
                    </div>
                  )}
                  {(store.open_time || store.close_time) && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {store.open_time && store.close_time
                          ? `${store.open_time} - ${store.close_time}`
                          : store.open_time || store.close_time}
                      </span>
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
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {editingStore ? '가게 수정' : '가게 추가'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Store Name */}
              <div className="form-control w-full mb-4">
                <label htmlFor="name" className="label">
                  <span className="label-text">가게 이름 <span className="text-error">*</span></span>
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

              {/* Region */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control w-full">
                  <label htmlFor="region" className="label">
                    <span className="label-text">시·도 <span className="text-error">*</span></span>
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className={`select select-bordered w-full ${formErrors.region ? 'select-error' : ''}`}
                  >
                    <option value="">선택하세요</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {formErrors.region && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.region}</span>
                    </label>
                  )}
                </div>

                {/* District */}
                <div className="form-control w-full">
                  <label htmlFor="district" className="label">
                    <span className="label-text">구·군 <span className="text-error">*</span></span>
                  </label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${formErrors.district ? 'input-error' : ''}`}
                    placeholder="강남구"
                  />
                  {formErrors.district && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.district}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="form-control w-full mb-4">
                <label htmlFor="address" className="label">
                  <span className="label-text">상세 주소</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.address ? 'input-error' : ''}`}
                  placeholder="테헤란로 123"
                />
                {formErrors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.address}</span>
                  </label>
                )}
              </div>

              {/* Phone */}
              <div className="form-control w-full mb-4">
                <label htmlFor="phone_number" className="label">
                  <span className="label-text">전화번호</span>
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className={`input input-bordered w-full ${formErrors.phone_number ? 'input-error' : ''}`}
                  placeholder="010-1234-5678"
                />
                {formErrors.phone_number && (
                  <label className="label">
                    <span className="label-text-alt text-error">{formErrors.phone_number}</span>
                  </label>
                )}
              </div>

              {/* Business Hours */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control w-full">
                  <label htmlFor="open_time" className="label">
                    <span className="label-text">오픈 시간</span>
                  </label>
                  <input
                    id="open_time"
                    name="open_time"
                    type="text"
                    value={formData.open_time}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${formErrors.open_time ? 'input-error' : ''}`}
                    placeholder="09:00"
                  />
                  {formErrors.open_time && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.open_time}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label htmlFor="close_time" className="label">
                    <span className="label-text">마감 시간</span>
                  </label>
                  <input
                    id="close_time"
                    name="close_time"
                    type="text"
                    value={formData.close_time}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${formErrors.close_time ? 'input-error' : ''}`}
                    placeholder="20:00"
                  />
                  {formErrors.close_time && (
                    <label className="label">
                      <span className="label-text-alt text-error">{formErrors.close_time}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div className="form-control w-full mb-4">
                <label htmlFor="image_url" className="label">
                  <span className="label-text">매장 이미지 URL</span>
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="text"
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
