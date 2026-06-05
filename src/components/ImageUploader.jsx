import { useEffect, useMemo } from 'react'

function ImageUploader({
  label,
  urls = [],
  files = [],
  onUrlsChange,
  onFilesChange,
  disabled,
  maxImages = 5,
}) {
  const filePreviews = useMemo(
    () => files.map((file) => ({ file, src: URL.createObjectURL(file) })),
    [files],
  )

  useEffect(
    () => () => filePreviews.forEach((preview) => URL.revokeObjectURL(preview.src)),
    [filePreviews],
  )

  const images = [
    ...urls.map((url, index) => ({ type: 'url', src: url, index })),
    ...filePreviews.map((preview, index) => ({ type: 'file', src: preview.src, index })),
  ].slice(0, maxImages)
  const remainingSlots = Math.max(maxImages - images.length, 0)

  function handleFilesChange(fileList) {
    const selectedFiles = Array.from(fileList || []).slice(0, remainingSlots)
    if (!selectedFiles.length) return
    onFilesChange([...files, ...selectedFiles])
  }

  function removeImage(image) {
    if (image.type === 'url') {
      onUrlsChange(urls.filter((_, index) => index !== image.index))
      return
    }

    onFilesChange(files.filter((_, index) => index !== image.index))
  }

  return (
    <div className="image-uploader full-field">
      <div className="image-uploader-heading">
        <div>
          <strong>{label}</strong>
          <span>Adicione ate {maxImages} fotos. A primeira sera a imagem principal.</span>
        </div>
        <span>{images.length}/{maxImages}</span>
      </div>

      <div className="product-image-grid">
        {images.map((image, index) => (
          <div key={`${image.type}-${image.index}`} className="product-image-tile">
            <img src={image.src} alt={`Imagem do produto ${index + 1}`} />
            <span>{index === 0 ? 'Principal' : `Foto ${index + 1}`}</span>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remover imagem ${index + 1}`}
              onClick={() => removeImage(image)}
            >
              Remover
            </button>
          </div>
        ))}

        {remainingSlots ? (
          <label className="product-image-add">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={disabled}
              onChange={(event) => {
                handleFilesChange(event.target.files)
                event.target.value = ''
              }}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Adicionar fotos</span>
          </label>
        ) : null}
      </div>
    </div>
  )
}

export default ImageUploader
