'use client'
import { useState } from 'react';
import { Zap, Sparkles, ShoppingBag, Percent, Truck, Smartphone, Gift } from 'lucide-react';

export default function FalaaDealsComponent() {
  const [selectedDeal, setSelectedDeal] = useState<{ id: number; name: string; value: string; description: string; icon: any; color: string } | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const deals = [
    {
      id: 1,
      name: 'Flash Discount',
      value: '25% OFF',
      description: 'Get an instant 25% discount on any iPhone 15 series gadgets!',
      icon: Percent,
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 2,
      name: 'Tech Enthusiast',
      value: 'Free Shipping',
      description: 'Zero shipping fees on all gadget deliveries nationwide for 48 hours.',
      icon: Truck,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      id: 3,
      name: 'Accessories Bundle',
      value: 'Buy 1 Get 1',
      description: 'Buy any AirPods case and get a charging cable for free.',
      icon: Smartphone,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      id: 4,
      name: 'Mystery Box',
      value: 'Surprise Gift',
      description: 'Unlock a mystery box with every purchase above $500.',
      icon: Gift,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const handleOpenDeal = (deal: any) => {
    setIsOpening(true);
    setSelectedDeal(deal);
    setShowEmailInput(false);
    setEmail('');
    setTimeout(() => {
      setIsOpening(false);
    }, 1200);
  };

  const handleClaimDeal = () => {
    setShowEmailInput(true);
  };

  const handleSubmitEmail = () => {
    if (email.trim() === '' || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    alert(`Your deal coupon has been sent to ${email}! Check your inbox.`);
    setSelectedDeal(null);
    setEmail('');
    setShowEmailInput(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 sm:p-6 md:p-8 mt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-orange-500 fill-orange-500" />
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
              Falaa <span className="text-orange-500">Deals</span>
            </h1>
          </div>
          <p className="text-slate-600 text-base md:text-xl max-w-2xl mx-auto font-medium">
            Exclusive lightning-fast gadget deals available for a limited time.
            Claim yours before they're gone!
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {deals.map((deal) => {
            const Icon = deal.icon;
            return (
              <div
                key={deal.id}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => handleOpenDeal(deal)}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-gradient-to-br ${deal.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>

                <div className="relative z-10">
                  <div className={`w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br ${deal.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-500 transition-colors">
                    {deal.name}
                  </h3>
                  <div className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    {deal.value}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {deal.description}
                  </p>

                  <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold group-hover:bg-orange-500 transition-colors flex items-center justify-center gap-2">
                    Claim Deal
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 opacity-10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-black mb-6 leading-tight">
                Don't Miss Out on <br /> The Best Tech Prices
              </h2>
              <div className="space-y-4">
                {[
                  'Real-time updates on hot gadgets',
                  'Exclusive access for registered users',
                  'Verified quality assurance on all deals'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                      <Zap size={12} className="text-white fill-white" />
                    </div>
                    <span className="text-gray-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl text-center">
                <p className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-2">New Deals Every</p>
                <div className="text-6xl font-black text-white italic">24H</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Modal */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className={`bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 ${isOpening ? 'scale-110 rotate-3 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}>
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${selectedDeal.color} flex items-center justify-center shadow-2xl animate-bounce`}>
                  {(() => {
                    const Icon = selectedDeal.icon;
                    return <Icon className="w-12 h-12 text-white" />;
                  })()}
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  BOOM! ⚡
                </h2>
                <h3 className="text-xl font-bold text-orange-500 mb-3">
                  {selectedDeal.value}
                </h3>
                <p className="text-slate-600 font-medium mb-8">
                  {selectedDeal.description}
                </p>

                {!showEmailInput ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleClaimDeal}
                      className="w-full bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                    >
                      GET COUPON CODE
                    </button>
                    <button
                      onClick={() => setSelectedDeal(null)}
                      className="w-full bg-gray-50 text-slate-400 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                    >
                      Maybe Later
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-left">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Where should we send it?</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl focus:outline-none transition-all font-bold"
                      />
                    </div>
                    <button
                      onClick={handleSubmitEmail}
                      className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-black shadow-xl transition-all"
                    >
                      SEND MY DEAL
                    </button>
                    <button
                      onClick={() => setShowEmailInput(false)}
                      className="text-slate-400 font-bold hover:text-slate-600"
                    >
                      Go Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}