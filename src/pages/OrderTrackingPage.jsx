import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Check, Package, Truck, MapPin, Loader2, AlertCircle, RotateCcw, Download, Star, Upload, MessageSquare, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import { useCart } from '../context/CartContext'

const statusOrder = [
  'ORDER_PLACED',
  'PAYMENT_CONFIRMED',
  'ORDER_ACCEPTED',
  'PACKING_IN_PROGRESS',
  'READY_FOR_DISPATCH',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
]

const refundTimelineSteps = [
  { key: 'SUBMITTED', label: 'Refund Requested' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'APPROVED', label: 'Approved / Processed' },
  { key: 'REFUND_COMPLETED', label: 'Refund Completed' }
]

export default function OrderTrackingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchCart } = useCart()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Review states (indexed by productId)
  const [reviewForms, setReviewForms] = useState({}) // { productId: { rating, title, comments, open } }
  
  // Refund state
  const [refundReason, setRefundReason] = useState('Wrong Product Delivered')
  const [refundComments, setRefundComments] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [submittingRefund, setSubmittingRefund] = useState(false)

  const isLoggedIn = () => !!localStorage.getItem('accessToken')

  async function loadOrderDetails() {
    try {
      const data = await api.orders.get(id)
      setOrder(data)
      
      // Initialize review forms with existing review data if present
      const initialForms = {}
      data.items?.forEach(item => {
        const existingReview = data.reviews?.find(r => r.productId === item.productId)
        initialForms[item.productId] = {
          rating: existingReview?.rating || 5,
          title: existingReview?.title || '',
          comments: existingReview?.comments || '',
          open: false,
          submitted: !!existingReview,
          reviewId: existingReview?.id || null
        }
      })
      setReviewForms(initialForms)
    } catch (err) {
      console.error('Failed to load order details:', err)
      setError(err.message || 'Failed to retrieve order tracking information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login?redirect=/orders')
      return
    }
    loadOrderDetails()
  }, [id, navigate])

  const handleReorder = async () => {
    setBusy(true)
    try {
      await api.orders.reorder(order.orderId)
      await fetchCart()
      navigate('/cart')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to reorder items')
    } finally {
      setBusy(false)
    }
  }

  const handleDownloadInvoice = () => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN')
    const lines = [
      `==================================================`,
      `                MILLTOMEAL INVOICE                 `,
      `==================================================`,
      `Invoice Date  : ${new Date().toLocaleDateString('en-IN')}`,
      `Order Number  : ${order.orderNumber || order.orderId}`,
      `Order Date    : ${dateStr}`,
      `Order Status  : ${order.orderStatus}`,
      `Payment Status: ${order.paymentStatus}`,
      `--------------------------------------------------`,
      `Shipping Address:`,
      `  Name        : ${order.deliveryAddress?.fullName || 'N/A'}`,
      `  Phone       : +91 ${order.deliveryAddress?.mobileNumber || 'N/A'}`,
      `  Address     : ${order.deliveryAddress?.line1 || ''}`,
      `                ${order.deliveryAddress?.line2 || ''}`,
      `                ${order.deliveryAddress?.city}, ${order.deliveryAddress?.state} - ${order.deliveryAddress?.pincode || ''}`,
      `--------------------------------------------------`,
      `Items Details:`,
      ...order.items.map((item, idx) => {
        const itemTotal = parseFloat(item.unitPrice) * item.quantity
        return `  ${idx + 1}. ${item.productNameSnapshot}\n     Qty: ${item.quantity}  |  Unit Price: ₹${item.unitPrice}  |  Total: ₹${itemTotal}`
      }),
      `--------------------------------------------------`,
      `Subtotal Amount   : ₹${order.subtotalAmount}`,
      `Discount Applied  : ₹${order.discountAmount || 0}`,
      `Delivery Charges  : ₹${order.deliveryFeeAmount || 0}`,
      `Taxes (GST)       : ₹${order.taxAmount || 0}`,
      `==================================================`,
      `GRAND TOTAL AMOUNT: ₹${order.grandTotalAmount}`,
      `==================================================`,
      `             Thank you for shopping!              `,
      `             Fresh from Mill to Table             `,
      `==================================================`
    ].join('\n')

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Invoice-${order.orderNumber || order.orderId.slice(0, 8)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReviewFormChange = (productId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }))
  }

  const handleSubmitReview = async (productId) => {
    const form = reviewForms[productId]
    if (!form.title.trim() || !form.comments.trim()) {
      alert('Please fill in both title and comments for your review.')
      return
    }

    setBusy(true)
    try {
      if (form.submitted && form.reviewId) {
        // Update review
        await api.reviews.update(form.reviewId, {
          rating: form.rating,
          title: form.title,
          comments: form.comments
        })
        alert('Review updated successfully!')
      } else {
        // Create review
        const response = await api.reviews.create({
          productId,
          orderId: order.orderId,
          rating: form.rating,
          title: form.title,
          comments: form.comments
        })
        
        // Update local state with the newly created review ID
        setReviewForms(prev => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            submitted: true,
            reviewId: response.id || response.reviewId
          }
        }))
        alert('Review submitted successfully!')
      }
      loadOrderDetails()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to submit review')
    } finally {
      setBusy(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handleSubmitRefund = async (e) => {
    e.preventDefault()
    if (!refundComments.trim()) {
      alert('Please provide detailed comments describing the issue.')
      return
    }

    setSubmittingRefund(true)
    try {
      // Mock uploading images by extracting file names or using a placeholder
      const mockImages = selectedFiles.length > 0 
        ? selectedFiles.map(f => `http://localhost:4001/uploads/refund-${Date.now()}-${f.name}`)
        : ['http://localhost:4001/uploads/mock-refund.png']

      await api.orders.requestRefund(order.orderId, {
        reason: refundReason,
        comments: refundComments,
        images: mockImages
      })

      alert('Refund request submitted successfully.')
      loadOrderDetails()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to submit refund request')
    } finally {
      setSubmittingRefund(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600 animate-spin" /> Loading tracking details...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container-custom py-20 text-center bg-gray-50">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Tracking details unavailable</h2>
        <p className="text-gray-500 mt-2">{error || 'The requested order details could not be found.'}</p>
        <Link to="/orders" className="btn-primary mt-6 inline-block">Back to Orders</Link>
      </div>
    )
  }

  const currentStatusIndex = statusOrder.indexOf(order.orderStatus)
  const isCancelled = order.orderStatus === 'CANCELLED'
  const isDelivered = order.orderStatus === 'DELIVERED'

  const trackingSteps = [
    { label: 'Order Placed', completed: currentStatusIndex >= 0, icon: Check },
    { label: 'Payment Verified', completed: currentStatusIndex >= 1, icon: Check },
    { label: 'Packed & Ready', completed: currentStatusIndex >= 3, icon: Package },
    { label: 'Out for Delivery', completed: currentStatusIndex >= 5, icon: Truck },
    { label: 'Delivered', completed: currentStatusIndex >= 6, icon: MapPin }
  ]

  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Get active refund request details if present
  const activeRefund = order.refundRequests && order.refundRequests.length > 0 
    ? order.refundRequests[0] 
    : null

  // Map refund status to visual timeline index
  const getRefundStepIndex = (status) => {
    if (status === 'PENDING') return 0
    if (status === 'UNDER_REVIEW') return 1
    if (status === 'APPROVED' || status === 'REJECTED') return 2
    if (status === 'REFUND_COMPLETED') return 3
    return 0
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50/50 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/orders" className="text-xs text-primary-600 font-bold hover:underline mb-2 inline-block">&larr; Back to Orders</Link>
            <h1 className="text-2xl font-heading font-bold text-gray-900 leading-tight">
              Order #{order.orderNumber || order.orderId.slice(0, 8)}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Placed on {dateStr}</p>
          </div>

          {/* Top Level Actions */}
          <div className="flex gap-2.5">
            <button 
              onClick={handleDownloadInvoice}
              className="btn-outline bg-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Download size={14} /> Invoice PDF
            </button>
            
            {isDelivered && (
              <button 
                onClick={handleReorder}
                disabled={busy}
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                Reorder Staples
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Columns (Timeline & Review/Refund Widgets) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Tracking Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-6 font-heading">Order Status Timeline</h2>
              {isCancelled ? (
                <div className="flex gap-4 items-start bg-red-50 p-4 rounded-xl border border-red-100">
                  <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="font-bold text-red-800 text-sm">Order Cancelled</p>
                    <p className="text-xs text-red-600 mt-0.5">This order was cancelled and will not be processed further.</p>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                  {trackingSteps.map((step, i) => (
                    <div key={step.label} className="flex md:flex-col items-center text-center w-full md:w-1/5 relative">
                      {/* Line connector */}
                      {i < trackingSteps.length - 1 && (
                        <div className={`hidden md:block absolute top-5 left-[60%] right-[-40%] h-0.5 transition-colors ${step.completed ? 'bg-primary-600' : 'bg-gray-200'}`} />
                      )}
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${step.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <step.icon size={18} />
                      </div>
                      
                      <div className="text-left md:text-center ml-4 md:ml-0 md:mt-3">
                        <p className={`text-xs font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{step.completed ? 'Completed' : 'Pending'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DELIVERED specific widgets */}
            {isDelivered && (
              <div className="space-y-6">
                
                {/* Product Reviews Widget */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-4 font-heading text-lg">Product Reviews</h2>
                  <p className="text-xs text-gray-400 -mt-2 mb-6">Write or update reviews for items in this delivery.</p>
                  
                  <div className="space-y-4">
                    {order.items?.map((item) => {
                      const form = reviewForms[item.productId] || { rating: 5, title: '', comments: '', open: false, submitted: false }
                      return (
                        <div key={item.orderItemId} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{item.productNameSnapshot}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                            </div>
                            
                            <button
                              onClick={() => handleReviewFormChange(item.productId, 'open', !form.open)}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              {form.submitted ? 'Update Review' : 'Write Review'}
                              <ChevronRight size={14} className={`transform transition-transform ${form.open ? 'rotate-95' : ''}`} />
                            </button>
                          </div>

                          {/* Review Input Collapse */}
                          {form.open && (
                            <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-4">
                              {/* Stars Selection */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Rating</label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleReviewFormChange(item.productId, 'rating', star)}
                                      className="p-0.5 hover:scale-110 transition"
                                    >
                                      <Star 
                                        size={22} 
                                        className={star <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} 
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Title */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Headline</label>
                                <input 
                                  type="text" 
                                  value={form.title}
                                  onChange={e => handleReviewFormChange(item.productId, 'title', e.target.value)}
                                  placeholder="Summarize your review in a few words"
                                  className="w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-primary-500"
                                />
                              </div>

                              {/* Comments */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Comments</label>
                                <textarea 
                                  value={form.comments}
                                  onChange={e => handleReviewFormChange(item.productId, 'comments', e.target.value)}
                                  placeholder="What did you like or dislike about the product?"
                                  rows={3}
                                  className="w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary-500"
                                />
                              </div>

                              <button
                                onClick={() => handleSubmitReview(item.productId)}
                                disabled={busy}
                                className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                {busy ? <Loader2 size={12} className="animate-spin" /> : null}
                                {form.submitted ? 'Update Review' : 'Submit Review'}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Refund Module Widget */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-gray-900 mb-4 font-heading text-lg">Order Refund Requests</h2>
                  
                  {activeRefund ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl space-y-2.5 text-xs">
                        <p className="flex justify-between"><span className="text-gray-400">Refund ID:</span><span className="font-semibold text-gray-800">{activeRefund.refundId}</span></p>
                        <p className="flex justify-between"><span className="text-gray-400">Request Reason:</span><span className="font-semibold text-gray-800">{activeRefund.reason}</span></p>
                        <p className="flex justify-between"><span className="text-gray-400">Status:</span><span className="font-bold text-primary-600">{activeRefund.status}</span></p>
                        {activeRefund.adminRemarks && (
                          <div className="pt-2 border-t border-blue-200/50">
                            <span className="text-gray-400 font-semibold">Remarks:</span>
                            <p className="text-gray-700 mt-0.5 italic">"{activeRefund.adminRemarks}"</p>
                          </div>
                        )}
                      </div>

                      {/* Refund Status Timeline */}
                      <div>
                        <h4 className="font-bold text-gray-800 text-xs mb-4 uppercase tracking-widest">Refund Status Timeline</h4>
                        <div className="relative flex flex-col sm:flex-row justify-between gap-4">
                          {refundTimelineSteps.map((step, idx) => {
                            const activeIdx = getRefundStepIndex(activeRefund.status)
                            const isStepCompleted = activeIdx >= idx
                            const isRejectedStep = activeRefund.status === 'REJECTED' && idx === 2

                            return (
                              <div key={step.key} className="flex sm:flex-col items-center text-center w-full sm:w-1/4 relative">
                                {idx < refundTimelineSteps.length - 1 && (
                                  <div className={`hidden sm:block absolute top-4 left-[60%] right-[-40%] h-0.5 ${isStepCompleted ? 'bg-primary-600' : 'bg-gray-200'}`} />
                                )}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 ${
                                  isRejectedStep ? 'bg-red-600 text-white' : 
                                  isStepCompleted ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                                }`}>
                                  {isRejectedStep ? 'X' : idx + 1}
                                </div>
                                <div className="text-left sm:text-center ml-3 sm:ml-0 sm:mt-2 text-xs">
                                  <p className={`font-bold ${isStepCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {isRejectedStep ? 'Request Rejected' : step.label}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRefund} className="space-y-4">
                      <p className="text-xs text-gray-500 -mt-2">Is there an issue with your items? Request a refund here.</p>
                      
                      {/* Reason */}
                      <div className="grid sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Select Refund Reason *</label>
                          <select 
                            value={refundReason}
                            onChange={e => setRefundReason(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:outline-none"
                          >
                            <option value="Wrong Product Delivered">Wrong Product Delivered</option>
                            <option value="Damaged Product">Damaged Product</option>
                            <option value="Expired Product">Expired Product</option>
                            <option value="Packaging Leakage">Packaging Leakage</option>
                            <option value="Quality Complaint">Quality Complaint</option>
                          </select>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Upload Photo (Proof) *</label>
                          <div className="relative border border-dashed rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer">
                            <input 
                              type="file" 
                              multiple 
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Upload size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-600 font-semibold">
                              {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) chosen` : 'Choose files'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Detailed Description *</label>
                        <textarea 
                          value={refundComments}
                          onChange={e => setRefundComments(e.target.value)}
                          placeholder="Describe the complaint in detail (e.g. leaked packaging, specific damage)"
                          rows={3}
                          required
                          className="w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingRefund}
                        className="btn-primary py-2 px-5 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        {submittingRefund ? <Loader2 size={12} className="animate-spin" /> : null}
                        Submit Refund Request
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Billing summary and addresses) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Items Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 font-heading text-base">Items Summary</h3>
              <div className="space-y-4 mb-4">
                {order.items?.map((item) => (
                  <div key={item.orderItemId} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border">
                      <Package size={22} className="w-full h-full p-2.5 text-gray-400 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate leading-snug">{item.productNameSnapshot}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Price: ₹{item.unitPrice}  |  Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 font-mono">₹{parseFloat(item.unitPrice) * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 my-4" />

              {/* Billing Info */}
              <div className="space-y-2.5 text-xs text-gray-500">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono text-gray-800">₹{order.subtotalAmount || order.grandTotalAmount}</span></div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span className="font-mono">-₹{order.discountAmount}</span></div>
                )}
                <div className="flex justify-between"><span>Delivery Charges</span><span className="font-mono text-gray-800">₹{order.deliveryFeeAmount || 0}</span></div>
                <div className="flex justify-between"><span>Taxes (GST)</span><span className="font-mono text-gray-800">₹{order.taxAmount || 0}</span></div>
                <hr className="border-gray-100 my-2" />
                <div className="flex justify-between font-bold text-sm text-gray-900">
                  <span>Grand Total</span>
                  <span className="font-mono text-primary-600">₹{order.grandTotalAmount}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            {order.deliveryAddress && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 font-heading text-base">Delivery Address</h3>
                <div className="text-gray-600 text-xs leading-relaxed space-y-1">
                  <p className="font-bold text-gray-900">{order.deliveryAddress.fullName}</p>
                  <p>{order.deliveryAddress.line1}</p>
                  {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - <span className="font-semibold text-gray-800">{order.deliveryAddress.pincode}</span></p>
                  <p className="pt-2 font-bold text-gray-700">Phone: +91 {order.deliveryAddress.recipientMobile || order.deliveryAddress.mobileNumber}</p>
                </div>
              </div>
            )}

            {/* WhatsApp Support Box */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200 text-center">
              <MessageSquare className="text-green-600 mx-auto mb-2" size={24} />
              <h4 className="font-bold text-green-950 text-sm leading-tight">Need Support with Order?</h4>
              <p className="text-[10px] text-green-700 mt-1 mb-4 leading-normal">Connect directly with our customer support desk on WhatsApp for fast resolutions.</p>
              
              <a 
                href={`https://wa.me/919059503227?text=Hi%2C%20I%20need%20help%20with%20my%20order%20%23${order.orderNumber || order.orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 text-xs rounded-xl inline-flex justify-center items-center gap-1.5"
              >
                Chat on WhatsApp
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

