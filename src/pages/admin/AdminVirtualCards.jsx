import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CreditCard, Eye, EyeOff, Search, RefreshCw, ShieldAlert } from 'lucide-react';

const AdminVirtualCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullDetails, setShowFullDetails] = useState({});

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await api.get('?action=admin_get_virtual_cards');
      if (response.data.status === 'success') {
        setCards(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch virtual cards');
      }
    } catch (error) {
      toast.error('Failed to fetch virtual cards');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowDetails = (id) => {
    setShowFullDetails((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredCards = cards.filter((card) => {
    const term = searchTerm.toLowerCase();
    return (
      (card.full_name && card.full_name.toLowerCase().includes(term)) ||
      (card.email && card.email.toLowerCase().includes(term)) ||
      (card.cardholder_name && card.cardholder_name.toLowerCase().includes(term)) ||
      (card.account_number && card.account_number.toLowerCase().includes(term)) ||
      (card.card_number && card.card_number.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-chase-navy">User Virtual Cards</h1>
          <p className="text-gray-500">View and manage virtual cards entered and saved by bank users.</p>
        </div>
        <button
          onClick={fetchCards}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-chase-border rounded-xl text-chase-navy hover:bg-gray-50 font-bold transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-chase-border shadow-sm flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by user name, email, cardholder name, account number, or card number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none text-chase-navy font-medium placeholder-gray-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 italic">Loading virtual cards...</div>
        ) : filteredCards.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-lg text-chase-navy">No Virtual Cards Found</p>
            <p className="text-sm text-gray-400 mt-1">No virtual card records match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-chase-border text-xs uppercase font-bold text-gray-400 tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Cardholder</th>
                  <th className="p-4">Card Number</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">CVV</th>
                  <th className="p-4">Network</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chase-border text-sm">
                {filteredCards.map((card) => {
                  const isRevealed = !!showFullDetails[card.id];
                  const formattedNumber = card.card_number
                    ? card.card_number.replace(/(.{4})/g, '$1 ').trim()
                    : `•••• •••• •••• ${card.card_number_last4}`;

                  return (
                    <tr key={card.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-chase-navy">{card.full_name}</div>
                        <div className="text-xs text-gray-400">{card.email}</div>
                        <div className="text-xs font-mono text-chase-blue mt-0.5">Acc: {card.account_number}</div>
                      </td>

                      <td className="p-4 font-bold text-chase-navy">
                        {card.cardholder_name || 'Cardholder'}
                      </td>

                      <td className="p-4 font-mono font-bold text-chase-navy tracking-wider">
                        {isRevealed ? formattedNumber : `•••• •••• •••• ${card.card_number_last4}`}
                      </td>

                      <td className="p-4 font-bold text-chase-navy">
                        {card.expiry}
                      </td>

                      <td className="p-4 font-mono font-bold text-chase-navy">
                        {isRevealed ? (card.cvv || '•••') : '•••'}
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-chase-light text-chase-blue font-bold rounded-full text-xs uppercase">
                          {card.network || 'Visa'}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-gray-500">
                        {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleShowDetails(card.id)}
                          className="px-3 py-1.5 bg-chase-navy hover:bg-chase-blue text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff size={14} /> Hide
                            </>
                          ) : (
                            <>
                              <Eye size={14} /> View
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVirtualCards;
