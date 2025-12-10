import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Plus, DollarSign, Star, Shield, Clock } from 'lucide-react';
import type { StoreDetail } from '@/services/stores';

export type StoreEditType = 'tags' | 'image';
export type TagCategoryKey = 'buy' | 'service' | 'trust' | 'age' | 'all';

interface StoreEditModalProps {
  store: StoreDetail;
  editType: StoreEditType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving?: boolean;
  tagCategoryKey?: TagCategoryKey; // ⭐ 추가됨
}

export default function StoreEditModal({
  store,
  editType,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  tagCategoryKey = 'all', // 기본값: 전체
}: StoreEditModalProps) {
  const [formData, setFormData] = useState({
    name: store.name || '',
    description: store.description || '',
    address: store.address || '',
    phone_number: store.phone_number || store.phone || '',
    tags: (store as any).tags || [],
    image_url: store.image_url || '',
  });

  const [customTagInput, setCustomTagInput] = useState('');

  // ⭐ 태그 카테고리 key 추가됨
  const tagCategories = [
    {
      key: 'buy' as const,
      icon: DollarSign,
      title: '매입 품목',
      tags: ['금 매입', '백금 매입', '은 매입', '다이아몬드 매입'],
    },
    {
      key: 'service' as const,
      icon: Star,
      title: '서비스 특징',
      tags: ['친절한 상담', '빠른 응답', '합리적 가격', '정확한 감정'],
    },
    {
      key: 'trust' as const,
      icon: Shield,
      title: '신뢰',
      tags: ['투명거래', '안전거래', '정품보증', '공정감정'],
    },
    {
      key: 'age' as const,
      icon: Clock,
      title: '매장 나이',
      tags: ['신생 매장', '10년 전통', '20년 전통', '30년 전통'],
    },
  ];

  // ⭐ 연필 누른 섹션만 렌더링하도록 필터링
  const visibleTagCategories =
    tagCategoryKey === 'all'
      ? tagCategories
      : tagCategories.filter((c) => c.key === tagCategoryKey);

  // 모달 열릴 때 store 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        address: store.address || '',
        phone_number: store.phone_number || store.phone || '',
        tags: (store as any).tags || [],
        image_url: store.image_url || '',
      });
      setCustomTagInput('');
    }
  }, [isOpen, store]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      name: formData.name,
      region: store.region || '',
      district: store.district || '',
      description: formData.description,
      address: formData.address,
      phone: formData.phone_number,
      phone_number: formData.phone_number,
      tags: formData.tags,
      image_url: formData.image_url,
    };

    onSave(dataToSave);
  };

  const toggleTag = (tag: string) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];

    setFormData({ ...formData, tags: newTags });
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;

    const currentTags = formData.tags || [];
    if (currentTags.includes(trimmed)) {
      alert('이미 추가된 태그입니다.');
      return;
    }

    setFormData({ ...formData, tags: [...currentTags, trimmed] });
    setCustomTagInput('');
  };

  const removeTag = (tag: string) => {
    const currentTags = formData.tags || [];
    setFormData({ ...formData, tags: currentTags.filter((t: string) => t !== tag) });
  };

  const getModalTitle = () => {
    switch (editType) {
      case 'tags':
        return '매장 태그 수정';
      case 'image':
        return '매장 이미지 수정';
      default:
        return '정보 수정';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">

            {/* TAG EDIT */}
            {editType === 'tags' && (
              <div className="space-y-5">

                <label className="block text-sm font-medium text-gray-700 mb-3">
                  매장 태그를 선택해주세요
                </label>

                {/* ⭐ 특정 섹션만 */}
                <div className="space-y-4">
                  {visibleTagCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.key}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <h4 className="text-sm font-semibold text-gray-700">{category.title}</h4>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {category.tags.map((tag: string) => {
                            const isSelected = (formData.tags || []).includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-yellow-400 text-gray-900'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Tag */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-700">직접입력</h4>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomTag();
                          }
                        }}
                        placeholder="태그를 입력하세요"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                      <button
                        type="button"
                        onClick={addCustomTag}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected tags */}
                {formData.tags?.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      선택된 태그 ({formData.tags.length}개)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-400 text-gray-900 text-sm font-medium rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-yellow-500 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* IMAGE EDIT */}
            {editType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매장 이미지
                </label>

                {formData.image_url ? (
                  <div className="mb-4">
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt="매장 이미지"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">이미지를 선택해주세요</p>
                      </div>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>이미지 선택</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                <p className="mt-2 text-xs text-gray-500 text-center">
                  JPG, PNG, GIF 파일 (최대 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors"
              disabled={isSaving}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
