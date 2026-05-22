import { Calendar } from 'lucide-react';

export default function SupplierTermineTab({ supplierId }) {
  return (
    <div className="py-16 text-center text-muted">
      <Calendar size={32} className="text-brand/40 mx-auto mb-3" />
      <p className="text-sm leading-relaxed max-w-xs mx-auto">
        Order-Termine für diesen Lieferanten kommen im nächsten Update.
      </p>
    </div>
  );
}
