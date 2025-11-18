/**
 * AddressFormModal Component
 * Modal for adding or editing delivery addresses
 */

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { AddToAddressRequestSchema, type Address } from '@/schemas/address';
import { useAddAddress, useUpdateAddress } from '@/hooks/queries';

interface FormErrors {
  name?: string;
  recipient?: string;
  phone?: string;
  zip_code?: string;
  address?: string;
  detail_address?: string;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  address?: Address | null; // If provided, edit mode
  onSuccess?: () => void;
}

export default function AddressFormModal({
  isOpen,
  onClose,
  address,
  onSuccess,
}: AddressFormModalProps) {
  const isEditMode = !!address;
  const { mutate: addAddress, isPending: isAdding } = useAddAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const [formData, setFormData] = useState({
    name: address?.name || '',
    recipient: address?.recipient || '',
    phone: address?.phone || '',
    zip_code: address?.zip_code || '',
    address: address?.address || '',
    detail_address: address?.detail_address || '',
    is_default: address?.is_default || false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const isPending = isAdding || isUpdating;

  // Reset form when modal opens/closes or address changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: address?.name || '',
        recipient: address?.recipient || '',
        phone: address?.phone || '',
        zip_code: address?.zip_code || '',
        address: address?.address || '',
        detail_address: address?.detail_address || '',
        is_default: address?.is_default || false,
      });
      setFormErrors({});
      setTouched({});
      setApiError(null);
    }
  }, [isOpen, address]);

  /**
   * Validate a single field
   */
  const validateField = (name: string, value: string | boolean): string | undefined => {
    try {
      if (name === 'name') {
        AddToAddressRequestSchema.pick({ name: true }).parse({ name: value });
      } else if (name === 'recipient') {
        AddToAddressRequestSchema.pick({ recipient: true }).parse({ recipient: value });
      } else if (name === 'phone') {
        AddToAddressRequestSchema.pick({ phone: true }).parse({ phone: value });
      } else if (name === 'zip_code') {
        AddToAddressRequestSchema.pick({ zip_code: true }).parse({ zip_code: value });
      } else if (name === 'address') {
        AddToAddressRequestSchema.pick({ address: true }).parse({ address: value });
      } else if (name === 'detail_address') {
        AddToAddressRequestSchema.pick({ detail_address: true }).parse({ detail_address: value });
      }
      return undefined;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'issues' in err) {
        const issues = (err as { issues: Array<{ message: string }> }).issues;
        if (issues && issues.length > 0) {
          return issues[0].message;
        }
      }
      return '유효하지 않은 값입니다.';
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    const nameError = validateField('name', formData.name);
    if (nameError) {
      errors.name = nameError;
      isValid = false;
    }

    const recipientError = validateField('recipient', formData.recipient);
    if (recipientError) {
      errors.recipient = recipientError;
      isValid = false;
    }

    const phoneError = validateField('phone', formData.phone);
    if (phoneError) {
      errors.phone = phoneError;
      isValid = false;
    }

    const addressError = validateField('address', formData.address);
    if (addressError) {
      errors.address = addressError;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field if touched
    if (touched[name]) {
      const error = validateField(name, type === 'checkbox' ? checked! : value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  /**
   * Handle input blur
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, type === 'checkbox' ? checked! : value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      recipient: true,
      phone: true,
      zip_code: true,
      address: true,
      detail_address: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit
    if (isEditMode && address) {
      updateAddress(
        { id: address.id, data: formData },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
          onError: (error) => {
            setApiError(error instanceof Error ? error.message : '주소 수정에 실패했습니다.');
          },
        }
      );
    } else {
      addAddress(formData, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          setApiError(error instanceof Error ? error.message : '주소 추가에 실패했습니다.');
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEditMode ? '배송지 수정' : '배송지 추가'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={isPending}
          >
            <X size={20} />
          </button>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="alert alert-error mb-4">
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 배송지명 */}
          <div className="form-control">
            <label htmlFor="name" className="label">
              <span className="label-text">배송지명</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="예: 집, 회사"
              className={`input input-bordered ${touched.name && formErrors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
            />
            {touched.name && formErrors.name && (
              <label className="label">
                <span className="label-text-alt text-error">{formErrors.name}</span>
              </label>
            )}
          </div>

          {/* 받는 사람 */}
          <div className="form-control">
            <label htmlFor="recipient" className="label">
              <span className="label-text">받는 사람</span>
            </label>
            <input
              id="recipient"
              name="recipient"
              type="text"
              placeholder="홍길동"
              className={`input input-bordered ${touched.recipient && formErrors.recipient ? 'input-error' : ''}`}
              value={formData.recipient}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
            />
            {touched.recipient && formErrors.recipient && (
              <label className="label">
                <span className="label-text-alt text-error">{formErrors.recipient}</span>
              </label>
            )}
          </div>

          {/* 전화번호 */}
          <div className="form-control">
            <label htmlFor="phone" className="label">
              <span className="label-text">전화번호</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="010-1234-5678"
              className={`input input-bordered ${touched.phone && formErrors.phone ? 'input-error' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
            />
            {touched.phone && formErrors.phone && (
              <label className="label">
                <span className="label-text-alt text-error">{formErrors.phone}</span>
              </label>
            )}
          </div>

          {/* 우편번호 */}
          <div className="form-control">
            <label htmlFor="zip_code" className="label">
              <span className="label-text">우편번호 (선택)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="zip_code"
                name="zip_code"
                type="text"
                placeholder="12345"
                maxLength={5}
                className={`input input-bordered flex-1 ${touched.zip_code && formErrors.zip_code ? 'input-error' : ''}`}
                value={formData.zip_code}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isPending}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => alert('우편번호 검색 기능은 추후 추가될 예정입니다.')}
                disabled={isPending}
              >
                우편번호 검색
              </button>
            </div>
            {touched.zip_code && formErrors.zip_code && (
              <label className="label">
                <span className="label-text-alt text-error">{formErrors.zip_code}</span>
              </label>
            )}
          </div>

          {/* 기본 주소 */}
          <div className="form-control">
            <label htmlFor="address" className="label">
              <span className="label-text">기본 주소</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="서울시 강남구 테헤란로 123"
              className={`input input-bordered ${touched.address && formErrors.address ? 'input-error' : ''}`}
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
            />
            {touched.address && formErrors.address && (
              <label className="label">
                <span className="label-text-alt text-error">{formErrors.address}</span>
              </label>
            )}
          </div>

          {/* 상세 주소 */}
          <div className="form-control">
            <label htmlFor="detail_address" className="label">
              <span className="label-text">상세 주소 (선택)</span>
            </label>
            <input
              id="detail_address"
              name="detail_address"
              type="text"
              placeholder="동/호수, 건물명 등"
              className={`input input-bordered ${touched.detail_address && formErrors.detail_address ? 'input-error' : ''}`}
              value={formData.detail_address}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
            />
            {touched.detail_address && formErrors.detail_address && (
              <label className="label">
                <span className="label-text-alt text-error">{formErrors.detail_address}</span>
              </label>
            )}
          </div>

          {/* 기본 배송지 설정 */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                name="is_default"
                className="checkbox checkbox-primary"
                checked={formData.is_default}
                onChange={handleChange}
                disabled={isPending}
              />
              <span className="label-text">기본 배송지로 설정</span>
            </label>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {isEditMode ? '수정 중...' : '추가 중...'}
                </>
              ) : (
                <>{isEditMode ? '수정' : '추가'}</>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
