import { useRef, useState } from 'react';
import { FiUpload } from 'react-icons/fi';

export function ImageUploadZone({
  value,
  onChange,
  onFileSelect,
}: {
  value: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onChange(previewUrl);
    onFileSelect?.(file);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    await handleFile(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        className={`upload-zone rounded-2xl p-6 text-center cursor-pointer transition-all ${drag ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-36 w-full object-cover rounded-xl mx-auto"
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">
                Click to change
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-gold-500 flex justify-center mb-3">
              <FiUpload />
            </div>
            <p className="text-sm font-bold text-maroon-900">
              Drop image here or click to browse
            </p>
            <p className="text-xs text-maroon-700/60 mt-1">PNG, JPG, WebP</p>
          </div>
        )}
      </div>
    </div>
  );
}
