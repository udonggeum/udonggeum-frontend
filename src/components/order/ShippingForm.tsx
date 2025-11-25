import { MapPin } from 'lucide-react';
import { Button } from '@/components';

interface SavedAddress {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  saveAsDefault: boolean;
}

interface ShippingFormState {
  recipient: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  saveAsDefault: boolean;
}

interface ShippingFormProps {
  savedAddresses: SavedAddress[];
  selectedAddressId: string;
  shippingForm: ShippingFormState;
  formErrors: Record<string, string>;
  isAddingAddress: boolean;
  onAddressSelect: (addressId: string) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldBlur: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddNewAddress: () => void;
}

/**
 * ShippingForm component
 * Handles shipping address selection and input
 *
 * Extracted from OrderPage.tsx lines 1021-1186
 */
export function ShippingForm({
  savedAddresses,
  selectedAddressId,
  shippingForm,
  formErrors,
  isAddingAddress,
  onAddressSelect,
  onInputChange,
  onFieldBlur,
  onAddNewAddress,
}: ShippingFormProps) {
  return (
    <section className="pb-8 border-b border-[var(--color-text)]/10">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-[var(--color-gold)]" />
        <div>
          <p className="text-sm text-[var(--color-text)]/60">배송지</p>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">배송지 정보</h2>
        </div>
      </div>

      {/* 저장된 배송지 선택 드롭다운 (있을 경우) */}
      {savedAddresses.length > 0 && (
        <div className="mb-4">
          <label className="form-control w-full">
            <span className="label-text text-sm text-[var(--color-text)]">저장된 배송지</span>
            <select
              className="select w-full bg-[var(--color-primary)] border-[var(--color-gold)]/30 focus:border-[var(--color-gold)] text-[var(--color-text)]"
              value={selectedAddressId}
              onChange={(event) => onAddressSelect(event.target.value)}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {savedAddresses.map((address) => (
                <option
                  key={address.id}
                  value={address.id}
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text)' }}
                >
                  {address.label}
                </option>
              ))}
              <option
                value="manual"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text)' }}
              >
                새 배송지로 입력하기
              </option>
            </select>
          </label>
        </div>
      )}

      {/* 입력 폼은 항상 표시 */}
      <>
        {/* 수령인 / 연락처 - 1:1 비율 */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text text-sm text-[var(--color-text)]">수령인</span>
            <input
              type="text"
              name="recipient"
              className={`input ${formErrors.recipient ? 'input-error' : 'bg-[var(--color-text)]/5 border-[var(--color-gold)]/30 focus:border-[var(--color-gold)]'} text-[var(--color-text)] placeholder:text-[var(--color-text)]/40`}
              placeholder="홍길동"
              value={shippingForm.recipient}
              onChange={onInputChange}
              onBlur={onFieldBlur}
              aria-describedby="recipient-error"
            />
            {formErrors.recipient && (
              <span id="recipient-error" className="label-text-alt text-error">
                {formErrors.recipient}
              </span>
            )}
          </label>
          <label className="form-control">
            <span className="label-text text-sm text-[var(--color-text)]">연락처</span>
            <input
              type="tel"
              name="phone"
              className={`input ${formErrors.phone ? 'input-error' : 'bg-[var(--color-text)]/5 border-[var(--color-gold)]/30 focus:border-[var(--color-gold)]'} text-[var(--color-text)] placeholder:text-[var(--color-text)]/40`}
              placeholder="010-1234-5678"
              value={shippingForm.phone}
              onChange={onInputChange}
              onBlur={onFieldBlur}
              aria-describedby="phone-error"
            />
            {formErrors.phone && (
              <span id="phone-error" className="label-text-alt text-error">
                {formErrors.phone}
              </span>
            )}
          </label>
        </div>

        {/* 우편번호 + 검색버튼 */}
        <div className="mt-4">
          <label className="form-control w-full">
            <span className="label-text text-sm text-[var(--color-text)]">우편번호</span>
            <div className="flex gap-2">
              <input
                type="text"
                name="postalCode"
                className={`input flex-1 ${formErrors.postalCode ? 'input-error' : 'bg-[var(--color-text)]/5 border-[var(--color-gold)]/30 focus:border-[var(--color-gold)]'} text-[var(--color-text)] placeholder:text-[var(--color-text)]/40`}
                placeholder="00000"
                value={shippingForm.postalCode}
                onChange={onInputChange}
                onBlur={onFieldBlur}
                aria-describedby="postal-error"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  alert('우편번호 검색 서비스는 추후 연동 예정입니다.');
                }}
              >
                우편번호 검색
              </Button>
            </div>
            {formErrors.postalCode && (
              <span id="postal-error" className="label-text-alt text-error">
                {formErrors.postalCode}
              </span>
            )}
          </label>
        </div>

        {/* 도로명 주소 / 상세 주소 - 1:1 비율 */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="form-control">
            <span className="label-text text-sm text-[var(--color-text)]">도로명 주소</span>
            <input
              type="text"
              name="address1"
              className={`input ${formErrors.address1 ? 'input-error' : 'bg-[var(--color-text)]/5 border-[var(--color-gold)]/30 focus:border-[var(--color-gold)]'} text-[var(--color-text)] placeholder:text-[var(--color-text)]/40`}
              placeholder="도로명 주소"
              value={shippingForm.address1}
              onChange={onInputChange}
              onBlur={onFieldBlur}
              aria-describedby="address1-error"
            />
            {formErrors.address1 && (
              <span id="address1-error" className="label-text-alt text-error">
                {formErrors.address1}
              </span>
            )}
          </label>
          <label className="form-control">
            <span className="label-text text-sm text-[var(--color-text)]">상세 주소</span>
            <input
              type="text"
              name="address2"
              className="input bg-[var(--color-text)]/5 border-[var(--color-gold)]/30 focus:border-[var(--color-gold)] text-[var(--color-text)] placeholder:text-[var(--color-text)]/40"
              placeholder="동/호수, 배송 참고사항"
              value={shippingForm.address2}
              onChange={onInputChange}
            />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            name="saveAsDefault"
            className="checkbox border-[var(--color-gold)]/50 [--chkbg:var(--color-gold)] [--chkfg:var(--color-primary)]"
            checked={shippingForm.saveAsDefault}
            onChange={onInputChange}
          />
          기본 배송지로 저장
        </label>

        {/* 새 배송지 추가 버튼 (새 배송지 입력 모드일 때만) */}
        {selectedAddressId === 'manual' && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={onAddNewAddress}
            disabled={isAddingAddress}
            loading={isAddingAddress}
          >
            새 배송지 추가
          </Button>
        )}
      </>
    </section>
  );
}
