import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CustomSelect from '../../components/CustomSelect.jsx'
import FormStatus from '../../components/FormStatus.jsx'
import ImageUploader from '../../components/ImageUploader.jsx'
import Loading from '../../components/Loading.jsx'
import NumberInput from '../../components/NumberInput.jsx'
import { PRODUCT_OBJECTIVES, PRODUCT_TYPES } from '../../data/options.js'
import { listCategories } from '../../services/categoriesService.js'
import {
  getProductById,
  saveProductWithVariants,
} from '../../services/productsService.js'
import { uploadStoreImage } from '../../services/storageService.js'

const emptyProduct = {
  id: '',
  name: '',
  slug: '',
  type: 'suplemento',
  category_id: '',
  subcategory: '',
  description: '',
  brand: '',
  price: '',
  promo_price: '',
  stock: 0,
  image_url: '',
  gallery_urls: [],
  is_active: true,
  is_featured: false,
  objective_tags: [],
}

function variantsToText(variants = []) {
  return variants
    .map(
      (variant) =>
        `${variant.variant_type || 'opção'}, ${variant.name || ''}, ${variant.stock || 0}, ${
          variant.price_adjustment || 0
        }`,
    )
    .join('\n')
}

function parseVariants(text, fallbackType) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(',').map((part) => part.trim())
      const hasExplicitType = parts.length >= 4
      const [variantType, name, stock, adjustment] = hasExplicitType
        ? parts
        : [fallbackType, parts[0], parts[1] || 0, parts[2] || 0]

      return {
        variant_type: variantType || fallbackType,
        name,
        stock: Number(stock || 0),
        price_adjustment: Number(adjustment || 0),
      }
    })
}

function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(emptyProduct)
  const [categories, setCategories] = useState([])
  const [variantText, setVariantText] = useState('')
  const [imageUrls, setImageUrls] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fallbackVariantType = 'tamanho'
  const title = id ? 'Editar produto' : 'Novo produto'

  useEffect(() => {
    async function loadFormData() {
      try {
        const nextCategories = await listCategories()
        setCategories(nextCategories)

        if (id) {
          const currentProduct = await getProductById(id)
          if (!currentProduct) throw new Error('Produto não encontrado.')
          setProduct({ ...emptyProduct, ...currentProduct })
          setVariantText(variantsToText(currentProduct.variants))
          setImageUrls(
            [currentProduct.image_url, ...(currentProduct.gallery_urls || [])]
              .filter(Boolean)
              .slice(0, 5),
          )
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id])

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) => !category.type || category.type === product.type || category.type === 'outro',
      ),
    [categories, product.type],
  )

  function updateField(name, value) {
    setProduct((current) => ({ ...current, [name]: value }))
  }

  function toggleObjective(objective) {
    setProduct((current) => {
      const tags = current.objective_tags || []
      const nextTags = tags.includes(objective)
        ? tags.filter((tag) => tag !== objective)
        : [...tags, objective]

      return { ...current, objective_tags: nextTags }
    })
  }

  function validateProduct() {
    if (!product.name.trim()) return 'Informe o nome do produto.'
    if (!product.type) return 'Selecione o tipo do produto.'
    if (!product.price || Number(product.price) <= 0) return 'Informe um preço válido.'
    if (product.promo_price && Number(product.promo_price) >= Number(product.price)) {
      return 'O preço de oferta deve ser menor que o preço normal.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateProduct()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      const uploadedImageUrls = []
      for (const file of imageFiles.slice(0, 5)) {
        uploadedImageUrls.push(await uploadStoreImage(file, 'products', {
          convertToWebp: true,
          maxWidth: 1600,
          quality: 0.82,
        }))
      }
      const allImageUrls = [...imageUrls, ...uploadedImageUrls].filter(Boolean).slice(0, 5)
      const imageUrl = allImageUrls[0] || ''

      const payload = {
        ...product,
        image_url: imageUrl,
        gallery_urls: allImageUrls.slice(1),
      }
      const variants = parseVariants(variantText, fallbackVariantType)

      await saveProductWithVariants(payload, variants)
      setSuccess('Produto salvo com sucesso.')
      navigate('/admin/produtos')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Produtos</span>
          <h1>{title}</h1>
        </div>
        <Link className="button secondary" to="/admin/produtos">
          Voltar
        </Link>
      </div>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <label>
          Nome do produto
          <input
            value={product.name}
            onChange={(event) => updateField('name', event.target.value)}
            required
          />
        </label>
        <label>
          Slug opcional
          <input
            value={product.slug || ''}
            onChange={(event) => updateField('slug', event.target.value)}
            placeholder="gerado automaticamente"
          />
        </label>
        <label>
          Tipo
          <CustomSelect
            value={product.type}
            onChange={(value) => updateField('type', value)}
            options={PRODUCT_TYPES}
          />
        </label>
        <label>
          Categoria
          <CustomSelect
            value={product.category_id || ''}
            onChange={(value) => updateField('category_id', value)}
            options={[
              { value: '', label: 'Sem categoria' },
              ...filteredCategories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
          />
        </label>
        <label>
          Linha ou categoria
          <input
            value={product.subcategory || ''}
            onChange={(event) => updateField('subcategory', event.target.value)}
            placeholder="Ex.: Home, Away, Retro, Treino"
          />
        </label>
        <label>
          Marca
          <input
            value={product.brand || ''}
            onChange={(event) => updateField('brand', event.target.value)}
            placeholder="Ex.: Brasil, Flamengo, Nike, Adidas"
          />
        </label>
        <label>
          Preço
          <NumberInput
            min="0"
            step="0.01"
            value={product.price}
            onChange={(value) => updateField('price', value)}
            required
          />
        </label>
        <label>
          Preço de oferta
          <NumberInput
            min="0"
            step="0.01"
            value={product.promo_price || ''}
            onChange={(value) => updateField('promo_price', value)}
          />
        </label>
        <label>
          Disponibilidade
          <NumberInput
            min="0"
            value={product.stock}
            onChange={(value) => updateField('stock', value)}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={product.is_active}
            onChange={(event) => updateField('is_active', event.target.checked)}
          />
          Produto ativo
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={product.is_featured}
            onChange={(event) => updateField('is_featured', event.target.checked)}
          />
          Destaque na home
        </label>
        <label className="full-field">
          Descrição
          <textarea
            value={product.description || ''}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Time, seleção, tecido, tamanho, cor, personalização e observações."
          />
        </label>

        <fieldset className="full-field checkbox-group">
          <legend>Perfil indicado</legend>
          {PRODUCT_OBJECTIVES.map((objective) => (
            <label key={objective.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={(product.objective_tags || []).includes(objective.value)}
                onChange={() => toggleObjective(objective.value)}
              />
              {objective.label}
            </label>
          ))}
        </fieldset>

        <label className="full-field">
          Tamanhos e variações
          <textarea
            value={variantText}
            onChange={(event) => setVariantText(event.target.value)}
            placeholder={`${fallbackVariantType}, M, quantidade, ajuste de preço`}
          />
          <small>
            Uma por linha. Ex.: {fallbackVariantType}, M, 5, 0
          </small>
        </label>

        <ImageUploader
          label="Fotos do produto"
          urls={imageUrls}
          files={imageFiles}
          onUrlsChange={setImageUrls}
          onFilesChange={setImageFiles}
          disabled={saving}
          maxImages={5}
        />

        <FormStatus error={error} success={success} />
        <button className="button full-field" type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar produto'}
        </button>
      </form>
    </section>
  )
}

export default AdminProductForm
