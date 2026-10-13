import React, { useState, useEffect } from 'react';
import { CreditCard, Bitcoin, ArrowRight, ShieldCheck, Copy, CheckCircle2, Upload, AlertCircle, Plus, Eye, EyeOff, Lock, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import VirtualCardUI from '../../components/cards/VirtualCardUI';

const Deposit = () => {
  const [method, setMethod] = useState(null); // 'card' | 'crypto'
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Method / Card Check, 2: Crypto Details & Receipt Upload, 3: Success Confirmation

  // Card details visibility & PIN prompt modal state
  const [unmaskedCardIds, setUnmaskedCardIds] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [targetCardId, setTargetCardId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);

  // Add Card modal on deposit page
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [cardFormData, setCardFormData] = useState({
    cardholder_name: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    network: 'visa'
  });

  // Crypto receipt
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const BTC_ADDRESS = 'bc1q02jp6lut3qrjs746q7xtjdz4me29erg5weyukn';

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoadingCards(true);
    try {
      const res = await api.get('?action=get_user_virtual_cards');
      if (res.data.status === 'success') {
        setCards(res.data.data || []);
      } else {
        setCards([]);
      }
    } catch (e) {
      console.error('Failed to fetch cards', e);
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const handleToggleSeeCard = (cardId) => {
    if (unmaskedCardIds.includes(cardId)) {
      setUnmaskedCardIds(unmaskedCardIds.filter((id) => id !== cardId));
    } else {
      setTargetCardId(cardId);
      setPinInput('');
      setShowPinModal(true);
    }
  };

  const handleVerifyPinSubmit = async (e) => {
    e.preventDefault();
    if (!pinInput) return toast.error('Please enter your transaction PIN');

    setVerifyingPin(true);
    try {
      const res = await api.post('?action=verify_pin', { pin: pinInput });
      if (res.data.status === 'success') {
        toast.success('PIN verified');
        setUnmaskedCardIds((prev) => [...prev, targetCardId]);
        setShowPinModal(false);
        setPinInput('');
      } else {
        toast.error(res.data.message || 'Invalid PIN');
      }
    } catch (err) {
      toast.error('PIN verification failed');
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleAddCardSubmit = async (e) => {
    e.preventDefault();

    let expM = cardFormData.expiry_month;
    let expY = cardFormData.expiry_year;

    if (expM.includes('/')) {
      const parts = expM.split('/');
      expM = parts[0].trim();
      expY = parts[1].trim();
      if (expY.length === 2) expY = '20' + expY;
    }

    if (!cardFormData.card_number || !cardFormData.cvv || !expM || !expY) {
      return toast.error('Please fill in all card details');
    }

    setSavingCard(true);
    try {
      const response = await api.post('?action=save_virtual_card', {
        cardholder_name: cardFormData.cardholder_name,
        card_number: cardFormData.card_number,
        cvv: cardFormData.cvv,
        expiry_month: parseInt(expM, 10),
        expiry_year: parseInt(expY, 10),
        network: cardFormData.network
      });

      if (response.data.status === 'success') {
        toast.success('Card added successfully!');
        setShowAddCardModal(false);
        setCardFormData({
          cardholder_name: '',
          card_number: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
          network: 'visa'
        });
        fetchCards();
      } else {
        toast.error(response.data.message || 'Failed to add card');
      }
    } catch (error) {
      toast.error('An error occurred while adding card');
    } finally {
      setSavingCard(false);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');

    if (method === 'card') {
      if (cards.length === 0) {
        toast.error('Please add a card first to pay with card or select Crypto deposit.');
        setShowAddCardModal(true);
        return;
      }
      setLoading(true);
      try {
        const res = await api.post('?action=deposit', {
          method: 'card',
          amount: parseFloat(amount)
        });
        if (res.data.status === 'success') {
          setStep(3);
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error('Deposit failed');
      } finally {
        setLoading(false);
      }
    } else if (method === 'crypto') {
      setStep(2);
    }
  };

  const handleCryptoReceiptSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile && !receiptUrl) {
      return toast.error('Please upload your payment receipt');
    }

    setLoading(true);
    try {
      const res = await api.post('?action=upload_swap_receipt', {
        receipt_url: receiptUrl || 'https://cloudinary.com/receipt.jpg',
        amount: parseFloat(amount)
      });
      if (res.data.status === 'success') {
        toast.success('Crypto payment receipt submitted for admin review!');
        setStep(3);
      } else {
        toast.error(res.data.message || 'Failed to upload receipt');
      }
    } catch (err) {
      toast.error('Failed to submit receipt');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatCardGroup = (num) => {
    if (!num) return '';
    const clean = num.replace(/\s+/g, '');
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-chase-navy">Fund Account</h1>
        <p className="text-gray-500">Deposit funds directly into your CitiGate Bank USD account</p>
      </div>

      <div className="bg-white rounded-3xl border border-chase-border shadow-xl overflow-hidden">
        {step === 1 && (
          <div className="p-8 space-y-8">
            {/* Card Check Banner & Saved Cards */}
            {!loadingCards && cards.length === 0 ? (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-chase-blue rounded-xl">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-chase-navy">No Saved Cards Found</h3>
                    <p className="text-xs text-gray-600">
                      You do not have a saved card. You can add one now or deposit funds via BTC Crypto.
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowAddCardModal(true)} className="whitespace-nowrap text-xs py-2.5 px-4">
                  <Plus size={16} className="mr-1" /> Add Card
                </Button>
              </div>
            ) : cards.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-chase-navy text-lg">Your Saved Cards</h3>
                  <Button variant="secondary" onClick={() => setShowAddCardModal(true)} className="text-xs py-2 px-3">
                    <Plus size={14} className="mr-1" /> Add Card
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cards.map((card) => {
                    const isRevealed = unmaskedCardIds.includes(card.id);
                    return (
                      <div key={card.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 shadow-sm">
                        <VirtualCardUI card={card} revealed={isRevealed} />

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                            <span className="text-gray-500 font-semibold uppercase">Card Number</span>
                            <span className="font-mono font-bold text-chase-navy">
                              {isRevealed
                                ? formatCardGroup(card.card_number)
                                : `•••• •••• •••• ${card.card_number_last4}`}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Expiry</span>
                              <span className="font-bold text-chase-navy">{isRevealed ? card.expiry : '••/••'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="text-gray-400 block text-[10px] uppercase font-semibold">CVV</span>
                              <span className="font-mono font-bold text-chase-navy">{isRevealed ? card.cvv : '•••'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleSeeCard(card.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-gray-100 border border-gray-200 text-chase-navy rounded-xl font-bold text-xs transition-colors"
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff size={14} /> Hide Details
                              </>
                            ) : (
                              <>
                                <Eye size={14} /> See Card Details (PIN required)
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Deposit Method Selection */}
            <div className="space-y-4">
              <h3 className="font-bold text-chase-navy text-lg">Select Deposit Option</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${
                    method === 'card' ? 'border-chase-blue bg-chase-light/30 ring-1 ring-chase-blue' : 'border-gray-100 hover:border-chase-blue/50 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-block ${method === 'card' ? 'bg-chase-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-chase-navy">Debit/Credit Card</p>
                    <p className="text-xs text-gray-500">Deposit instantly using your saved card</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('crypto')}
                  className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${
                    method === 'crypto' ? 'border-chase-blue bg-chase-light/30 ring-1 ring-chase-blue' : 'border-gray-100 hover:border-chase-blue/50 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl inline-block ${method === 'crypto' ? 'bg-chase-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Bitcoin size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-chase-navy">Add Funds via Crypto (BTC)</p>
                    <p className="text-xs text-gray-500">Pay in BTC & upload receipt for admin approval</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Form when method selected */}
            {method && (
              <form onSubmit={handleDepositSubmit} className="space-y-6 animate-fade-in border-t border-gray-100 pt-6">
                <Input
                  label="Amount to Deposit (USD)"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />

                <div className="bg-chase-light/50 p-4 rounded-xl flex gap-3 items-center border border-chase-border">
                  <ShieldCheck className="text-chase-blue" size={20} />
                  <p className="text-xs text-chase-navy/70 font-medium">
                    {method === 'card'
                      ? 'Securely processed and encrypted via your saved payment card.'
                      : 'Crypto payment will generate a BTC address & reference for admin review.'}
                  </p>
                </div>

                <Button type="submit" className="w-full py-4 text-lg font-bold" loading={loading}>
                  {method === 'card' ? 'Deposit Now' : 'Proceed to Payment Address'} <ArrowRight className="ml-2" size={20} />
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Step 2: Crypto Details & Receipt Upload */}
        {step === 2 && (
          <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-chase-navy">BTC Crypto Deposit</h2>
                <p className="text-xs text-gray-500">Send exactly <span className="font-bold text-chase-blue">${amount}</span> equivalent in BTC</p>
              </div>
              <Button variant="ghost" onClick={() => setStep(1)} className="text-xs text-gray-500">Change Amount</Button>
            </div>

            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bitcoin Deposit Address (BTC)</p>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 font-mono text-sm font-bold text-chase-navy break-all gap-2">
                <span>{BTC_ADDRESS}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(BTC_ADDRESS)}
                  className="p-2 text-chase-blue hover:text-chase-navy hover:bg-gray-50 rounded-lg transition-colors shrink-0"
                  title="Copy BTC Address"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                ⚠️ Send only BTC to this deposit address. Ensure you upload your payment receipt below so our admin team can verify and credit your balance.
              </p>
            </div>

            {/* Receipt Upload Form */}
            <form onSubmit={handleCryptoReceiptSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-chase-navy uppercase tracking-wider">
                  Upload Payment Receipt / Proof of Transfer *
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setReceiptFile(e.target.files[0]);
                        setReceiptUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center group-hover:border-chase-blue transition-all bg-gray-50/50">
                    <Upload className="mx-auto text-gray-400 group-hover:text-chase-blue mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-700">
                      {receiptFile ? `Selected: ${receiptFile.name}` : 'Click or drop payment receipt screenshot here'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WEBP or PDF</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setStep(1)} className="flex-1 text-gray-500">
                  Back
                </Button>
                <Button type="submit" loading={loading} className="flex-1 py-3 font-bold">
                  Submit Receipt for Approval
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="p-12 text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-chase-navy">
              Deposit {method === 'card' ? 'Successful' : 'Submitted for Approval'}!
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {method === 'card'
                ? `Your deposit of $${amount} via card has been processed successfully.`
                : `Your crypto deposit request of $${amount} and receipt have been submitted. An admin will review and approve your deposit shortly.`}
            </p>
            <Button onClick={() => window.location.href = '/dashboard'} className="w-full max-w-sm mx-auto">
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in duration-200 text-center">
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-chase-light text-chase-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>

            <h2 className="text-2xl font-bold text-chase-navy mb-2">Enter Transaction PIN</h2>
            <p className="text-xs text-gray-500 mb-6">Please enter your 4-digit PIN to unmask and reveal complete card details.</p>

            <form onSubmit={handleVerifyPinSubmit} className="space-y-6">
              <Input
                type="password"
                placeholder="••••"
                maxLength="4"
                className="text-center font-mono text-2xl tracking-[0.5em]"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                required
                autoFocus
              />

              <div className="flex gap-3">
                <Button variant="secondary" type="button" className="flex-1" onClick={() => setShowPinModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={verifyingPin} className="flex-1">
                  Verify PIN
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in duration-200">
            <button
              onClick={() => setShowAddCardModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-chase-navy">Add Card</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your card details to save it to your account.</p>
            </div>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={cardFormData.cardholder_name}
                onChange={(e) => setCardFormData({ ...cardFormData, cardholder_name: e.target.value })}
                required
              />

              <Input
                label="16-Digit Card Number"
                placeholder="4111 2222 3333 4444"
                value={cardFormData.card_number}
                onChange={(e) => setCardFormData({ ...cardFormData, card_number: e.target.value })}
                maxLength="19"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry Month (MM)"
                  placeholder="08"
                  value={cardFormData.expiry_month}
                  onChange={(e) => setCardFormData({ ...cardFormData, expiry_month: e.target.value })}
                  maxLength="2"
                  required
                />
                <Input
                  label="Expiry Year (YYYY)"
                  placeholder="2028"
                  value={cardFormData.expiry_year}
                  onChange={(e) => setCardFormData({ ...cardFormData, expiry_year: e.target.value })}
                  maxLength="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CVV / CVC"
                  placeholder="123"
                  type="password"
                  value={cardFormData.cvv}
                  onChange={(e) => setCardFormData({ ...cardFormData, cvv: e.target.value })}
                  maxLength="4"
                  required
                />

                <div>
                  <label className="block text-sm font-bold text-chase-navy mb-1 uppercase tracking-wider">
                    Card Network
                  </label>
                  <select
                    value={cardFormData.network}
                    onChange={(e) => setCardFormData({ ...cardFormData, network: e.target.value })}
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
                <Button variant="secondary" type="button" className="flex-1" onClick={() => setShowAddCardModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={savingCard} className="flex-1">
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

export default Deposit;
