import React from 'react';

export default function TakeawayPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl font-black text-stone-950 dark:text-white tracking-tighter uppercase leading-none mb-1">
            Takeaway <span className="text-primary italic">Orders</span>
          </h1>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mt-1.5">Manage takeaway and parcel orders</p>
        </div>
      </div>
    </div>
  );
}
