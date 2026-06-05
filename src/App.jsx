import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AdminBanners from './pages/admin/AdminBanners.jsx'
import AdminCategoryBanners from './pages/admin/AdminCategoryBanners.jsx'
import AdminBlog from './pages/admin/AdminBlog.jsx'
import AdminBlogForm from './pages/admin/AdminBlogForm.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminProductForm from './pages/admin/AdminProductForm.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'
import BlogPage from './pages/public/BlogPage.jsx'
import BlogPostPage from './pages/public/BlogPostPage.jsx'
import CategoryPage from './pages/public/CategoryPage.jsx'
import Home from './pages/public/Home.jsx'
import NotFoundPage from './pages/public/NotFoundPage.jsx'
import ProductDetailPage from './pages/public/ProductDetailPage.jsx'
import ProductsPage from './pages/public/ProductsPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="produtos" element={<ProductsPage key="produtos" pageVariant="overview" />} />
        <Route path="camisas" element={<ProductsPage key="camisas" lockedType="suplemento" />} />
        <Route path="esportes" element={<ProductsPage key="esportes" lockedType="vestuario" />} />
        <Route path="ofertas" element={<ProductsPage key="ofertas" pageVariant="offers" />} />
        <Route path="produto/:slug" element={<ProductDetailPage />} />
        <Route path="categoria/:slug" element={<CategoryPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="produtos" element={<AdminProducts />} />
        <Route path="produtos/novo" element={<AdminProductForm />} />
        <Route path="produtos/editar/:id" element={<AdminProductForm />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="blog/novo" element={<AdminBlogForm />} />
        <Route path="blog/editar/:id" element={<AdminBlogForm />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="banners-categorias" element={<AdminCategoryBanners />} />
        <Route path="configuracoes" element={<AdminSettings />} />
      </Route>

      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

