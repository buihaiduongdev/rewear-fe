'use client';

import { useSellerListingEditor } from '../hooks/use-seller-listing-editor';
import { listingMeasurementFields } from '../utils/listing-form';

export function SellerListingEditorPage({ shopId }: { shopId: string }) {
  const {
    productId,
    busy,
    message,
    error,
    angle,
    setAngle,
    product,
    categories,
    media,
    save,
    upload,
    updatePhoto,
  } = useSellerListingEditor(shopId);

  if (!shopId) return <p>Open a shop before creating a listing.</p>;
  if (productId && product.isPending)
    return <p role="status">Loading listing…</p>;
  if (productId && product.isError)
    return (
      <div role="alert">
        Could not load listing.{' '}
        <button onClick={() => void product.refetch()}>Retry</button>
      </div>
    );
  const current = product.data?.data;
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">
        {productId ? 'Edit listing' : 'Create listing'}
      </h1>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <form
        key={productId}
        onSubmit={(event) => {
          event.preventDefault();
          void save(event.currentTarget, false);
        }}
        className="space-y-4"
      >
        <label className="block">
          Title
          <input
            name="title"
            defaultValue={current?.title ?? ''}
            maxLength={150}
            className="bg-rewear-soft block w-full p-3"
          />
        </label>
        <label className="block">
          Description
          <textarea
            name="description"
            defaultValue={current?.description ?? ''}
            maxLength={5000}
            className="bg-rewear-soft block w-full p-3"
          />
        </label>
        <label className="block">
          Category
          <select
            name="categoryId"
            defaultValue={current?.categoryId ?? ''}
            className="bg-rewear-soft block w-full p-3"
          >
            <option value="">Select category</option>
            {categories.data?.data
              .filter((c) => c.isActive)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        {categories.isError && (
          <p role="alert">
            Could not load categories.{' '}
            <button type="button" onClick={() => void categories.refetch()}>
              Retry
            </button>
          </p>
        )}
        <label className="block">
          Condition
          <select
            name="condition"
            defaultValue={current?.condition ?? ''}
            className="bg-rewear-soft block w-full p-3"
          >
            <option value="">Select condition</option>
            <option value="PRISTINE">Like new</option>
            <option value="EXCELLENT">Very good</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
          </select>
        </label>
        {(['size', 'brand', 'color', 'repairs'] as const).map((name) => (
          <label className="block capitalize" key={name}>
            {name}
            <input
              name={name}
              defaultValue={current?.[name] ?? ''}
              className="bg-rewear-soft block w-full p-3"
            />
          </label>
        ))}
        <label className="block">
          Price (VND)
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue={current?.price ?? ''}
            className="bg-rewear-soft block w-full p-3"
          />
        </label>
        <fieldset>
          <legend className="font-semibold">Measurements (cm)</legend>
          <div className="grid grid-cols-2 gap-3">
            {listingMeasurementFields.map((name) => (
              <label className="capitalize" key={name}>
                {name}
                <input
                  name={name}
                  type="number"
                  min="0.1"
                  max="500"
                  step="0.1"
                  defaultValue={current?.measurements?.[name] ?? ''}
                  className="bg-rewear-soft block w-full p-3"
                />
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-semibold">Shipping package</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['weightGrams', 'lengthCm', 'widthCm', 'heightCm'] as const).map(
              (name) => (
                <label key={name}>
                  {name === 'weightGrams'
                    ? 'Weight (g)'
                    : `${name.replace('Cm', '')} (cm)`}
                  <input
                    name={name}
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={current?.shippingPackage?.[name] ?? ''}
                    className="bg-rewear-soft block w-full p-3"
                  />
                </label>
              ),
            )}
          </div>
        </fieldset>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="bg-rewear-accent px-5 py-3 font-semibold disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (form && form.reportValidity()) void save(form, true);
            }}
            className="border px-5 py-3 disabled:opacity-50"
          >
            Submit for review
          </button>
        </div>
      </form>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Photos</h2>
        {!productId ? (
          <p>Save the draft before uploading photos.</p>
        ) : (
          <>
            <p>Upload front, back and label photos before submitting.</p>
            <label>
              Photo angle
              <select
                value={angle}
                onChange={(event) =>
                  setAngle(event.target.value as typeof angle)
                }
                className="bg-rewear-soft ml-2 p-2"
              >
                {['FRONT', 'BACK', 'LABEL', 'DETAIL', 'DEFECT'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <input
              aria-label="Upload photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.currentTarget.value = '';
              }}
            />
            {media.isError && <p role="alert">Could not load photos.</p>}
            <ul>
              {media.data?.data.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 py-2"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {item.angle ?? 'Photo'}
                  </a>
                  {item.role === 'COVER' ? (
                    <span>Cover</span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void updatePhoto('cover', item.id)}
                      className="underline"
                    >
                      Set cover
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void updatePhoto('delete', item.id)}
                    className="underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
