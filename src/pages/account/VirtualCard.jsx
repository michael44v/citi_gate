import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import VirtualCardUI from '../../components/cards/VirtualCardUI';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, CreditCard, ShieldCheck, X } from 'lucide-react';

const VirtualCardPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    cardholder_name: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    network: 'visa'
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await api.get('?action=get_user_virtual_cards');
      if (response.data.status === 'success') {
        setCards(response.data.data || []);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCardSubmit = async (e) => {
    e.preventDefault();

    // Parse expiry MM/YY if entered as single string or numeric fields
    let expM = formData.expiry_month;
    let expY = formData.expiry_year;

    if (expM.includes('/')) {
      const parts = expM.split('/');
      expM = parts[0].trim();
      expY = parts[1].trim();
      if (expY.length === 2) expY = '20' + expY;
    }

    if (!formData.card_number || !formData.cvv || !expM || !expY) {
      return toast.error('Please fill in all card details');
    }

    setSaving(true);
    try {
      const response = await api.post('?action=save_virtual_card', {
        cardholder_name: formData.cardholder_name,
        card_number: formData.card_number,
        cvv: formData.cvv,
        expiry_month: parseInt(expM, 10),
        expiry_year: parseInt(expY, 10),
        network: formData.network
      });

      if (response.data.status === 'success') {
        toast.success('Virtual card saved successfully!');
        setShowAddModal(false);
        setFormData({
          cardholder_name: '',
          card_number: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
          network: 'visa'
        });
        fetchCards();
      } else {
        toast.error(response.data.message || 'Failed to save card');
      }
    } catch (error) {
      toast.error('An error occurred while saving card');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 italic">Loading virtual cards...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-chase-navy"> Cards</h1>
          <p className="text-gray-500">Enter and manage your cards for secure online payments</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus size={20} /> Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-chase-border text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-chase-light text-chase-blue rounded-full flex items-center justify-center mx-auto">
            <CreditCard size={40} />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-chase-navy mb-2">No Cards Added</h3>
            <p className="text-gray-500 text-sm">
              You haven't added any  cards yet. Enter your card details to save them securely.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="px-8 py-3">
            <Plus size={18} className="mr-2" /> Add Your First Virtual Card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards.map((cardItem) => (
            <div key={cardItem.id} className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm space-y-6">
              <VirtualCardUI card={cardItem} revealed={true} />
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block font-medium uppercase">Cardholder</span>
                  <span className="font-bold text-chase-navy">{cardItem.cardholder_name || 'Cardholder'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium uppercase">Card Number</span>
                  <span className="font-mono font-bold text-chase-navy">
                    {cardItem.card_number ? cardItem.card_number.replace(/(.{4})/g, '$1 ').trim() : `•••• •••• •••• ${cardItem.card_number_last4}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium uppercase">Expiry</span>
                  <span className="font-bold text-chase-navy">{cardItem.expiry}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium uppercase">CVV / CVC</span>
                  <span className="font-mono font-bold text-chase-navy">{cardItem.cvv || '•••'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for entering / adding virtual card */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-chase-navy">Enter Virtual Card</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your virtual card details to save it to your account.</p>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={formData.cardholder_name}
                onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value })}
                required
              />

              <Input
                label="16-Digit Card Number"
                placeholder="4111 2222 3333 4444"
                value={formData.card_number}
                onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                maxLength="19"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Month (MM)"
                  placeholder="08"
                  value={formData.expiry_month}
                  onChange={(e) => setFormData({ ...formData, expiry_month: e.target.value })}
                  maxLength="2"
                  required
                />
                <Input
                  label="Expiry Year (YYYY)"
                  placeholder="2028"
                  value={formData.expiry_year}
                  onChange={(e) => setFormData({ ...formData, expiry_year: e.target.value })}
                  maxLength="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CVV / CVC"
                  placeholder="123"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  maxLength="4"
                  required
                />

                <div>
                  <label className="block text-sm font-bold text-chase-navy mb-1 uppercase tracking-wider">
                    Card Network
                  </label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-chase-border focus:ring-2 focus:ring-chase-blue focus:outline-none text-chase-navy bg-white"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">MasterCard</option>
                    <option value="american_express">American Express</option>
                    <option value="discover">Discover</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="secondary" type="button" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="flex-1">
                  Save Card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualCardPage;
