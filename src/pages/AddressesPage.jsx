import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Home, Briefcase, Plus, Trash2, Edit2, ArrowLeft, Check, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  
  // Form fields
  const [formData, setFormData] = useState({
    addressLabel: '',
    recipientName: '',
    recipientMobile: '',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME',
    isDefault: false
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadAddresses()
  }, [])

  async function loadAddresses() {
    try {
      setLoading(true)
      const data = await api.addresses.list()
      setAddresses(data?.items || data || [])
    } catch (err) {
      console.error('Failed to load addresses:', err)
      setError('Failed to load saved addresses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (address = null) => {
    setError('')
    setSuccess('')
    if (address) {
      setEditingAddress(address)
      setFormData({
        addressLabel: address.addressLabel || '',
        recipientName: address.recipientName || '',
        recipientMobile: address.recipientMobile || '',
        line1: address.line1 || '',
        line2: address.line2 || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        addressType: address.addressType || 'HOME',
        isDefault: address.isDefault || false
      })
    } else {
      setEditingAddress(null)
      setFormData({
        addressLabel: '',
        recipientName: '',
        recipientMobile: '',
        line1: '',
        line2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        addressType: 'HOME',
        isDefault: false
      })
    }
    setIsFormOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic Validation
    if (!formData.addressLabel || !formData.recipientName || !formData.recipientMobile || !formData.line1 || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all mandatory fields.')
      return
    }

    if (formData.pincode.length !== 6 || isNaN(formData.pincode)) {
      setError('Pincode must be a 6-digit number.')
      return
    }

    if (formData.recipientMobile.length !== 10 || isNaN(formData.recipientMobile)) {
      setError('Mobile number must be a valid 10-digit number.')
      return
    }

    try {
      const payload = {
        ...formData,
      }

      if (editingAddress) {
        await api.addresses.update(editingAddress.addressId, payload)
        setSuccess('Address updated successfully!')
      } else {
        await api.addresses.create(payload)
        setSuccess('Address added successfully!')
      }
      setIsFormOpen(false)
      loadAddresses()
    } catch (err) {
      console.error('Failed to save address:', err)
      setError(err.message || 'Failed to save address. Please check serviceability or try again.')
    }
  }

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    setError('')
    setSuccess('')
    try {
      await api.addresses.remove(addressId)
      setSuccess('Address deleted successfully!')
      loadAddresses()
    } catch (err) {
      console.error('Failed to delete address:', err)
      setError('Failed to delete address. Please try again.')
    }
  }

  const handleSetDefault = async (addressId) => {
    setError('')
    setSuccess('')
    try {
      await api.addresses.setDefault(addressId)
      setSuccess('Default address updated!')
      loadAddresses()
    } catch (err) {
      console.error('Failed to set default address:', err)
      setError('Failed to set default address. Please try again.')
    }
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case 'WORK':
        return <Briefcase className="text-primary-600" size={18} />
      case 'HOME':
      default:
        return <Home className="text-primary-600" size={18} />
    }
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/account')} 
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-heading font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage your delivery locations</p>
            </div>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
            >
              <Plus size={16} /> Add Address
            </button>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-sm text-red-700 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-sm text-green-700 font-medium">
            {success}
          </div>
        )}

        {isFormOpen ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-lg font-heading font-bold text-gray-900 mb-6">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Label *</label>
                  <input
                    type="text"
                    name="addressLabel"
                    value={formData.addressLabel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="e.g. My Home, Dad's Office"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Type *</label>
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 text-gray-700 bg-white"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient's Full Name *</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="Recipient's Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (10 digits) *</label>
                  <input
                    type="tel"
                    name="recipientMobile"
                    value={formData.recipientMobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">House / Flat / Block No. *</label>
                <input
                  type="text"
                  name="line1"
                  value={formData.line1}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="Flat No, House No, Building Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street / Area / Locality</label>
                <input
                  type="text"
                  name="line2"
                  value={formData.line2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="Street Name, Locality Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Near HDFC Bank ATM"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    placeholder="6-digit pincode"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-600 select-none cursor-pointer">
                  Set as Default Address
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 font-semibold rounded-xl text-sm transition shadow-sm"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="py-20 text-center text-gray-500 font-semibold">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center max-w-md mx-auto">
                <MapPin className="text-gray-300 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Saved Addresses</h3>
                <p className="text-gray-500 text-sm mb-6">You don't have any saved addresses. Add your delivery details to get started.</p>
                <button
                  onClick={() => handleOpenForm()}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl text-sm transition shadow-sm inline-flex items-center gap-1"
                >
                  <Plus size={16} /> Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {addresses.map((address) => (
                  <div 
                    key={address.addressId} 
                    className={`bg-white rounded-2xl border transition p-6 relative flex flex-col justify-between ${
                      address.isDefault ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-150 hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Badge Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                            {getAddressIcon(address.addressType)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 text-sm capitalize">{address.addressLabel}</span>
                            <span className="ml-2 text-xs text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full uppercase">
                              {address.addressType}
                            </span>
                          </div>
                        </div>
                        {address.isDefault && (
                          <span className="flex items-center gap-1 text-xs text-primary-600 font-bold bg-primary-50 border border-primary-100 py-1 px-2.5 rounded-full select-none">
                            <CheckCircle2 size={12} /> Default
                          </span>
                        )}
                      </div>

                      {/* Recipient details */}
                      <div className="text-sm font-semibold text-gray-800 mb-1">{address.recipientName}</div>
                      <div className="text-xs text-gray-500 mb-3">{`+91 ${address.recipientMobile}`}</div>

                      {/* Address Lines */}
                      <div className="text-sm text-gray-600 leading-relaxed mb-4">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}
                        {address.landmark ? ` (Landmark: ${address.landmark})` : ''}
                        <br />
                        {`${address.city}, ${address.state} - ${address.pincode}`}
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4 text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenForm(address)}
                          className="text-gray-500 hover:text-primary-600 flex items-center gap-1 transition"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(address.addressId)}
                          className="text-gray-500 hover:text-red-600 flex items-center gap-1 transition"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.addressId)}
                          className="text-primary-600 hover:text-primary-700 transition"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
