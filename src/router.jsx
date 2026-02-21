import React, { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

const Dashboard = lazy(() => import('./views/Dashboard'))
const SalesTable = lazy(() => import('./views/SalesTable'))
const ProductsTable = lazy(() => import('./views/ProductsTable'))
const CustomersTable = lazy(() => import('./views/CustomersTable'))
const RevenueChart = lazy(() => import('./views/RevenueChart'))
const SalesByCategoryChart = lazy(() => import('./views/SalesByCategoryChart'))
const TopProductsChart = lazy(() => import('./views/TopProductsChart'))
const MonthlySalesByProductChart = lazy(() => import('./views/MonthlySalesByProductChart'))

export const routeConfig = [
  { path: '/', name: 'Dashboard', title: 'Dashboard' },
  { path: '/tables/sales', name: 'SalesTable', title: 'Sales Transactions', category: 'Tables' },
  { path: '/tables/products', name: 'ProductsTable', title: 'Products', category: 'Tables' },
  { path: '/tables/customers', name: 'CustomersTable', title: 'Customers', category: 'Tables' },
  { path: '/charts/revenue', name: 'RevenueChart', title: 'Revenue Trend', category: 'Charts' },
  { path: '/charts/sales-category', name: 'SalesByCategoryChart', title: 'Sales by Category', category: 'Charts' },
  { path: '/charts/top-products', name: 'TopProductsChart', title: 'Top Products', category: 'Charts' },
  { path: '/charts/monthly-sales-by-product', name: 'MonthlySalesByProductChart', title: 'Monthly Sales by Product', category: 'Charts' },
]

export function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tables/sales" element={<SalesTable />} />
        <Route path="/tables/products" element={<ProductsTable />} />
        <Route path="/tables/customers" element={<CustomersTable />} />
        <Route path="/charts/revenue" element={<RevenueChart />} />
        <Route path="/charts/sales-category" element={<SalesByCategoryChart />} />
        <Route path="/charts/top-products" element={<TopProductsChart />} />
        <Route path="/charts/monthly-sales-by-product" element={<MonthlySalesByProductChart />} />
      </Routes>
    </Suspense>
  )
}

export { HashRouter }
