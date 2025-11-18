import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressService } from '@/services/address';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  AddToAddressRequest,
  UpdateAddressRequest,
} from '@/schemas/address';

/**
 * Address Query Keys Factory
 * Centralized query key management for address-related queries
 */
export const addressKeys = {
  all: ['addresses'] as const,
  lists: () => [...addressKeys.all, 'list'] as const,
};

/**
 * useAddresses query
 * Fetches user's delivery addresses
 * Only enabled when user is authenticated
 *
 * @example
 * const { data, isLoading } = useAddresses();
 * // data.addresses: Address[]
 */
export function useAddresses() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: addressKeys.lists(),
    queryFn: () => addressService.getAddresses(),
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useAddAddress mutation
 * Adds new delivery address
 *
 * @example
 * const { mutate: addAddress, isPending } = useAddAddress();
 * addAddress({ name: '집', recipient: '홍길동', phone: '010-1234-5678', address: '서울시 강남구', is_default: false });
 */
export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToAddressRequest) => addressService.addAddress(data),
    onSuccess: () => {
      // Invalidate and refetch addresses
      void queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}

/**
 * useUpdateAddress mutation
 * Updates existing delivery address
 *
 * @example
 * const { mutate: updateAddress, isPending } = useUpdateAddress();
 * updateAddress({ id: 123, data: { name: '회사' } });
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAddressRequest }) =>
      addressService.updateAddress(id, data),
    onSuccess: () => {
      // Invalidate and refetch addresses
      void queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}

/**
 * useDeleteAddress mutation
 * Deletes delivery address with optimistic update
 *
 * @example
 * const { mutate: deleteAddress, isPending } = useDeleteAddress();
 * deleteAddress(123);
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => addressService.deleteAddress(id),
    // Optimistic update
    onMutate: async (id: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: addressKeys.lists() });

      // Snapshot previous value
      const previousAddresses = queryClient.getQueryData(addressKeys.lists());

      // Optimistically update to remove address
      queryClient.setQueryData(addressKeys.lists(), (old: { addresses: Array<{ id: number }> } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          addresses: old.addresses.filter((address) => address.id !== id),
        };
      });

      // Return context with snapshot
      return { previousAddresses };
    },
    // On error, rollback to previous value
    onError: (_error, _id, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(addressKeys.lists(), context.previousAddresses);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}

/**
 * useSetDefaultAddress mutation
 * Sets address as default delivery address
 *
 * @example
 * const { mutate: setDefaultAddress, isPending } = useSetDefaultAddress();
 * setDefaultAddress(123);
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => addressService.setDefaultAddress(id),
    onSuccess: () => {
      // Invalidate and refetch addresses
      void queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
}
