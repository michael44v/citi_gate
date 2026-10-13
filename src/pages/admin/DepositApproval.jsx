import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import { Check, X, ExternalLink, RefreshCw, Clock, ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const DepositApproval = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingDeposits = async () => {
    setLoading(true);
    try {
      const res = await api.get('?action=admin_get_pending_deposits');
      if (res.data.status === 'success') {
        setDeposits(res.data.data || []);
      } else {
        setDeposits([]);
      }
    } catch (err) {
      console.error('Failed to fetch pending deposits', err);
      toast.error('Failed to load pending deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const handleApprove = async (txId) => {
    setProcessingId(txId);
    try {
      const res = await api.post('?action=admin_approve_deposit', { transaction_id: txId });
      if (res.data.status === 'success') {
        toast.success('Deposit approved and credited to user balance!');
        fetchPendingDeposits();
      } else {
        toast.error(res.data.message || 'Failed to approve deposit');
      }
    } catch (err) {
      toast.error('Error approving deposit');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (txId) => {
    const reason = window.prompt('Enter reason for declining deposit (optional):', 'Payment verification failed');
    if (reason === null) return; // User cancelled prompt

    setProcessingId(txId);
    try {
      const res = await api.post('?action=admin_reject_deposit', { transaction_id: txId, reason });
      if (res.data.status === 'success') {
        toast.success('Deposit declined');
        fetchPendingDeposits();
      } else {
        toast.error(res.data.message || 'Failed to decline deposit');
      }
    } catch (err) {
      toast.error('Error declining deposit');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-chase-navy">Deposit Approvals</h1>
          <p className="text-xs text-gray-500">Review, approve or decline pending user card & crypto deposits.</p>
        </div>
        <button
          onClick={fetchPendingDeposits}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-chase-navy rounded-lg text-xs font-bold transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">Loading pending deposits...</div>
        ) : deposits.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-chase-navy">No Pending Deposits</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">All deposit requests have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-chase-border text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Account</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Details / Reference</th>
                  <th className="p-4">Proof / Receipt</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chase-border text-xs">
                {deposits.map((item) => (
                  <tr key={item.transaction_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-chase-navy">{item.full_name}</p>
                        <p className="text-[11px] text-gray-500">{item.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-gray-600">{item.account_number}</td>
                    <td className="p-4">
                      <span className="font-black text-green-600 text-sm">
                        +{formatUSD(item.amount)}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-medium text-chase-navy">{item.narration}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Ref: {item.reference}</p>
                    </td>
                    <td className="p-4">
                      {item.receipt_url ? (
                        <a
                          href={item.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-chase-blue hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          View Proof <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">No file attached</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-[11px]">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.transaction_id)}
                          disabled={processingId === item.transaction_id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleDecline(item.transaction_id)}
                          disabled={processingId === item.transaction_id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositApproval;
