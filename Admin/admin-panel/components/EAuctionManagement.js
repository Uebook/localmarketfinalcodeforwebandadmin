'use client';

import { useState, useEffect } from 'react';

export default function EAuctionManagement() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'e-auction',
    circle: '',
    startDate: '',
    endDate: '',
    description: '',
    minBid: '',
    maxParticipants: '',
  });

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/e-auctions');
      if (res.ok) {
        const data = await res.json();
        setAuctions(data);
      }
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    try {
      const res = await fetch('/api/e-auctions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          circle: formData.circle,
          start_date: formData.startDate,
          end_date: formData.endDate,
          description: formData.description || null,
          min_bid: formData.minBid || null,
          max_participants: formData.maxParticipants || null,
        }),
      });

      if (res.ok) {
        await loadAuctions();
        setShowForm(false);
        setFormData({
          title: '',
          type: 'e-auction',
          circle: '',
          startDate: '',
          endDate: '',
          description: '',
          minBid: '',
          maxParticipants: '',
        });
        alert('Event created successfully!');
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleSendOffer = async (auctionId) => {
    try {
      const res = await fetch(`/api/e-auctions/${auctionId}/send-offer`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        await loadAuctions();
        alert(data.message || `Offers sent successfully to ${data.notifications_sent} users`);
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send offers');
      }
    } catch (error) {
      console.error('Error sending offers:', error);
      alert(error.message || 'Failed to send offers');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">E-Auction & Online Draw Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
        >
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create E-Auction/Online Draw</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Festive E-Auction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="e-auction">E-Auction</option>
                <option value="online-draw">Online Draw</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Circle</label>
              <select
                value={formData.circle}
                onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Circle</option>
                <option value="Connaught Place">Connaught Place</option>
                <option value="Saket">Saket</option>
                <option value="Vasant Kunj">Vasant Kunj</option>
                <option value="Chandni Chowk">Chandni Chowk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            {formData.type === 'e-auction' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Bid (₹)</label>
                <input
                  type="number"
                  value={formData.minBid}
                  onChange={(e) => setFormData({ ...formData, minBid: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 1000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Event description..."
              />
            </div>
          </div>
          <button
            onClick={handleCreateAuction}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
          >
            Create Event
          </button>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Events</h2>
          <button
            onClick={loadAuctions}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading events...</div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found</div>
        ) : (
        <div className="space-y-4">
          {auctions.map((auction) => (
            <div key={auction.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{auction.title}</h3>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span>Circle: <span className="font-semibold">{auction.circle}</span></span>
                    <span>Type: <span className="font-semibold capitalize">{auction.type}</span></span>
                    <span>Period: {auction.startDate} to {auction.endDate}</span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span>Participants: <span className="font-semibold">{auction.participants_count || 0}</span></span>
                    <span>Offers: <span className="font-semibold">{auction.offers_count || 0}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    auction.status === 'active' ? 'bg-green-100 text-green-800' :
                    auction.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {auction.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleSendOffer(auction.id)}
                    className="px-4 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                  >
                    Send Offer to Circle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
