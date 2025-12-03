/**
 * AddressManagementPage Component
 *
 * Allows authenticated users to manage their delivery addresses.
 * Features:
 * - List all saved addresses
 * - Add new address
 * - Edit existing address
 * - Delete address (with optimistic update)
 * - Set default address
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/queries';
import {
  Navbar,
  Footer,
  LoadingSpinner,
  ErrorAlert,
  AddressFormModal,
  Button,
} from '@/components';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import type { Address } from '@/schemas/address';

export default function AddressManagementPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    data: addressesData,
    isLoading,
    error,
    refetch,
  } = useAddresses();
  const { mutate: deleteAddress } = useDeleteAddress();
  const { mutate: setDefaultAddress } = useSetDefaultAddress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      void navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const addresses = addressesData?.addresses || [];

  /**
   * Handle opening add address modal
   */
  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  /**
   * Handle opening edit address modal
   */
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  /**
   * Handle delete address
   */
  const handleDeleteAddress = (id: number) => {
    if (window.confirm('이 배송지를 삭제하시겠습니까?')) {
      deleteAddress(id);
    }
  };

  /**
   * Handle set default address
   */
  const handleSetDefaultAddress = (id: number) => {
    setDefaultAddress(id);
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  /**
   * Handle modal success
   */
  const handleModalSuccess = () => {
    void refetch();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigationItems={NAVIGATION_ITEMS} />

      <main className="flex-grow">
        <section className="container mx-auto px-4 py-10">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">배송지 관리</h1>
              <p className="mt-2 text-[var(--color-text)]/70">
                배송지를 추가하고 관리하세요
              </p>
            </div>
            <Button onClick={handleAddAddress}
              variant="primary" className="gap-2"
            >
              <Plus size={20} />
              배송지 추가
            </Button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-20">
              <ErrorAlert
                title="배송지 목록을 불러올 수 없습니다"
                message={
                  error instanceof Error
                    ? error.message
                    : '알 수 없는 오류가 발생했습니다.'
                }
              />
              <Button onClick={() => {
                  void refetch();
                }}
                variant="primary"
                className="mt-6"
              >
                다시 시도
              </Button>
            </div>
          ) : addresses.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-xl bg-[var(--color-secondary)] py-20 text-center">
              <MapPin size={64} className="text-[var(--color-text)]/30 mb-6" />
              <h2 className="text-xl font-semibold mb-2">
                등록된 배송지가 없습니다
              </h2>
              <p className="text-[var(--color-text)]/70 mb-6">
                새로운 배송지를 추가해보세요
              </p>
              <Button onClick={handleAddAddress}
                variant="primary" className="gap-2"
              >
                <Plus size={20} />
                배송지 추가
              </Button>
            </div>
          ) : (
            /* Address List */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {addresses.map((address) => (
                <div key={address.id} className="relative">
                  {/* Badge for default address - outside card */}
                  {address.is_default && (
                    <div className="absolute -top-2 left-4 z-10">
                      <div className="badge badge-primary gap-1 shadow-md">
                        <Star size={12} fill="currentColor" />
                        기본 배송지
                      </div>
                    </div>
                  )}

                  <div
                    className={`card bg-[var(--color-secondary)] shadow-sm ${
                      address.is_default ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="card-body">
                      {/* Address Name */}
                      <h3 className="card-title text-lg">{address.name}</h3>

                    {/* Address Details */}
                    <div className="space-y-1 text-sm text-[var(--color-text)]/70">
                      <p>{address.recipient}</p>
                      <p>{address.phone}</p>
                      <div className="mt-2">
                        {address.zip_code && <p className="text-xs">({address.zip_code})</p>}
                        <p>{address.address}</p>
                        {address.detail_address && <p>{address.detail_address}</p>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="card-actions justify-end mt-4">
                      {!address.is_default && (
                        <Button onClick={() => handleSetDefaultAddress(address.id)}
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                        >
                          <Star size={16} />
                          기본 배송지로 설정
                        </Button>
                      )}
                      <Button onClick={() => handleEditAddress(address)}
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                      >
                        <Edit size={16} />
                        수정
                      </Button>
                      <Button onClick={() => handleDeleteAddress(address.id)}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-error hover:bg-error/10"
                      >
                        <Trash2 size={16} />
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        address={editingAddress}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
