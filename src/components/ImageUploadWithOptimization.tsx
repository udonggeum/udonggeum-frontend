/**
 * ImageUploadWithOptimization Component
 * Upload image with optional OpenAI optimization
 */

import { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, X, Check, Info } from 'lucide-react';
import { useUploadImage, useOptimizeImage } from '@/hooks/queries';
import type { ProductAnalysis } from '@/schemas/image';

interface ImageUploadWithOptimizationProps {
  onImageSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
  showOptimization?: boolean; // Whether to show AI optimization features (default: true)
  label?: string; // Label text (default: "상품 이미지")
  uploadType?: 'store' | 'product'; // Upload folder type (default: "product")
}

export default function ImageUploadWithOptimization({
  onImageSelect,
  currentImageUrl,
  showOptimization = true,
  label = '상품 이미지',
  uploadType = 'product',
}: ImageUploadWithOptimizationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [optimizedUrl, setOptimizedUrl] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);

  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();
  const { mutate: optimizeImage, isPending: isOptimizing } = useOptimizeImage();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setOptimizedUrl('');
      setShowComparison(false);

      // Auto-upload if optimization is disabled (simple mode)
      if (!showOptimization) {
        uploadImage({ file, uploadType }, {
          onSuccess: (fileUrl) => {
            console.log('[Upload] S3 upload successful, file URL:', fileUrl);
            onImageSelect(fileUrl);
            setPreviewUrl(fileUrl);
          },
          onError: (error) => {
            alert(`이미지 업로드 실패: ${error.message}`);
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNormalUpload = () => {
    if (!selectedFile) return;

    uploadImage({ file: selectedFile, uploadType }, {
      onSuccess: (fileUrl) => {
        console.log('[Upload] S3 upload successful, file URL:', fileUrl);
        onImageSelect(fileUrl);
        setPreviewUrl(fileUrl);
        alert('이미지가 업로드되었습니다.');
      },
      onError: (error) => {
        alert(`이미지 업로드 실패: ${error.message}`);
      },
    });
  };

  const handleOptimize = () => {
    if (!selectedFile) return;

    optimizeImage(
      {
        file: selectedFile,
        targetWidth: 800,
        targetHeight: 800,
        prompt: customPrompt || undefined,
      },
      {
        onSuccess: (data) => {
          console.log('Optimization response:', data);
          setPreviewUrl(data.original_url);
          setOptimizedUrl(data.optimized_url);
          setProductAnalysis(data.product_analysis || null);
          setShowComparison(true);
        },
        onError: (error) => {
          console.error('Optimization error:', error);
          alert(`이미지 최적화 실패: ${error.message}`);
        },
      }
    );
  };

  const handleSelectOriginal = () => {
    if (previewUrl) {
      onImageSelect(previewUrl);
      setShowComparison(false);
    }
  };

  const handleSelectOptimized = () => {
    if (optimizedUrl) {
      onImageSelect(optimizedUrl);
      setShowComparison(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || '');
    setOptimizedUrl('');
    setShowComparison(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">{label}</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input file-input-bordered w-full"
        />

        <label className="label">
          <span className="label-text-alt text-[var(--color-text)]/60">
            JPG, PNG, GIF 형식 (최대 10MB)
          </span>
        </label>
      </div>

      {/* Simple Mode: Show upload status or uploaded thumbnail */}
      {!showOptimization && previewUrl && (
        <div className="flex items-center gap-3 p-3 bg-[var(--color-secondary)] rounded-lg border border-[var(--color-text)]/10">
          {isUploading ? (
            <>
              <div className="loading loading-spinner loading-md text-primary"></div>
              <span className="text-sm text-[var(--color-text)]">업로드 중...</span>
            </>
          ) : (
            <>
              <img
                src={previewUrl}
                alt="Uploaded"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  업로드 완료
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
                변경
              </button>
            </>
          )}
        </div>
      )}

      {/* Preview with Optimization Options */}
      {showOptimization && previewUrl && !showComparison && (
        <div className="card bg-[var(--color-secondary)] shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                미리보기
              </h3>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
                초기화
              </button>
            </div>

            <div className="w-full flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>

            {/* Additional Description for AI Optimization */}
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text text-sm">악세서리 설명 (선택)</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="textarea textarea-bordered w-full text-sm"
                placeholder="예: 18K 골드 반지, 다이아몬드 3개 박힌 디자인"
                rows={2}
              />
              <label className="label">
                <span className="label-text-alt text-[var(--color-text)]/60">
                  설명을 추가하면 AI가 더 정확하게 보정합니다
                </span>
              </label>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleNormalUpload}
                disabled={isUploading || isOptimizing}
                className="btn btn-outline flex-1 gap-2"
              >
                <Upload className="w-5 h-5" />
                {isUploading ? '업로드 중...' : '일반 업로드'}
              </button>
              <button
                type="button"
                onClick={handleOptimize}
                disabled={isUploading || isOptimizing}
                className="btn btn-primary flex-1 gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isOptimizing ? '보정 중...' : 'AI 자동 보정'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison View */}
      {showComparison && optimizedUrl && (
        <div className="card bg-[var(--color-secondary)] shadow-sm">
          <div className="card-body">
            <h3 className="font-semibold mb-4">이미지 비교</h3>

            {/* Product Analysis Info */}
            {productAnalysis && (
              <div className="alert alert-info mb-4">
                <Info className="w-5 h-5" />
                <div className="text-sm">
                  {productAnalysis.product_type && (
                    <div className="font-semibold">AI 분석 결과: {productAnalysis.product_type}</div>
                  )}
                  {productAnalysis.design_features && productAnalysis.design_features.length > 0 && (
                    <div className="mt-1">
                      <span className="font-medium">디자인 특징:</span>{' '}
                      {productAnalysis.design_features.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <div className="text-center font-medium">원본</div>
                <div className="border-2 border-base-300 rounded-lg p-2 bg-[var(--color-primary)]">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="w-full h-48 object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectOriginal}
                  className="btn btn-outline btn-sm w-full gap-2"
                >
                  <Check className="w-4 h-4" />
                  원본 선택
                </button>
              </div>

              {/* Optimized */}
              <div className="space-y-2">
                <div className="text-center font-medium flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI 보정
                </div>
                <div className="border-2 border-primary rounded-lg p-2 bg-[var(--color-primary)]">
                  <img
                    src={optimizedUrl}
                    alt="Optimized"
                    className="w-full h-48 object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectOptimized}
                  className="btn btn-primary btn-sm w-full gap-2"
                >
                  <Check className="w-4 h-4" />
                  보정된 이미지 선택
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-ghost btn-sm flex-1"
              >
                다시 선택
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
