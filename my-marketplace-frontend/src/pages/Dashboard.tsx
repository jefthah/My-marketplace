import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, Lock, Camera, Save, ArrowLeft, Eye, EyeOff, 
  Settings, Shield, Package, Heart, Edit3, X, Download,
  Calendar, CreditCard, CheckCircle, Clock, XCircle, AlertCircle, LogOut
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import FavoritesPage from './FavoritesPage'
import type { Order, OrdersResponse } from '../types'

interface UserProfile {
  _id: string
  username: string
  email: string
  profileImage?: string
  name?: string
  phone?: string
  address?: string
  bio?: string
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, refreshUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Profile data
  const [profileData, setProfileData] = useState<UserProfile>({
    _id: '',
    username: '',
    email: '',
    profileImage: '',
    name: '',
    phone: '',
    address: '',
    bio: ''
  })

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Image upload
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Orders data
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  })
  const [orderFilter, setOrderFilter] = useState<string>('')

  useEffect(() => {
    if (user) {
      // Set profile data from user context
      setProfileData({
        _id: user.id || '',
        username: user.name || '',
        email: user.email || '',
        profileImage: user.profileImage || user.photoUrl || '',
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]); // Watch for changes in user object

  // Fetch orders function
  const fetchOrders = async (page: number = 1, status?: string) => {
    try {
      setOrdersLoading(true)
      const response: OrdersResponse = await apiService.getUserOrders(page, 10, status)
      
      if (response.success) {
        setOrders(response.data.orders)
        setOrdersPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      // Show error message to user
    } finally {
      setOrdersLoading(false)
    }
  }

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders(1, orderFilter || undefined)
      
      // Set up auto-refresh every 30 seconds when on orders tab
      const refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing order history...');
        fetchOrders(1, orderFilter || undefined);
      }, 30000); // Refresh every 30 seconds
      
      // Cleanup interval when tab changes or component unmounts
      return () => {
        console.log('🧹 Cleaning up order refresh interval');
        clearInterval(refreshInterval);
      };
    }
  }, [activeTab, orderFilter, user])

  // Get status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-600', label: 'Pending' },
      confirmed: { icon: CheckCircle, color: 'bg-green-100 text-green-600', label: 'Confirmed' },
      processing: { icon: AlertCircle, color: 'bg-orange-100 text-orange-600', label: 'Processing' },
      shipped: { icon: Package, color: 'bg-purple-100 text-purple-600', label: 'Shipped' },
      delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-600', label: 'Delivered' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Cancelled' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Failed' },
      refunded: { icon: XCircle, color: 'bg-gray-100 text-gray-600', label: 'Refunded' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Store the file for upload
      setImageFile(file)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      setLoading(true)

      // Prepare profile data
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio
      }

      console.log('Profile data being sent:', updateData);

      // Use combined endpoint that handles both profile data and image
      const response = await apiService.updateProfileComplete(updateData, imageFile || undefined)
      
      if (response.success && response.data) {
        // Update local state with response data
        const userData = response.data as { 
          user: {
            id: string
            username: string
            email: string
            phone?: string
            address?: string
            bio?: string
            profileImage?: string
          }
        }
        const updatedUser = userData.user
        
        setProfileData(prev => ({
          ...prev,
          name: updatedUser.username,
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          bio: updatedUser.bio || '',
          profileImage: updatedUser.profileImage || prev.profileImage
        }))
        
        setIsEditing(false)
        setImagePreview('')
        setImageFile(null)
        alert('Profile updated successfully!')
        
        // Refresh user context to get latest data
        await refreshUser();
      } else {
        throw new Error('Profile update failed')
      }
      
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      
      const response = await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (response.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        alert('Password changed successfully!')
      }
      
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password. Please check your current password.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (!confirmed) return
    
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-xl sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-700 hover:text-white transition-all duration-300 group hover:bg-gray-100 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back to Home</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-bold text-gray-900">{profileData.name || profileData.username}</p>
                <p className="text-sm text-slate-600">{profileData.email}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                {profileData.profileImage || imagePreview ? (
                  <img 
                    src={imagePreview || profileData.profileImage} 
                    alt="Profile"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Profile Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isEditing
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>

                {/* Profile Image */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-800 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                      {imagePreview || profileData.profileImage ? (
                        <img 
                          src={imagePreview || profileData.profileImage} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 shadow-lg cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">Click camera icon to change photo</p>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-600"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent pr-12"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent pr-12"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent pr-12"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Changing...' : 'Change Password'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Order History</h3>
                  
                  <div className="flex items-center space-x-4">
                    {/* Filter buttons */}
                    <div className="flex space-x-2">
                    <button
                      onClick={() => setOrderFilter('')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        orderFilter === '' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setOrderFilter('pending')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        orderFilter === 'pending' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setOrderFilter('confirmed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        orderFilter === 'confirmed' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setOrderFilter('failed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        orderFilter === 'failed' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Failed
                    </button>
                    </div>
                  </div>
                </div>

                {/* Loading state */}
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  /* Empty state */
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No orders found</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {orderFilter ? 'Try changing the filter or' : ''} Start shopping to see your orders here
                    </p>
                  </div>
                ) : (
                  /* Orders list */
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Order #{order.orderNumber || order._id.slice(-6)}
                            </h4>
                            <p className="text-sm text-slate-500 flex items-center mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(order.createdAt || order.orderDate || '')}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                        </div>

                        {/* Order items */}
                        {order.items ? (
                          /* New format - order has items array */
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-4">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                                  <p className="text-sm text-slate-500">
                                    {item.quantity} × {formatCurrency(item.unitPrice)}
                                  </p>
                                </div>
                                {item.downloadUrl && order.status === 'delivered' && (
                                  <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200 transition-colors">
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : order.productID ? (
                          /* Old format - order has single product */
                          <div className="flex items-center space-x-4">
                            <img 
                              src={order.productID.images?.[0] || '/api/placeholder/64/64'} 
                              alt={order.productID.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{order.productID.title}</h5>
                              <p className="text-sm text-slate-500">
                                {order.quantity} × {formatCurrency(order.unitPrice || order.productID.price)}
                              </p>
                            </div>
                            {order.status === 'delivered' && (
                              <button className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200 transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </button>
                            )}
                          </div>
                        ) : null}

                        {/* Payment info */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <CreditCard className="w-4 h-4" />
                            <span>{order.paymentMethod || 'Midtrans'}</span>
                          </div>
                          
                          <button 
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="text-gray-800 hover:text-gray-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {ordersPagination.totalPages > 1 && (
                      <div className="flex justify-center items-center space-x-4 mt-8">
                        <button
                          onClick={() => fetchOrders(ordersPagination.currentPage - 1, orderFilter || undefined)}
                          disabled={!ordersPagination.hasPrev}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        <span className="text-sm text-slate-500">
                          Page {ordersPagination.currentPage} of {ordersPagination.totalPages}
                        </span>
                        
                        <button
                          onClick={() => fetchOrders(ordersPagination.currentPage + 1, orderFilter || undefined)}
                          disabled={!ordersPagination.hasNext}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                <FavoritesPage />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h3>
                
                {/* Logout Section */}
                <div className="max-w-md mx-auto">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-3 rounded-full mr-4">
                        <LogOut className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Logout Account</h4>
                        <p className="text-sm text-gray-600">Sign out from your account</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      You can logout from your account anytime. Click the button below to sign out securely.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                  
                  {/* Additional Settings Info */}
                  <div className="text-center py-6">
                    <Settings className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">More settings will be available soon!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
