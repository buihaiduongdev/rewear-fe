'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import {
  ListingChecklistModal,
  DraftSavedModal,
  SubmittedForReviewModal,
} from './SellerModals';

interface PhotoItem {
  id: string;
  url: string;
  name: string;
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  { id: '1', url: '/images/seller/photo-1.jpg', name: 'Front photo' },
  { id: '2', url: '/images/seller/photo-2.jpg', name: 'Texture detail' },
  { id: '3', url: '/images/seller/photo-3.jpg', name: 'Buttons & closures' },
  { id: '4', url: '/images/seller/photo-4.jpg', name: 'Brand label' },
];

export function SellerListingEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams?.get('id');

  // Form State
  const [title, setTitle] = React.useState('Lemaire wool coat');
  const [category, setCategory] = React.useState('Outerwear');
  const [size, setSize] = React.useState('M');
  const [condition, setCondition] = React.useState('Very good');
  const [price, setPrice] = React.useState('580.000₫');
  const [measurements, setMeasurements] = React.useState(
    'Chest 104 cm · Length 112 cm',
  );
  const [defects, setDefects] = React.useState(
    'No visible flaws or repairs declared',
  );
  const [photos, setPhotos] = React.useState<PhotoItem[]>(DEFAULT_PHOTOS);

  // Modals state
  const [checklistOpen, setChecklistOpen] = React.useState(false);
  const [draftSavedOpen, setDraftSavedOpen] = React.useState(false);
  const [submittedOpen, setSubmittedOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems: PhotoItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      newItems.push({
        id: `upload-${Date.now()}-${i}`,
        url: objectUrl,
        name: file.name,
      });
    }
    setPhotos((prev) => [...prev, ...newItems].slice(0, 8));
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const primaryPhotoUrl =
    photos.length > 0 ? photos[0].url : '/images/seller/preview.jpg';

  return (
    <div className="space-y-8">
      {/* Page Title: Figma 48:986 */}
      <h1 className="text-[32px] sm:text-[40px] font-semibold leading-[46px] tracking-[-0.02em]">
        {productId ? 'Edit listing' : 'Create listing'}
      </h1>

      {/* Main 2-Column Content: Figma 48:987 */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/* Left Column: Form (Figma 48:988) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Title Field: Figma 48:989 */}
          <div className="bg-rewear-soft flex flex-col justify-center px-4 py-3">
            <label
              htmlFor="listing-title"
              className="text-rewear-text text-sm font-semibold"
            >
              Title
            </label>
            <input
              id="listing-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lemaire wool coat"
              className="bg-transparent text-rewear-text text-base outline-none pt-1"
            />
          </div>

          {/* Category and Size: Figma 48:992 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-rewear-soft flex flex-col justify-center px-4 py-3">
              <label
                htmlFor="listing-category"
                className="text-rewear-text text-sm font-semibold"
              >
                Category
              </label>
              <select
                id="listing-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-rewear-text appearance-none text-base outline-none pt-1 cursor-pointer"
              >
                <option value="Outerwear">Outerwear</option>
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Dresses">Dresses</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div className="bg-rewear-soft flex flex-col justify-center px-4 py-3">
              <label
                htmlFor="listing-size"
                className="text-rewear-text text-sm font-semibold"
              >
                Size
              </label>
              <select
                id="listing-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="bg-transparent text-rewear-text appearance-none text-base outline-none pt-1 cursor-pointer"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="Free Size">Free Size</option>
              </select>
            </div>
          </div>

          {/* Condition and Price: Figma 48:999 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-rewear-soft flex flex-col justify-center px-4 py-3">
              <label
                htmlFor="listing-condition"
                className="text-rewear-text text-sm font-semibold"
              >
                Condition
              </label>
              <select
                id="listing-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="bg-transparent text-rewear-text appearance-none text-base outline-none pt-1 cursor-pointer"
              >
                <option value="Pristine">Pristine</option>
                <option value="Like new">Like new</option>
                <option value="Very good">Very good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="bg-rewear-soft flex flex-col justify-center px-4 py-3">
              <label
                htmlFor="listing-price"
                className="text-rewear-text text-sm font-semibold"
              >
                Price
              </label>
              <input
                id="listing-price"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="580.000₫"
                className="bg-transparent text-rewear-text text-base outline-none pt-1"
              />
            </div>
          </div>

          {/* Measurements: Figma 48:1006 */}
          <div className="bg-rewear-soft flex flex-col justify-center px-4 py-3">
            <label
              htmlFor="listing-measurements"
              className="text-rewear-text text-sm font-semibold"
            >
              Measurements
            </label>
            <input
              id="listing-measurements"
              type="text"
              value={measurements}
              onChange={(e) => setMeasurements(e.target.value)}
              placeholder="e.g. Chest 104 cm · Length 112 cm"
              className="bg-transparent text-rewear-text text-base outline-none pt-1"
            />
          </div>

          {/* Disclosed defects / repairs: Figma 48:1009 */}
          <div className="bg-rewear-soft flex flex-col justify-center px-4 py-3">
            <label
              htmlFor="listing-defects"
              className="text-rewear-text text-sm font-semibold"
            >
              Disclosed defects / repairs
            </label>
            <input
              id="listing-defects"
              type="text"
              value={defects}
              onChange={(e) => setDefects(e.target.value)}
              placeholder="e.g. No visible flaws or repairs declared"
              className="bg-transparent text-rewear-text text-base outline-none pt-1"
            />
          </div>

          {/* Photos Section: Figma 48:1012 */}
          <div className="space-y-4 pt-4">
            <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Photos
            </h2>

            {/* Photo Uploads Grid: Figma 48:1014 */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {photos.map((item) => (
                <div
                  key={item.id}
                  className="bg-rewear-soft group relative aspect-square w-full overflow-hidden"
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(item.id)}
                    className="bg-black/60 text-white hover:bg-black absolute top-2 right-2 p-1.5 opacity-0 transition group-hover:opacity-100"
                    aria-label={`Remove photo ${item.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {photos.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddPhotoClick}
                  className="border-rewear-border hover:border-rewear-text text-rewear-muted hover:text-rewear-text flex aspect-square w-full flex-col items-center justify-center gap-1.5 border border-dashed transition"
                >
                  <Plus size={20} />
                  <span className="text-xs font-semibold">Add slot</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Actions under photos: Figma 48:1019 & 48:1020 */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleAddPhotoClick}
                className="text-rewear-text hover:underline self-start text-sm font-semibold"
              >
                Add photo
              </button>

              <button
                type="button"
                onClick={() => setChecklistOpen(true)}
                className="text-rewear-text hover:underline self-start text-sm font-semibold"
              >
                Photo and listing requirements
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Publish Preview Card (Figma 48:1021) */}
        <div className="bg-rewear-soft flex flex-col space-y-6 p-6 lg:col-span-4 lg:sticky lg:top-8">
          <span className="text-rewear-text text-base font-normal">Draft</span>

          {/* Large Preview Image: Figma 48:1023 */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-white shadow-xs">
            <Image
              src={primaryPhotoUrl}
              alt={title || 'Product preview'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Actions: Figma 48:1024 & 48:1026 */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setSubmittedOpen(true)}
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-12 w-full items-center justify-center text-sm font-semibold transition"
            >
              Submit for review
            </button>

            <button
              type="button"
              onClick={() => setDraftSavedOpen(true)}
              className="text-rewear-text hover:underline flex h-10 w-full items-center justify-center text-sm font-semibold transition"
            >
              Save draft
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ListingChecklistModal
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
      />

      <DraftSavedModal
        open={draftSavedOpen}
        onOpenChange={setDraftSavedOpen}
      />

      <SubmittedForReviewModal
        open={submittedOpen}
        onOpenChange={setSubmittedOpen}
        onViewProducts={() => {
          router.push('/selling');
        }}
      />
    </div>
  );
}
